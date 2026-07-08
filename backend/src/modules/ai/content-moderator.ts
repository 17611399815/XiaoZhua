import { Injectable } from '@nestjs/common';
import { ModerationResult } from './ai.dto';

/**
 * 内容审核器
 * 对 DeepSeek API 的输出进行二次审核，过滤不合适的宠物相关内容
 *
 * 审核维度：
 * 1. 危险建议（如推荐有毒食物、有害药物）
 * 2. 不当医疗建议（替代兽医诊断）
 * 3. 暴力/虐待内容
 * 4. 广告/推广内容
 */

@Injectable()
export class ContentModerator {
  // ── 对宠物有毒的食物清单 ──
  private readonly TOXIC_FOODS = [
    '巧克力', '洋葱', '大蒜', '葡萄', '提子', '木糖醇', '咖啡', '茶',
    '酒精', '牛油果', '夏威夷果', '澳洲坚果', '生面团', '酵母',
  ];

  // ── 危险药物/物质 ──
  private readonly DANGEROUS_MEDS = [
    '人用感冒药', '布洛芬', '对乙酰氨基酚', '阿司匹林', '人用止痛药',
    '老鼠药', '蟑螂药', '农药', '杀虫剂',
  ];

  // ── 不当医疗断言模式 ──
  private readonly MEDICAL_DISCLAIMER_TRIGGERS = [
    '肯定没事', '保证能好', '包治', '百分百', '绝对安全',
    '不用看医生', '别去宠物医院', '自己治就行', '不用打疫苗',
  ];

  // ── 暴力和虐待 ──
  private readonly VIOLENCE_KEYWORDS = [
    '打一顿', '使劲打', '往死里打', '虐待', '折磨', '弄死', '打死',
  ];

  // ── 广告/推广 ──
  private readonly AD_PATTERNS = [
    /加微信[：:]\s*\w+/,
    /扫码.*添加/,
    /点击.*购买/,
    /限时.*优惠/,
    /私信.*咨询/,
  ];

  /**
   * 审查 AI 输出内容
   * @param content AI 返回的文本
   * @param originalQuestion 用户原始问题（用于上下文判断）
   */
  moderate(content: string, originalQuestion?: string): ModerationResult {
    const flags: string[] = [];
    let filteredContent = content;

    // ── 1. 检查是否推荐了有毒食物 ──
    const toxicHits = this.TOXIC_FOODS.filter(food =>
      content.includes(food) &&
      // 检查上下文是否为"可以吃"的语境
      this.isRecommendationContext(content, food),
    );
    if (toxicHits.length > 0) {
      flags.push(`toxic_food:${toxicHits.join(',')}`);
      filteredContent = this.appendWarning(filteredContent,
        '\n\n⚠️ 温馨提示：以上提到的某些食物对宠物可能有毒，请在喂食前务必咨询兽医。');
    }

    // ── 2. 检查是否推荐了危险药物 ──
    const dangerousMedHits = this.DANGEROUS_MEDS.filter(med =>
      content.includes(med) && this.isRecommendationContext(content, med),
    );
    if (dangerousMedHits.length > 0) {
      flags.push(`dangerous_med:${dangerousMedHits.join(',')}`);
      filteredContent = this.appendWarning(filteredContent,
        '\n\n⚠️ 重要提醒：人类药物对宠物可能致命，请勿自行给宠物用药，务必在兽医指导下进行。');
    }

    // ── 3. 检查是否有不当医疗断言 ──
    const medicalDisclaimerHits = this.MEDICAL_DISCLAIMER_TRIGGERS.filter(t =>
      content.includes(t),
    );
    if (medicalDisclaimerHits.length > 0) {
      flags.push('medical_disclaimer');
      filteredContent = this.appendWarning(filteredContent,
        '\n\n🏥 温馨提示：以上建议仅供参考，不能替代专业兽医诊断。如宠物出现不适，请及时就医。');
    }

    // ── 4. 检查暴力内容 ──
    const violenceHits = this.VIOLENCE_KEYWORDS.filter(k =>
      content.includes(k),
    );
    if (violenceHits.length > 0) {
      flags.push('violence');
      // 暴力内容直接替换
      filteredContent = '🐾 对待小动物要温柔有耐心哦～建议采用正向激励的方式训练宠物，而不是惩罚。如果有行为问题，可以咨询专业的宠物行为训练师。';
    }

    // ── 5. 检查广告内容 ──
    for (const pattern of this.AD_PATTERNS) {
      if (pattern.test(content)) {
        flags.push('advertisement');
        // 移除广告部分
        filteredContent = filteredContent.replace(pattern, '');
      }
    }

    // ── 6. 始终追加免责声明（如果回答涉及医疗/健康建议） ──
    if (this.containsHealthAdvice(content) && !flags.includes('medical_disclaimer')) {
      filteredContent = this.appendWarning(filteredContent,
        '\n\n💡 小爪提醒：以上内容为AI建议，仅供参考。如宠物出现健康问题，建议及时咨询专业兽医。');
    }

    return {
      is_safe: !flags.includes('violence'), // 只有暴力内容判定为不安全
      flags,
      filtered_content: filteredContent.trim(),
    };
  }

  /**
   * 判断当前上下文是否是"推荐"语境
   * 如果原文说的是"不能吃"、"有毒"，则不算推荐
   */
  private isRecommendationContext(content: string, item: string): boolean {
    const idx = content.indexOf(item);
    if (idx === -1) return false;

    // 取关键词前后 20 个字符作为上下文窗口
    const start = Math.max(0, idx - 20);
    const end = Math.min(content.length, idx + item.length + 20);
    const context = content.substring(start, end);

    // 否定语境不算推荐
    const negationPatterns = ['不能', '不可以', '有毒', '危险', '禁止', '不要', '千万别', '避免', '忌'];
    return !negationPatterns.some(p => context.includes(p));
  }

  /**
   * 判断内容是否包含健康建议
   */
  private containsHealthAdvice(content: string): boolean {
    const healthKeywords = [
      '病', '症状', '治疗', '药', '吃药', '用药', '疫苗', '手术',
      '腹泻', '呕吐', '发烧', '咳嗽', '皮肤', '过敏', '感染',
    ];
    return healthKeywords.some(k => content.includes(k));
  }

  /**
   * 在内容末尾追加警告（避免重复追加）
   */
  private appendWarning(content: string, warning: string): string {
    if (content.includes(warning.trim().substring(0, 15))) {
      return content; // 已有类似警告，不重复追加
    }
    return content + warning;
  }
}
