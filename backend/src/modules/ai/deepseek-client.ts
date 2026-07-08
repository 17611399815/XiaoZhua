import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * DeepSeek API 客户端
 * 兼容 OpenAI 格式的 API 调用
 *
 * 控制输出的手段：
 * 1. temperature: 控制随机性（低=更稳定，高=更有创造性）
 * 2. top_p: 核采样（只从累积概率达 top_p 的token中采样）
 * 3. frequency_penalty: 惩罚重复token，减少重复
 * 4. presence_penalty: 惩罚已出现token，鼓励新话题
 * 5. stop: 停止词列表，遇到则立即停止生成
 * 6. max_tokens: 限制最大输出长度
 */

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stop?: string[];
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: false;
}

export interface DeepSeekResponse {
  id: string;
  choices: {
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class DeepSeekClient {
  private readonly logger = new Logger(DeepSeekClient.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  // ── 输出控制参数（可从环境变量覆盖） ──
  private readonly defaultParams = {
    temperature: 0.7,       // 中等随机性，保证稳定且不过于死板
    top_p: 0.85,            // 核采样阈值
    max_tokens: 1024,       // 最大输出长度
    frequency_penalty: 0.3, // 轻微惩罚重复
    presence_penalty: 0.2,  // 轻微鼓励话题延展
  };

  // ── 停止词：检测到以下模式立即停止生成 ──
  private readonly stopWords = [
    '\n\n\n\n',            // 连续多个空行
    '\n用户：',            // 模型开始模拟用户发言
    '\n主人：',            // 模型开始模拟主人发言
    '\nUser:',             // 英文用户发言
    '\nHuman:',            // 英文用户发言
    '\nAI:',               // 模型开始自称 AI
    '\n小爪：',            // 模型开始自己对话
    '\n\n---\n\n',         // Markdown 分隔线后的内容
    '免责声明：',          // 模型自行追加的免责声明（我们的系统提示词已包含）
    '请注意：以上内容',    // 模型开始自我总结
  ];

  constructor(private configService: ConfigService) {
    // 从环境变量读取配置
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('DEEPSEEK_API_BASE_URL') ||
      'https://api.deepseek.com/v1';
    this.model = this.configService.get<string>('DEEPSEEK_MODEL') ||
      'deepseek-chat';

    // 允许环境变量覆盖默认参数
    const tempEnv = this.configService.get<string>('AI_TEMPERATURE');
    if (tempEnv) this.defaultParams.temperature = parseFloat(tempEnv);
    const topPEnv = this.configService.get<string>('AI_TOP_P');
    if (topPEnv) this.defaultParams.top_p = parseFloat(topPEnv);
    const maxTokensEnv = this.configService.get<string>('AI_MAX_TOKENS');
    if (maxTokensEnv) this.defaultParams.max_tokens = parseInt(maxTokensEnv, 10);

    this.logger.log(`DeepSeek client initialized: model=${this.model}, baseUrl=${this.baseUrl}`);
  }

  /**
   * 检查 API Key 是否已配置
   */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * 发送聊天请求到 DeepSeek API
   */
  async chat(
    messages: DeepSeekMessage[],
    options?: {
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      stop?: string[];
      frequency_penalty?: number;
      presence_penalty?: number;
    },
  ): Promise<DeepSeekResponse> {
    if (!this.isConfigured()) {
      throw new DeepSeekError('DEEPSEEK_API_KEY not configured');
    }

    const body: DeepSeekRequest = {
      model: this.model,
      messages,
      temperature: options?.temperature ?? this.defaultParams.temperature,
      top_p: options?.top_p ?? this.defaultParams.top_p,
      max_tokens: options?.max_tokens ?? this.defaultParams.max_tokens,
      stop: [...this.stopWords, ...(options?.stop ?? [])],
      frequency_penalty: options?.frequency_penalty ?? this.defaultParams.frequency_penalty,
      presence_penalty: options?.presence_penalty ?? this.defaultParams.presence_penalty,
      stream: false,
    };

    const url = `${this.baseUrl}/chat/completions`;

    this.logger.debug(`Calling DeepSeek API: ${url}`);
    this.logger.debug(`Params: temp=${body.temperature}, top_p=${body.top_p}, max_tokens=${body.max_tokens}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000), // 30秒超时
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`DeepSeek API error ${response.status}: ${errorText}`);
        throw new DeepSeekError(
          `API returned ${response.status}: ${errorText.substring(0, 200)}`,
          response.status,
        );
      }

      const data = (await response.json()) as DeepSeekResponse;

      // 日志：记录用量
      if (data.usage) {
        this.logger.log(
          `Token usage: prompt=${data.usage.prompt_tokens}, ` +
          `completion=${data.usage.completion_tokens}, ` +
          `total=${data.usage.total_tokens}`,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof DeepSeekError) throw error;
      if (error instanceof Error) {
        if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
          throw new DeepSeekError('Request timeout (>30s)', 408);
        }
        throw new DeepSeekError(`Network error: ${error.message}`, 0);
      }
      throw error;
    }
  }

  /**
   * 提取响应中的文本内容
   */
  extractContent(response: DeepSeekResponse): string {
    if (!response.choices || response.choices.length === 0) {
      throw new DeepSeekError('Empty response from API');
    }
    return response.choices[0]?.message?.content?.trim() ?? '';
  }
}

/** DeepSeek API 错误 */
export class DeepSeekError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 0) {
    super(message);
    this.name = 'DeepSeekError';
    this.statusCode = statusCode;
  }
}
