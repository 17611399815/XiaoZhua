import { Injectable } from '@nestjs/common';

/**
 * 系统提示词构建器
 * 根据数据库中该用户的宠物信息，动态构建个性化的系统提示词
 *
 * 触发时机：每次调用 DeepSeek API 前
 * 数据来源：Prisma（从数据库实时查询）
 */

export interface PetContextData {
  // 宠物基本信息
  name: string;
  type: string;          // '猫咪' | '狗狗' | '其他'
  breed: string;
  gender: string;        // '男孩' | '女孩'
  weight: number;        // 当前体重(kg)
  birthday: string | null;
  meetDate: Date;
  isNeutered: boolean;
  emoji: string;

  // 最近数据摘要
  daysTogether: number;
  recentWeightRecords?: { weight: number; date: string }[];
  upcomingReminders?: { title: string; date: string; type: string }[];
  recentMedicalRecords?: { title: string; date: string; diagnosis?: string }[];
  stockSummary?: string;       // 库存摘要文字
  recentExpenseSummary?: string; // 最近消费摘要
}

@Injectable()
export class PromptBuilder {
  /**
   * 构建完整的系统提示词
   */
  buildSystemPrompt(pet: PetContextData): string {
    const pronoun = pet.gender === '男孩' ? '他' : '她';

    const sections: string[] = [];

    // ── 第1部分：AI 角色设定（核心约束） ──
    sections.push(this.buildRoleDefinition(pet));

    // ── 第2部分：宠物详细档案 ──
    sections.push(this.buildPetProfile(pet, pronoun));

    // ── 第3部分：健康与医疗数据 ──
    const healthSection = this.buildHealthSection(pet, pronoun);
    if (healthSection) sections.push(healthSection);

    // ── 第4部分：待办提醒 ──
    const reminderSection = this.buildReminderSection(pet);
    if (reminderSection) sections.push(reminderSection);

    // ── 第5部分：行为规范 ──
    sections.push(this.buildBehaviorRules());

    // ── 第6部分：个性化尾注 ──
    sections.push(this.buildPersonalizationNote(pet));

    return sections.join('\n\n');
  }

  /**
   * 构建用户消息前缀（放在用户消息前面，而非系统提示词中）
   * 用于提供当次对话的额外上下文
   */
  buildUserMessagePrefix(pet: PetContextData): string {
    return `[系统上下文] 主人正在和我聊关于宠物"${pet.emoji}${pet.name}"（${pet.breed || pet.type}，${pet.gender}，${pet.weight}kg）的事情。请基于这个宠物的情况来回答。`;
  }

  // ── 以下是各部分的构建方法 ──

  private buildRoleDefinition(pet: PetContextData): string {
    const petTypeLabel = pet.type === '猫咪' ? '猫' : pet.type === '狗狗' ? '狗' : '宠物';

    return `# 角色定义
你是"小爪AI助手"，一个专业、温暖、有爱的${petTypeLabel}养护顾问。

## 核心职责
- 回答${petTypeLabel}相关的养护、健康、饮食、行为、训练等问题
- 基于主人提供的宠物信息给出个性化建议
- 用温暖、鼓励的语气与主人交流
- 在涉及医疗诊断时，始终提醒主人咨询专业兽医

## 身份认同
- 你叫"小爪"，是一个懂${petTypeLabel}的AI助手
- 你关心每一只宠物的健康和幸福
- 你说话亲切但不失专业，像一位经验丰富的宠物医生朋友`;
  }

  private buildPetProfile(pet: PetContextData, pronoun: string): string {
    const ageText = pet.birthday
      ? `，出生于${pet.birthday}`
      : '';
    const neuteredText = pet.isNeutered ? '已绝育' : '未绝育';

    return `# 当前宠物档案
主人正在照顾一只${pet.type}，以下是${pronoun}的详细信息：

| 项目 | 内容 |
|------|------|
| 名字 | ${pet.emoji} ${pet.name} |
| 品种 | ${pet.breed || '未知'} |
| 类型 | ${pet.type} |
| 性别 | ${pet.gender} |
| 体重 | ${pet.weight} kg |
| 绝育 | ${neuteredText} |
| 到家时间 | ${pet.meetDate.toISOString().split('T')[0]}（已相伴 ${pet.daysTogether} 天）${ageText} |

请在回答问题时，结合以上信息给出针对性的建议。例如：
- 如果主人询问喂食量，请根据${pet.weight}kg的体重来估算
- 如果主人询问行为问题，请考虑${pronoun}的${pet.gender === '男孩' ? '公' : '母'}${pet.type}特征
- 如果${neuteredText}，请在相关话题中考虑绝育对宠物代谢和行为的影响`;
  }

  private buildHealthSection(pet: PetContextData, pronoun: string): string | null {
    const parts: string[] = [];
    parts.push('# 健康数据');

    // 体重变化
    if (pet.recentWeightRecords && pet.recentWeightRecords.length >= 2) {
      const records = pet.recentWeightRecords;
      const trend = records[records.length - 1].weight - records[0].weight;
      const trendText = trend > 0.5
        ? `⚠️ 体重呈上升趋势（+${trend.toFixed(1)}kg），注意控制饮食`
        : trend < -0.5
          ? `⚠️ 体重呈下降趋势（${trend.toFixed(1)}kg），需要关注`
          : '体重稳定，保持得不错 👍';

      parts.push(`## 体重趋势\n${trendText}`);
      parts.push(`最近记录：${records.map(r => `${r.date}: ${r.weight}kg`).join('、')}`);
    }

    // 病历
    if (pet.recentMedicalRecords && pet.recentMedicalRecords.length > 0) {
      parts.push(`## 近期病历`);
      pet.recentMedicalRecords.forEach(record => {
        parts.push(`- ${record.date}: ${record.title}${record.diagnosis ? `（诊断：${record.diagnosis}）` : ''}`);
      });
    }

    return parts.length > 1 ? parts.join('\n') : null;
  }

  private buildReminderSection(pet: PetContextData): string | null {
    if (!pet.upcomingReminders || pet.upcomingReminders.length === 0) return null;

    const lines: string[] = ['# 待办提醒'];
    pet.upcomingReminders.forEach(r => {
      const typeLabel: Record<string, string> = {
        vaccine: '💉',
        deworm: '💊',
        bath: '🛁',
        medical: '🏥',
        birthday: '🎂',
        custom: '📌',
      };
      const emoji = typeLabel[r.type] || '📌';
      lines.push(`- ${emoji} ${r.date}: ${r.title}`);
    });

    return lines.join('\n');
  }

  private buildBehaviorRules(): string {
    return `# 行为规范

## 回答原则
1. 个性化优先：始终结合宠物档案中的具体信息回答，而不是给泛泛的建议
2. 安全第一：涉及医疗诊断、用药、急救等问题时，必须在回答中包含"建议咨询专业兽医"
3. 温暖而专业：用亲切、温柔、像朋友聊天一样的语气，拒绝冷冰冰的教科书式回答
4. 简洁有力：回答要聚焦问题，控制长度（除非主人明确要求详细说明）
5. 积极正向：用鼓励和支持的口吻，让主人感到被理解和支持

## 格式规范（极其重要，必须严格遵守）
- 禁止使用任何 Markdown 符号：不要用 ** ** 加粗、不要用 # ## 标题、不要用 * - 列表符号、不要用 | 表格
- 禁止使用任何英文标点包裹的中文加粗，比如 **文字** 或 __文字__
- 换行用自然的空行分隔，不要用符号分隔
- 需要列举时，用"第一、第二、第三"或者用 emoji 引导，例如"🐾 第一点...🐾 第二点..."
- 多用 emoji 表情让回复更生动温暖，但不要过度
- 语气要像朋友聊天，不要像在写文档或写论文

## 语气示例
正确示范：
"豆豆不爱吃饭确实让人担心呢 🥺 金毛这个年龄段有时候会挑食，你可以试试把狗粮用温水泡软，或者拌一点点鸡胸肉增加香味～不过如果超过两天还是不吃，建议带去让兽医看看哦 ❤️"

错误示范：
"**针对狗狗不吃饭的问题，有以下建议：**
1. **检查狗粮**：确认是否变质
2. **观察精神状态**：如有异常及时就医"

## 必须遵守的限制
- 只回答宠物相关的问题，如果主人问到无关话题，礼貌地引导回宠物话题
- 不推荐任何未经科学验证的偏方或民间疗法
- 不提供具体的药物剂量建议（这是兽医的职责）
- 不可以推荐或推销特定品牌的产品
- 不对宠物的寿命、治疗结果做任何保证`;
  }

  private buildPersonalizationNote(pet: PetContextData): string {
    return `# 个性化提示
- 主人已经陪伴${pet.name} ${pet.daysTogether} 天了，请认可主人的用心和付出
- 在合适的时候，可以主动提到${pet.name}的品种特点（${pet.breed || pet.type}）
- 如果今天是特殊日子（生日、到家纪念日），可以送上祝福
- 回答中用"${pet.name}"称呼宠物，用"你"称呼主人`;
  }
}
