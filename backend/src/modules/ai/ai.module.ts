import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { IntentClassifier } from './intent-classifier';
import { ContentModerator } from './content-moderator';
import { PromptBuilder } from './prompt-builder';
import { DeepSeekClient } from './deepseek-client';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    IntentClassifier,
    ContentModerator,
    PromptBuilder,
    DeepSeekClient,
  ],
  exports: [AiService],
})
export class AiModule {}
