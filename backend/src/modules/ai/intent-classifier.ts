import { Injectable } from '@nestjs/common';
import { IntentResult } from './ai.dto';

/**
 * 本地意图分类器
 * 在调用 DeepSeek API 之前先用关键词匹配判断是否为宠物话题
 * 非宠物话题直接返回预设话术，不消耗 API 额度
 *
 * 设计思路：
 * - 采用多级关键词加权策略，而非简单的黑白名单
 * - 强宠物关键词（如"狗粮"、"疫苗"）直接通过
 * - 弱宠物关键词（如"吃"、"生病"）需组合出现才通过
 * - 明确的非宠物话题（如"股票"、"编程"）直接拦截
 */

interface KeywordRule {
  keywords: string[];
  weight: number;       // 单个关键词命中权重
  comboRequired: boolean; // 是否需要与其他关键词组合
  category: string;
}

@Injectable()
export class IntentClassifier {
  // ── 强宠物关键词：出现即通过 ──
  private readonly STRONG_PET_KEYWORDS = [
    // 宠物类型
    '狗', '猫', '狗狗', '猫咪', '小猫', '小狗', '宠物', '喵', '汪', '主子', '毛孩子', '毛小孩',
    '兔子', '仓鼠', '金鱼', '乌龟', '鹦鹉', '龙猫', '刺猬', '蜥蜴', '蛇',
    // 宠物品种
    '金毛', '拉布拉多', '柯基', '柴犬', '哈士奇', '泰迪', '比熊', '博美', '边境牧羊犬', '边牧',
    '英短', '美短', '布偶', '暹罗', '橘猫', '加菲', '缅因', '波斯猫', '蓝猫',
    // 宠物专用术语
    '狗粮', '猫粮', '猫砂', '猫抓板', '逗猫棒', '狗绳', '牵绳', '狗窝', '猫窝',
    '驱虫', '疫苗', '绝育', '狂犬', '细小', '猫瘟', '猫鼻支', '耳螨', '猫癣', '皮肤病',
    '铲屎', '铲屎官', '遛狗', '吸猫', '撸猫', '云养',
    // 宠物品牌常见词
    '皇家', '冠能', '渴望', '巅峰', '爱肯拿', 'now', 'go!', '伯纳天纯', '比瑞吉', '麦富迪',
  ];

  // ── 弱宠物关键词：需组合出现 ──
  private readonly WEAK_PET_KEYWORDS = [
    '吃', '喂', '粮', '食', '喝', '水', '睡', '玩', '咬', '叫', '尿', '拉', '吐',
    '痒', '痛', '病', '药', '医院', '检查', '体检', '洗澡', '美容', '剪毛', '梳毛',
    '训练', '听话', '乱叫', '咬人', '拆家', '抓', '挠', '掉毛', '脱毛', '换毛',
    '胖', '瘦', '重', '体重', '轻', '营养', '补', '钙', '维生素', '零食', '罐头',
    '湿粮', '干粮', '鲜食', '自制', '生骨肉', '益生菌', '鱼油',
  ];

  // ── 非宠物话题关键词：命中则直接拦截 ──
  private readonly NON_PET_KEYWORDS = [
    // 明确无关话题
    '股票', '基金', '理财', '房价', '楼盘', '贷款', '信用卡',
    '编程', '代码', 'python', 'java', '前端', '后端', 'react', 'vue',
    '数学', '物理', '化学', '历史', '地理', '政治', '哲学',
    '汽车', '房产', '装修', '家电', '手机', '电脑',
    '减肥', '健身', '瑜伽', '护肤', '化妆品', '穿搭',
    '游戏', '电竞', 'lol', '王者荣耀', '原神', 'steam',
    '天气', '新闻', '八卦', '明星',
    // 可能利用宠物作为话术跳板的危险话题
    '怎么杀', '毒杀', '虐', '吃狗肉', '狗肉',
  ];

  // ── 宠物紧急/医疗相关，需特殊标记 ──
  private readonly EMERGENCY_KEYWORDS = [
    '吐血', '抽搐', '昏倒', '车祸', '中毒', '吞了', '吃了巧克力', '吃了葡萄',
    '呼吸困难', '站不起来', '一直吐', '一直拉', '不吃不喝', '没精神',
    '被车撞', '摔了', '高处坠落', '骨折',
  ];

  /**
   * 分类用户消息，返回是否为宠物相关话题
   */
  classify(message: string): IntentResult {
    const msg = message.toLowerCase().trim();

    // ── 第0层：紧急情况检测 ──
    const emergencyHit = this.EMERGENCY_KEYWORDS.filter(k => msg.includes(k));
    if (emergencyHit.length > 0) {
      return {
        is_pet_related: true,
        confidence: 1.0,
        category: 'emergency',
        reason: `检测到紧急情况关键词: ${emergencyHit.join(', ')}`,
      };
    }

    // ── 第1层：强宠物关键词检测 ──
    const strongHits = this.STRONG_PET_KEYWORDS.filter(k => msg.includes(k));
    if (strongHits.length > 0) {
      return {
        is_pet_related: true,
        confidence: Math.min(0.7 + strongHits.length * 0.1, 1.0),
        category: 'pet_care',
        reason: `命中强宠物关键词: ${strongHits.join(', ')}`,
      };
    }

    // ── 第2层：非宠物关键词检测 ──
    const nonPetHits = this.NON_PET_KEYWORDS.filter(k => msg.includes(k));
    if (nonPetHits.length > 0) {
      return {
        is_pet_related: false,
        confidence: Math.min(0.7 + nonPetHits.length * 0.1, 1.0),
        category: 'non_pet',
        reason: `命中非宠物关键词: ${nonPetHits.join(', ')}`,
      };
    }

    // ── 第3层：弱宠物关键词组合检测 ──
    const weakHits = this.WEAK_PET_KEYWORDS.filter(k => msg.includes(k));
    if (weakHits.length >= 2) {
      return {
        is_pet_related: true,
        confidence: 0.5 + weakHits.length * 0.1,
        category: 'pet_care',
        reason: `命中多个弱宠物关键词: ${weakHits.join(', ')}`,
      };
    }

    // ── 第4层：模糊情况——短消息且有1个弱关键词，倾向于放行 ──
    if (weakHits.length === 1 && msg.length < 20) {
      return {
        is_pet_related: true,
        confidence: 0.4,
        category: 'pet_care',
        reason: `短消息+1个弱关键词，倾向于放行: ${weakHits[0]}`,
      };
    }

    // ── 第5层：长度极短的消息（可能是问候），放行 ──
    if (msg.length <= 3) {
      return {
        is_pet_related: true,
        confidence: 0.35,
        category: 'ambiguous',
        reason: '消息过短，默认为宠物相关',
      };
    }

    // ── 默认拦截 ──
    return {
      is_pet_related: false,
      confidence: 0.6,
      category: 'unknown',
      reason: '未匹配到任何宠物相关关键词，默认拦截',
    };
  }

  /**
   * 获取预设话术（当意图分类拦截时使用）
   */
  getFallbackResponse(category: string): string {
    const fallbacks: Record<string, string> = {
      non_pet: '🐾 我是小爪AI宠物助手，专门回答养宠相关的问题哦～\n\n你可以问我：\n• 宠物饮食营养建议\n• 疾病预防和健康护理\n• 行为训练技巧\n• 日常护理知识\n\n有什么养宠问题需要帮忙吗？',
      unknown: '🐾 不好意思，我没有理解你的问题。作为宠物助手，我建议你试试问这些：\n\n🍽️ "狗狗每天吃多少合适？"\n🏥 "猫咪疫苗多久打一次？"\n🛁 "怎么给宠物洗澡？"\n💊 "驱虫药怎么选？"\n\n换个方式描述你的宠物问题吧～',
    };
    return fallbacks[category] ?? fallbacks['unknown'];
  }
}
