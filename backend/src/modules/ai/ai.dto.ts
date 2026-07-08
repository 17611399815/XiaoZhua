import { IsString, IsOptional, IsArray, IsIn, MinLength, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/** 发送给 AI 的聊天请求 */
export class ChatRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message: string;

  /** 可选的历史消息（用于多轮对话上下文） */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];

  /** 可选：指定宠物ID，不传则使用当前宠物 */
  @IsOptional()
  @IsString()
  petId?: string;
}

export class ChatMessageDto {
  @IsString()
  @IsIn(['user', 'assistant'])
  role: string;

  @IsString()
  content: string;
}

/** AI 聊天响应 */
export interface ChatResponseDto {
  /** AI 回复内容 */
  reply: string;
  /** 是否被意图分类拦截（非宠物话题） */
  intent_blocked: boolean;
  /** 预设话术类型（intent_blocked=true时有值） */
  fallback_type?: string;
  /** 使用的宠物名称（用于前端展示） */
  pet_name?: string;
  /** token 用量（若 API 返回） */
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/** 意图分类结果 */
export interface IntentResult {
  is_pet_related: boolean;
  confidence: number; // 0-1
  category: string;   // 分类标签
  reason: string;     // 分类原因
}

/** 内容审核结果 */
export interface ModerationResult {
  is_safe: boolean;
  flags: string[];       // 触发的规则标签
  filtered_content?: string; // 过滤后的内容（如果有修正）
}
