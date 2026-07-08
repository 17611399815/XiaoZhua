import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { IntentClassifier } from './intent-classifier';
import { ContentModerator } from './content-moderator';
import { PromptBuilder, PetContextData } from './prompt-builder';
import { DeepSeekClient, DeepSeekMessage } from './deepseek-client';
import {
  ChatRequestDto,
  ChatMessageDto,
  ChatResponseDto,
} from './ai.dto';

/**
 * AI 助手核心服务
 *
 * 请求处理流程：
 * 1. 接收用户消息
 * 2. 从数据库获取当前宠物及关联数据
 * 3. 意图分类 → 非宠物话题直接返回预设话术
 * 4. 构建个性化系统提示词
 * 5. 调用 DeepSeek API
 * 6. 内容审核 → 过滤不合适内容
 * 7. 返回最终回复
 */

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private intentClassifier: IntentClassifier,
    private contentModerator: ContentModerator,
    private promptBuilder: PromptBuilder,
    private deepseekClient: DeepSeekClient,
  ) {}

  /**
   * 处理聊天请求（主入口）
   */
  async chat(userId: string | null, dto: ChatRequestDto): Promise<ChatResponseDto> {
    // ── Step 1: 意图分类 ──
    const intent = this.intentClassifier.classify(dto.message);
    this.logger.log(
      `Intent: isPet=${intent.is_pet_related}, ` +
      `confidence=${intent.confidence}, category=${intent.category}`,
    );

    if (!intent.is_pet_related) {
      return {
        reply: this.intentClassifier.getFallbackResponse(intent.category),
        intent_blocked: true,
        fallback_type: intent.category,
      };
    }

    // ── Step 2: 获取宠物数据 ──
    const pet = await this.getCurrentPetWithContext(userId, dto.petId);
    if (!pet) {
      return {
        reply: '🐾 你还没有添加宠物哦～请先在"我的"页面添加宠物信息，然后我就可以给你更贴心的建议啦！',
        intent_blocked: false,
      };
    }

    // ── Step 3: 构建消息 ──
    const systemPrompt = this.promptBuilder.buildSystemPrompt(pet);
    const userPrefix = this.promptBuilder.buildUserMessagePrefix(pet);

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // 加入历史消息（如果有）
    if (dto.history && dto.history.length > 0) {
      const recentHistory = dto.history.slice(-10); // 最多保留最近5轮对话
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    // 当前用户消息（带宠物上下文前缀）
    messages.push({
      role: 'user',
      content: `${userPrefix}\n\n${dto.message}`,
    });

    // ── Step 4: 调用 DeepSeek API（带降级处理） ──
    let reply: string;
    let usage: ChatResponseDto['usage'];

    try {
      const response = await this.deepseekClient.chat(messages, {
        // 紧急情况使用更低的 temperature 以获得更准确的建议
        temperature: intent.category === 'emergency' ? 0.4 : undefined,
      });
      reply = this.deepseekClient.extractContent(response);

      // ── Step 4.5: 过滤 Markdown 符号 ──
      reply = this.stripMarkdown(reply);
      usage = response.usage
        ? {
            prompt_tokens: response.usage.prompt_tokens,
            completion_tokens: response.usage.completion_tokens,
            total_tokens: response.usage.total_tokens,
          }
        : undefined;
    } catch (error) {
      this.logger.error(`DeepSeek API call failed: ${error}`);
      // 降级：返回预设回复
      return {
        reply: this.getFallbackReply(intent.category, pet),
        intent_blocked: false,
        pet_name: pet.name,
      };
    }

    // ── Step 5: 内容审核 ──
    const moderation = this.contentModerator.moderate(reply, dto.message);
    if (moderation.flags.length > 0) {
      this.logger.warn(`Content flags: ${moderation.flags.join(', ')}`);
    }

    return {
      reply: moderation.filtered_content ?? reply,
      intent_blocked: false,
      pet_name: pet.name,
      usage,
    };
  }

  /**
   * 获取当前宠物的完整上下文数据
   */
  private async getCurrentPetWithContext(
    userId: string | null,
    petId?: string,
  ): Promise<PetContextData | null> {
    // 查询目标宠物：有用户就按用户查，没有用户就取数据库里任意一只
    let pet;
    if (petId) {
      pet = userId
        ? await this.prisma.pet.findFirst({ where: { id: petId, userId } })
        : await this.prisma.pet.findFirst({ where: { id: petId } });
    } else if (userId) {
      pet = await this.prisma.pet.findFirst({
        where: { userId, isCurrent: true },
      });
    } else {
      // 免登录测试模式：取数据库里任意一只
      pet = await this.prisma.pet.findFirst();
    }

    if (!pet) return null;

    // 计算相伴天数
    const daysTogether =
      Math.floor(
        (Date.now() - new Date(pet.meetDate).getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    // 查询最近体重记录（最近4条）
    const weightRecords = await this.prisma.weightRecord.findMany({
      where: { petId: pet.id },
      orderBy: { recordDate: 'desc' },
      take: 4,
    });

    // 查询待办提醒（未来30天）
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const reminders = await this.prisma.reminder.findMany({
      where: {
        petId: pet.id,
        remindDate: { gte: now, lte: futureDate },
        isCompleted: false,
      },
      orderBy: { remindDate: 'asc' },
      take: 5,
    });

    // 查询最近病历（最近3条）
    const medicalRecords = await this.prisma.medicalRecord.findMany({
      where: { petId: pet.id },
      orderBy: { visitDate: 'desc' },
      take: 3,
    });

    // 查询库存摘要
    const stockItems = await this.prisma.stockItem.findMany({
      where: { petId: pet.id },
      take: 10,
    });

    // 查询最近消费
    const expenses = await this.prisma.expense.findMany({
      where: { petId: pet.id },
      orderBy: { expenseDate: 'desc' },
      take: 5,
    });

    return {
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      gender: pet.gender,
      weight: pet.weight,
      birthday: pet.birthday,
      meetDate: pet.meetDate,
      isNeutered: pet.isNeutered,
      emoji: pet.emoji,
      daysTogether,
      recentWeightRecords: weightRecords.reverse().map(w => ({
        weight: w.weight,
        date: w.recordDate.toISOString().split('T')[0],
      })),
      upcomingReminders: reminders.map(r => ({
        title: r.title,
        date: r.remindDate.toISOString().split('T')[0],
        type: r.type,
      })),
      recentMedicalRecords: medicalRecords.map(m => ({
        title: m.title,
        date: m.visitDate.toISOString().split('T')[0],
        diagnosis: m.diagnosis ?? undefined,
      })),
      stockSummary: stockItems.length > 0
        ? stockItems.map(s => `${s.name}（剩${s.remaining}/${s.total}${s.unit}）`).join('、')
        : undefined,
      recentExpenseSummary: expenses.length > 0
        ? `最近消费共${expenses.reduce((s, e) => s + e.amount, 0).toFixed(0)}元：` +
          expenses.map(e => `${e.note || e.category} ¥${e.amount}`).join('、')
        : undefined,
    };
  }

  /**
   * API 调用失败时的降级回复
   */
  private getFallbackReply(category: string, pet: PetContextData): string {
    if (category === 'emergency') {
      return `🚨 ${pet.name}出现紧急情况！请立即采取以下措施：

第一，保持冷静，仔细观察${pet.name}的症状（意识、呼吸、体温等）
第二，立即联系最近的24小时宠物医院
第三，在去医院的路上，可以用毛巾包裹${pet.name}保持温暖
第四，不要自行喂药或催吐

⚠️ 请注意：我是AI助手，无法替代兽医急救。请立即就医！`;
    }

    return `🐾 不好意思，AI服务暂时连接不上～请稍后再试。\n\n在此期间，你可以：\n• 查看"${pet.name}"的健康记录\n• 检查待办提醒\n• 浏览宠物知识库\n\n或者换个问题再问我试试～`;
  }

  /**
   * 过滤 Markdown 格式符号
   * 即使 AI 模型返回了 markdown 格式，也能转成干净的纯文本
   */
  private stripMarkdown(text: string): string {
    let result = text;

    // 去掉 **粗体** → 保留文字
    result = result.replace(/\*\*(.+?)\*\*/g, '$1');
    // 去掉 __粗体__
    result = result.replace(/__(.+?)__/g, '$1');
    // 去掉 *斜体*（但保留中文语境中的 *）
    result = result.replace(/(?<![*])\*([^*\n]+?)\*(?![*])/g, '$1');
    // 去掉 # ## ### 标题标记
    result = result.replace(/^#{1,6}\s+/gm, '');
    // 去掉 - 列表符号（行首的 "  - " 或 "- "）
    result = result.replace(/^[\s]*[-]\s+/gm, '');
    // 去掉 * 列表符号（行首的 " * "）
    result = result.replace(/^[\s]*[*]\s+/gm, '');
    // 去掉数字列表符号 "1. " "2. "
    result = result.replace(/^\d+[.)]\s+/gm, '');
    // 去掉表格分隔线 | --- |
    result = result.replace(/^\|[-:\s|]+\|\s*$/gm, '');
    // 去掉表格两边的 | 管道符
    result = result.replace(/^\|(.+)\|$/gm, '$1');
    // 去掉多余空行（3个及以上换行压缩为2个）
    result = result.replace(/\n{3,}/g, '\n\n');
    // 去掉行首行尾多余空格
    result = result.trim();

    return result;
  }
}
