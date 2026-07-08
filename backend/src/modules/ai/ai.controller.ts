import { Controller, Post, Body, Optional } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatRequestDto } from './ai.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

/**
 * AI 助手 API 控制器
 *
 * 路由前缀: /api/v1/ai
 * 测试阶段免登录，有用户信息时自动关联
 */
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * 发送聊天消息
   *
   * POST /api/v1/ai/chat
   */
  @Public()
  @Post('chat')
  async chat(
    @CurrentUser('id') userId: string | undefined,
    @Body() dto: ChatRequestDto,
  ) {
    return this.aiService.chat(userId || null, dto);
  }
}
