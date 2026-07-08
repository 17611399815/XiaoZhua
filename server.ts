import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── 加载环境变量（优先 .env.local，其次 .env） ──
const envLocal = path.resolve(__dirname, '.env.local');
const envDefault = path.resolve(__dirname, '.env');
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
  console.log('[env] loaded .env.local');
} else if (fs.existsSync(envDefault)) {
  dotenv.config({ path: envDefault });
  console.log('[env] loaded .env');
} else {
  console.log('[env] no .env file found — using process.env');
}

// ═══════════════════════════════════════════
// 小爪App AI 系统 — DeepSeek + 意图分类 + 提示词工程
// ═══════════════════════════════════════════

// ── DeepSeek API 配置 ──
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// ── AI 输出控制参数 ──
const AI_TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE || '0.7');
const AI_TOP_P = parseFloat(process.env.AI_TOP_P || '0.85');
const AI_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || '1024', 10);

// ── 停止词 ──
const STOP_WORDS = [
  '\n\n\n\n', '\n用户：', '\n主人：', '\nUser:', '\nHuman:',
  '\nAI:', '\n小爪：', '\n\n---\n\n', '免责声明：', '请注意：以上内容',
];

// ── 意图分类器（本地关键词匹配，不消耗API额度） ──
const STRONG_PET_KEYWORDS = [
  '狗', '猫', '狗狗', '猫咪', '小猫', '小狗', '宠物', '喵', '汪', '主子', '毛孩子', '毛小孩',
  '兔子', '仓鼠', '金鱼', '乌龟', '鹦鹉', '龙猫', '刺猬', '蜥蜴',
  '金毛', '拉布拉多', '柯基', '柴犬', '哈士奇', '泰迪', '比熊', '博美', '边牧',
  '英短', '美短', '布偶', '暹罗', '橘猫', '加菲', '缅因', '波斯猫', '蓝猫',
  '狗粮', '猫粮', '猫砂', '猫抓板', '逗猫棒', '狗绳', '狗窝', '猫窝',
  '驱虫', '疫苗', '绝育', '狂犬', '细小', '猫瘟', '耳螨', '猫癣',
  '铲屎', '铲屎官', '遛狗', '吸猫', '撸猫',
];

const WEAK_PET_KEYWORDS = [
  '吃', '喂', '粮', '食', '喝', '水', '睡', '玩', '咬', '叫', '尿', '拉', '吐',
  '痒', '痛', '病', '药', '医院', '检查', '体检', '洗澡', '美容', '剪毛',
  '训练', '听话', '乱叫', '咬人', '拆家', '抓', '挠', '掉毛', '脱毛',
  '胖', '瘦', '重', '体重', '营养', '补', '钙', '维生素', '零食', '罐头',
];

const NON_PET_KEYWORDS = [
  '股票', '基金', '理财', '房价', '编程', '代码', 'python', 'java',
  '汽车', '房产', '游戏', '电竞', '减肥', '健身', '护肤', '化妆品', '明星',
];

const EMERGENCY_KEYWORDS = [
  '吐血', '抽搐', '昏倒', '车祸', '中毒', '吞了', '吃了巧克力', '吃了葡萄',
  '呼吸困难', '站不起来', '一直吐', '一直拉', '骨折',
];

function classifyIntent(message: string): { isPetRelated: boolean; category: string; confidence: number } {
  const msg = message.toLowerCase().trim();
  const emHit = EMERGENCY_KEYWORDS.filter(k => msg.includes(k));
  if (emHit.length > 0) return { isPetRelated: true, category: 'emergency', confidence: 1.0 };
  const strongHits = STRONG_PET_KEYWORDS.filter(k => msg.includes(k));
  if (strongHits.length > 0) return { isPetRelated: true, category: 'pet_care', confidence: Math.min(0.7 + strongHits.length * 0.1, 1.0) };
  const nonHits = NON_PET_KEYWORDS.filter(k => msg.includes(k));
  if (nonHits.length > 0) return { isPetRelated: false, category: 'non_pet', confidence: 0.8 };
  const weakHits = WEAK_PET_KEYWORDS.filter(k => msg.includes(k));
  if (weakHits.length >= 2) return { isPetRelated: true, category: 'pet_care', confidence: 0.5 + weakHits.length * 0.1 };
  if (weakHits.length === 1 && msg.length < 20) return { isPetRelated: true, category: 'pet_care', confidence: 0.4 };
  if (msg.length <= 3) return { isPetRelated: true, category: 'ambiguous', confidence: 0.35 };
  return { isPetRelated: false, category: 'unknown', confidence: 0.6 };
}

// ── 提示词构建 ──
function buildSystemPrompt(pet: { name: string; type: string; breed: string; weight: number; gender: string }) {
  return `# 角色定义
你是"小爪AI管家"，一个专业、温暖、有爱的宠物养护顾问。

# 当前宠物档案
- 名字: ${pet.name}
- 类型: ${pet.type}
- 品种: ${pet.breed || '未知'}
- 性别: ${pet.gender}
- 体重: ${pet.weight}kg

# 行为规范
1. 个性化优先：结合宠物档案中的具体信息回答
2. 安全第一：涉及医疗诊断、用药等问题，必须提醒咨询专业兽医
3. 温暖专业：像朋友聊天一样，拒绝冷冰冰的教科书式回答
4. 简洁有力：聚焦问题，控制回答长度在150字内

# 格式规范（严格遵守）
- 禁止使用 Markdown 符号（**, ##, - 列表等）
- 用 emoji 引导要点，如"🐾 第一..."
- 多用 emoji 让回复生动温暖
- 语气像朋友聊天，不要写文档

# 限制
- 只回答宠物相关问题
- 不推荐未经科学验证的偏方
- 不提供具体药物剂量建议
- 不推销特定品牌`;
}

// ── DeepSeek API 调用 ──
async function callDeepSeek(messages: { role: string; content: string }[]): Promise<string> {
  const body = {
    model: DEEPSEEK_MODEL,
    messages,
    temperature: AI_TEMPERATURE,
    top_p: AI_TOP_P,
    max_tokens: AI_MAX_TOKENS,
    stop: STOP_WORDS,
    frequency_penalty: 0.3,
    presence_penalty: 0.2,
    stream: false,
  };

  const resp = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  if (!resp.ok) throw new Error(`DeepSeek API ${resp.status}`);
  const data = await resp.json() as any;
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ── Markdown 清理 ──
function stripMarkdown(text: string): string {
  let result = text;
  result = result.replace(/\*\*(.+?)\*\*/g, '$1');
  result = result.replace(/__(.+?)__/g, '$1');
  result = result.replace(/(?<![*])\*([^*\n]+?)\*(?![*])/g, '$1');
  result = result.replace(/^#{1,6}\s+/gm, '');
  result = result.replace(/^[\s]*[-]\s+/gm, '');
  result = result.replace(/^\d+[.)]\s+/gm, '');
  result = result.replace(/^\|(.+)\|$/gm, '$1');
  result = result.replace(/\n{3,}/g, '\n\n');
  return result.trim();
}

// Mobile Client Data Store
const appWeights = [
  { id: "w-1", petId: "p-1", weight: 24.8, recordDate: "2026-06-01" },
  { id: "w-2", petId: "p-1", weight: 25.4, recordDate: "2026-06-15" },
  { id: "w-3", petId: "p-2", weight: 4.0, recordDate: "2026-06-01" },
  { id: "w-4", petId: "p-2", weight: 4.2, recordDate: "2026-06-20" }
];

const appReminders = [
  { id: "r-1", petId: "p-1", title: "狂犬疫苗接种", date: "2026-07-06", type: "vaccine", done: false },
  { id: "r-2", petId: "p-1", title: "体内驱虫", date: "2026-07-15", type: "deworm", done: false },
  { id: "r-3", petId: "p-2", title: "洗澡美容", date: "2026-07-04", type: "bath", done: true }
];

const appExpenses = [
  { id: "exp-1", petId: "p-1", category: "food", amount: 299, recordDate: "2026-06-10", notes: "囤货猫粮" },
  { id: "exp-2", petId: "p-1", category: "medical", amount: 150, recordDate: "2026-06-12", notes: "驱虫药" },
  { id: "exp-3", petId: "p-2", category: "snack", amount: 59.9, recordDate: "2026-06-18", notes: "猫罐头" }
];

const appNotes = [
  { id: "n-1", petId: "p-1", title: "今天旺财学会握手啦！", content: "用冻干零食训练了十分钟，超级聪明，一教就会。奖励了好多肉干！", recordDate: "2026-06-28" },
  { id: "n-2", petId: "p-2", title: "咪咪今天有点傲娇", content: "新买 of 逗猫棒玩了两下就不理人了，钻进纸箱里呼呼大睡。真是一只高冷的猫咪。", recordDate: "2026-06-29" }
];

const appStocks = [
  { id: "st-1", name: "比乐无谷猫粮 10kg", category: "food", remaining: 1.5, total: 10.0, unit: "kg" },
  { id: "st-2", name: "冻干鸡肉粒 500g", category: "snack", remaining: 450, total: 500, unit: "g" },
  { id: "st-3", name: "豆腐猫砂 6L", category: "supplies", remaining: 0, total: 6, unit: "包" }
];

// In-memory Mock Database
const users = [
  {
    id: "u-1",
    phone: "13800138000",
    nickname: "旺财麻麻",
    role: "user",
    status: "active",
    created_at: "2026-01-15T08:00:00Z",
    pets: [
      { id: "p-1", name: "旺财", type: "狗狗", breed: "金毛", gender: "男孩", weight: 25.4, emoji: "🐶", meetDate: "2024-05-10", daysTogether: 780 },
      { id: "p-2", name: "咪咪", type: "猫咪", breed: "美短", gender: "女孩", weight: 4.2, emoji: "🐱", meetDate: "2025-02-14", daysTogether: 145 }
    ]
  },
  {
    id: "u-2",
    phone: "13912345678",
    nickname: "喵星人守护者",
    role: "user",
    status: "active",
    created_at: "2026-03-22T12:30:00Z",
    pets: [
      { id: "p-3", name: "雪球", type: "猫咪", breed: "布偶", gender: "女孩", weight: 5.1, emoji: "🐱", meetDate: "2025-06-01", daysTogether: 400 }
    ]
  },
  {
    id: "u-3",
    phone: "15088888888",
    nickname: "小爪首席铲屎官",
    role: "admin",
    status: "active",
    created_at: "2026-05-01T09:00:00Z",
    pets: []
  }
];

const products = [
  { id: "prod-1", name: "无谷全价全期猫粮 10kg", category: "food", price: 299.00, stock: 150, is_on_sale: true, emoji: "🦴", description: "精选优质肉源，高蛋白，无谷低敏。", image_url: "" },
  { id: "prod-2", name: "冻干鸡肉粒宠物零食 500g", category: "snack", price: 59.90, stock: 450, is_on_sale: true, emoji: "🍖", description: "低温冷冻干燥技术，保留新鲜营养，酥脆可口。", image_url: "" },
  { id: "prod-3", name: "剑麻耐磨猫抓板 L号", category: "supplies", price: 39.00, stock: 80, is_on_sale: true, emoji: "🛹", description: "天然环保剑麻，不飞屑，保护家具。", image_url: "" },
  { id: "prod-4", name: "电动趣味逗猫棒", category: "toy", price: 29.90, stock: 120, is_on_sale: true, emoji: "🎾", description: "不规则旋转，红外感应，猫咪的最爱。", image_url: "" },
  { id: "prod-5", name: "宠物体内外一体驱虫药", category: "medicine", price: 88.00, stock: 200, is_on_sale: true, emoji: "💊", description: "快速起效，全面驱杀体内外寄生虫。", image_url: "" },
  { id: "prod-6", name: "赖氨酸宠物营养膏 120g", category: "supplement", price: 49.00, stock: 180, is_on_sale: true, emoji: "🧪", description: "补充成长所需赖氨酸，增强自体免疫，活性因子呵护猫咪鼻支。", image_url: "" },
  { id: "prod-7", name: "深海高纯度 Omega-3 鱼油 100粒", category: "supplement", price: 128.00, stock: 95, is_on_sale: true, emoji: "🐟", description: "高含量EPA/DHA，护肤美毛，爆毛亮眼，强韧宠物全身骨骼关节。", image_url: "" }
];

const orders = [
  {
    id: "ord-1",
    user: { phone: "13800138000" },
    total_amount: 358.90,
    status: "paid",
    created_at: "2026-06-30T14:22:00Z",
    updated_at: "2026-06-30T14:25:00Z",
    items: [
      { id: "item-1", product: { name: "无谷全价全期猫粮 10kg" }, price: 299.00, quantity: 1 },
      { id: "item-2", product: { name: "冻干鸡肉粒宠物零食 500g" }, price: 59.90, quantity: 1 }
    ]
  },
  {
    id: "ord-2",
    user: { phone: "13912345678" },
    total_amount: 39.00,
    status: "pending",
    created_at: "2026-07-02T10:15:00Z",
    updated_at: "2026-07-02T10:15:00Z",
    items: [
      { id: "item-3", product: { name: "剑麻耐磨猫抓板 L号" }, price: 39.00, quantity: 1 }
    ]
  },
  {
    id: "ord-3",
    user: { phone: "13800138000" },
    total_amount: 117.90,
    status: "completed",
    created_at: "2026-06-15T09:00:00Z",
    updated_at: "2026-06-16T18:30:00Z",
    items: [
      { id: "item-4", product: { name: "电动趣味逗猫棒" }, price: 29.90, quantity: 1 },
      { id: "item-5", product: { name: "宠物体内外一体驱虫药" }, price: 88.00, quantity: 1 }
    ]
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // ──────────────────────── API ROUTES ────────────────────────

  // Get source code file contents for the Flutter workspace tree
  app.get('/api/v1/source-code', (req, res) => {
    const relativePath = req.query.path as string;
    if (!relativePath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }
    // Prevent directory traversal
    if (relativePath.includes('..') || relativePath.startsWith('/')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const fullPath = path.join(__dirname, relativePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      res.json({ code: 200, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Login
  app.post('/api/v1/admin/login', (req, res) => {
    const { username } = req.body;
    res.json({
      code: 200,
      message: 'success',
      data: {
        token: 'mock-admin-jwt-token-xyz-123456',
        user: {
          id: 'admin-1',
          username: username || 'admin',
          role: 'admin'
        }
      }
    });
  });

  // Get Stats
  app.get('/api/v1/admin/dashboard/stats', (req, res) => {
    const totalUsers = users.length;
    let totalPets = 0;
    users.forEach(u => {
      totalPets += (u.pets || []).length;
    });
    const totalOrders = orders.length;
    let totalRevenue = 0;
    orders.forEach(o => {
      if (o.status !== 'cancelled') {
        totalRevenue += o.total_amount;
      }
    });

    res.json({
      code: 200,
      message: 'success',
      data: {
        totalUsers,
        totalPets,
        totalOrders,
        totalRevenue
      }
    });
  });

  // Users List
  app.get('/api/v1/admin/users', (req, res) => {
    const page = parseInt(req.query.page as string || '1', 10);
    const size = parseInt(req.query.size as string || '20', 10);
    const keyword = String(req.query.keyword || '').trim().toLowerCase();

    let filtered = [...users];
    if (keyword) {
      filtered = filtered.filter(u => 
        u.phone.includes(keyword) || 
        (u.nickname && u.nickname.toLowerCase().includes(keyword))
      );
    }
    const total = filtered.length;
    const start = (page - 1) * size;
    const paginated = filtered.slice(start, start + size);

    res.json({
      code: 200,
      message: 'success',
      data: paginated,
      pagination: {
        total,
        current: page,
        pageSize: size
      }
    });
  });

  // User Detail
  app.get('/api/v1/admin/users/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    res.json({
      code: 200,
      message: 'success',
      data: user
    });
  });

  // Update User Role
  app.put('/api/v1/admin/users/:id/role', (req, res) => {
    const { role } = req.body;
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    user.role = role || 'user';
    res.json({
      code: 200,
      message: 'success',
      data: user
    });
  });

  // Products List
  app.get('/api/v1/admin/products', (req, res) => {
    const page = parseInt(req.query.page as string || '1', 10);
    const size = parseInt(req.query.size as string || '20', 10);
    const keyword = String(req.query.keyword || '').trim().toLowerCase();

    let filtered = [...products];
    if (keyword) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(keyword));
    }
    const total = filtered.length;
    const start = (page - 1) * size;
    const paginated = filtered.slice(start, start + size);

    res.json({
      code: 200,
      message: 'success',
      data: paginated,
      pagination: {
        total,
        current: page,
        pageSize: size
      }
    });
  });

  // Create Product
  app.post('/api/v1/admin/products', (req, res) => {
    const dto = req.body;
    const newProduct = {
      id: 'prod-' + Date.now(),
      name: dto.name,
      emoji: dto.emoji || '📦',
      category: dto.category,
      price: Number(dto.price || 0),
      stock: Number(dto.stock || 0),
      is_on_sale: dto.is_on_sale !== undefined ? dto.is_on_sale : true,
      description: dto.description || '',
      image_url: dto.image_url || ''
    };
    products.push(newProduct);
    res.json({
      code: 201,
      message: 'success',
      data: newProduct
    });
  });

  // Update Product
  app.put('/api/v1/admin/products/:id', (req, res) => {
    const dto = req.body;
    const prod = products.find(p => p.id === req.params.id);
    if (!prod) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }
    if (dto.name !== undefined) prod.name = dto.name;
    if (dto.emoji !== undefined) prod.emoji = dto.emoji;
    if (dto.category !== undefined) prod.category = dto.category;
    if (dto.price !== undefined) prod.price = Number(dto.price);
    if (dto.stock !== undefined) prod.stock = Number(dto.stock);
    if (dto.is_on_sale !== undefined) prod.is_on_sale = dto.is_on_sale;
    if (dto.description !== undefined) prod.description = dto.description;
    if (dto.image_url !== undefined) prod.image_url = dto.image_url;

    res.json({
      code: 200,
      message: 'success',
      data: prod
    });
  });

  // Delete Product
  app.delete('/api/v1/admin/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }
    products.splice(index, 1);
    res.json({
      code: 200,
      message: 'success',
      data: {}
    });
  });

  // Orders List
  app.get('/api/v1/admin/orders', (req, res) => {
    const page = parseInt(req.query.page as string || '1', 10);
    const size = parseInt(req.query.size as string || '20', 10);
    const status = String(req.query.status || '');

    let filtered = [...orders];
    if (status) {
      filtered = filtered.filter(o => o.status === status);
    }
    const total = filtered.length;
    const start = (page - 1) * size;
    const paginated = filtered.slice(start, start + size);

    res.json({
      code: 200,
      message: 'success',
      data: paginated,
      pagination: {
        total,
        current: page,
        pageSize: size
      }
    });
  });

  // Order Detail
  app.get('/api/v1/admin/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }
    res.json({
      code: 200,
      message: 'success',
      data: order
    });
  });

  // Update Order Status
  app.put('/api/v1/admin/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }
    order.status = status;
    res.json({
      code: 200,
      message: 'success',
      data: order
    });
  });

  // Pets List
  app.get('/api/v1/admin/pets', (req, res) => {
    const page = parseInt(req.query.page as string || '1', 10);
    const size = parseInt(req.query.size as string || '20', 10);
    const type = String(req.query.type || '');

    let allPets: any[] = [];
    users.forEach(u => {
      if (u.pets) {
        u.pets.forEach(p => {
          allPets.push({
            ...p,
            user: { phone: u.phone }
          });
        });
      }
    });
    if (type) {
      allPets = allPets.filter(p => p.type === type);
    }
    const total = allPets.length;
    const start = (page - 1) * size;
    const paginated = allPets.slice(start, start + size);

    res.json({
      code: 200,
      message: 'success',
      data: paginated,
      pagination: {
        total,
        current: page,
        pageSize: size
      }
    });
  });

  // ──────────────────────── MOBILE APP API ENDPOINTS ────────────────────────

  // SMS Verification Code (Mock)
  app.post('/api/v1/app/auth/send-code', (req, res) => {
    const { phone } = req.body;
    res.json({
      code: 200,
      message: '验证码发送成功（测试验证码为：1234）',
      data: { code: '1234' }
    });
  });

  // Mobile Login/Register
  app.post('/api/v1/app/auth/login', (req, res) => {
    const { phone, code } = req.body;
    if (!phone) {
      return res.status(400).json({ code: 400, message: '手机号不能为空' });
    }
    if (code !== '1234') {
      return res.status(400).json({ code: 400, message: '验证码错误' });
    }

    let user = users.find(u => u.phone === phone);
    if (!user) {
      // Create new user if they don't exist
      user = {
        id: `u-${Date.now()}`,
        phone,
        nickname: `铲屎官-${phone.slice(-4)}`,
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString(),
        pets: []
      };
      users.push(user);
    }

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token: `mock-user-jwt-${phone}-${Date.now()}`,
        user
      }
    });
  });

  // Get User's Pets
  app.get('/api/v1/app/pets', (req, res) => {
    const { phone } = req.query;
    const user = users.find(u => u.phone === phone);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    res.json({
      code: 200,
      data: user.pets || []
    });
  });

  // Add Pet
  app.post('/api/v1/app/pets', (req, res) => {
    const { phone, name, type, breed, gender, weight, emoji, meetDate } = req.body;
    const user = users.find(u => u.phone === phone);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    const newPet = {
      id: `p-${Date.now()}`,
      name: name || '毛孩子',
      type: type || '狗狗',
      breed: breed || '混血',
      gender: gender || '男孩',
      weight: Number(weight) || 0,
      emoji: emoji || '🐾',
      meetDate: meetDate || new Date().toISOString().split('T')[0],
      daysTogether: Math.floor((Date.now() - new Date(meetDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) || 1
    };

    user.pets.push(newPet);

    // Seed initial weight record
    appWeights.push({
      id: `w-${Date.now()}`,
      petId: newPet.id,
      weight: newPet.weight,
      recordDate: newPet.meetDate
    });

    res.json({
      code: 200,
      message: '宠物添加成功',
      data: newPet
    });
  });

  // Update Pet
  app.put('/api/v1/app/pets/:petId', (req, res) => {
    const { petId } = req.params;
    const { phone, name, type, breed, gender, weight, emoji, meetDate } = req.body;
    const user = users.find(u => u.phone === phone);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    const pet = user.pets.find(p => p.id === petId);
    if (!pet) {
      return res.status(404).json({ code: 404, message: '宠物不存在' });
    }
    if (name !== undefined) pet.name = name;
    if (type !== undefined) pet.type = type;
    if (breed !== undefined) pet.breed = breed;
    if (gender !== undefined) pet.gender = gender;
    if (weight !== undefined) pet.weight = Number(weight);
    if (emoji !== undefined) pet.emoji = emoji;
    if (meetDate !== undefined) {
      pet.meetDate = meetDate;
      (pet as any).daysTogether = Math.floor((Date.now() - new Date(meetDate).getTime()) / (1000 * 60 * 60 * 24)) || 1;
    }
    res.json({
      code: 200,
      message: '宠物更新成功',
      data: pet
    });
  });

  // Delete Pet
  app.delete('/api/v1/app/pets/:petId', (req, res) => {
    const { petId } = req.params;
    const { phone } = req.query;
    const user = users.find(u => u.phone === phone);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    user.pets = user.pets.filter(p => p.id !== petId);
    res.json({
      code: 200,
      message: '宠物删除成功'
    });
  });

  // Submit Feedback
  app.post('/api/v1/app/feedback', (req, res) => {
    const { email, type, content } = req.body;
    console.log(`[Feedback Received] Type: ${type}, From: ${email}, Content: ${content}`);
    console.log(`[Email Forwarder] Forwarding feedback to 17611399815@163.com...`);
    res.json({
      code: 200,
      message: '反馈提交成功！系统已自动转发至开发者邮箱 (17611399815@163.com)。🐾'
    });
  });

  // Get Weight Records
  app.get('/api/v1/app/weights', (req, res) => {
    const { petId } = req.query;
    const records = appWeights.filter(w => w.petId === petId);
    res.json({
      code: 200,
      data: records.sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())
    });
  });

  // Add Weight Record
  app.post('/api/v1/app/weights', (req, res) => {
    const { petId, weight, recordDate } = req.body;
    const newRecord = {
      id: `w-${Date.now()}`,
      petId,
      weight: Number(weight),
      recordDate: recordDate || new Date().toISOString().split('T')[0]
    };
    appWeights.push(newRecord);

    // Update pet current weight
    users.forEach(u => {
      const p = u.pets.find(pet => pet.id === petId);
      if (p) {
        p.weight = Number(weight);
      }
    });

    res.json({
      code: 200,
      data: newRecord
    });
  });

  // Get Reminders List
  app.get('/api/v1/app/reminders', (req, res) => {
    const { petId } = req.query;
    const reminders = appReminders.filter(r => r.petId === petId);
    res.json({
      code: 200,
      data: reminders
    });
  });

  // Add Reminder
  app.post('/api/v1/app/reminders', (req, res) => {
    const { petId, title, date, type } = req.body;
    const newReminder = {
      id: `r-${Date.now()}`,
      petId,
      title,
      date,
      type: type || 'other',
      done: false
    };
    appReminders.push(newReminder);
    res.json({
      code: 200,
      data: newReminder
    });
  });

  // Toggle Reminder
  app.put('/api/v1/app/reminders/:id/toggle', (req, res) => {
    const { id } = req.params;
    const reminder = appReminders.find(r => r.id === id);
    if (!reminder) {
      return res.status(404).json({ code: 404, message: '提醒未找到' });
    }
    reminder.done = !reminder.done;
    res.json({
      code: 200,
      data: reminder
    });
  });

  // Get Bookkeeping / Expenses
  app.get('/api/v1/app/expenses', (req, res) => {
    const { petId } = req.query;
    const expenses = appExpenses.filter(e => e.petId === petId);
    res.json({
      code: 200,
      data: expenses
    });
  });

  // Add Expense
  app.post('/api/v1/app/expenses', (req, res) => {
    const { petId, category, amount, recordDate, notes } = req.body;
    const newExpense = {
      id: `exp-${Date.now()}`,
      petId,
      category,
      amount: Number(amount),
      recordDate: recordDate || new Date().toISOString().split('T')[0],
      notes: notes || ''
    };
    appExpenses.push(newExpense);
    res.json({
      code: 200,
      data: newExpense
    });
  });

  // Get Pet Diary Notes
  app.get('/api/v1/app/notes', (req, res) => {
    const { petId } = req.query;
    const notes = appNotes.filter(n => n.petId === petId);
    res.json({
      code: 200,
      data: notes
    });
  });

  // Add Note
  app.post('/api/v1/app/notes', (req, res) => {
    const { petId, title, content, recordDate } = req.body;
    const newNote = {
      id: `n-${Date.now()}`,
      petId,
      title,
      content,
      recordDate: recordDate || new Date().toISOString().split('T')[0]
    };
    appNotes.push(newNote);
    res.json({
      code: 200,
      data: newNote
    });
  });

  // Get Stock Items
  app.get('/api/v1/app/stocks', (req, res) => {
    res.json({
      code: 200,
      data: appStocks
    });
  });

  // Add/Update Stock
  app.post('/api/v1/app/stocks', (req, res) => {
    const { name, category, remaining, total, unit } = req.body;
    const existing = appStocks.find(s => s.name === name);
    if (existing) {
      existing.remaining = Number(remaining);
      existing.total = Number(total);
      res.json({ code: 200, data: existing });
    } else {
      const newStock = {
        id: `st-${Date.now()}`,
        name,
        category,
        remaining: Number(remaining),
        total: Number(total),
        unit: unit || '件'
      };
      appStocks.push(newStock);
      res.json({ code: 200, data: newStock });
    }
  });

  // Get On-Sale Products for Mobile Shop
  app.get('/api/v1/app/products', (req, res) => {
    const activeProducts = products.filter(p => p.is_on_sale);
    res.json({
      code: 200,
      data: activeProducts
    });
  });

  // Get Mobile App orders for a user
  app.get('/api/v1/app/orders', (req, res) => {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ code: 400, message: '手机号是必填项' });
    }
    const filteredOrders = orders.filter(o => o.user?.phone === phone);
    res.json({
      code: 200,
      data: filteredOrders
    });
  });

  // Place Mobile Order (Syncs with Admin order table)
  app.post('/api/v1/app/orders', (req, res) => {
    const { phone, items, shipping_name, shipping_phone, shipping_address, payment_method } = req.body; // items: [{ productId, quantity }]
    if (!phone || !items || !items.length) {
      return res.status(400).json({ code: 400, message: '参数不完整' });
    }

    const orderItems: any[] = [];
    let totalAmount = 0;

    for (const entry of items) {
      const prod = products.find(p => p.id === entry.productId);
      if (!prod) {
        return res.status(400).json({ code: 400, message: `商品 ${entry.productId} 不存在` });
      }
      if (prod.stock < entry.quantity) {
        return res.status(400).json({ code: 400, message: `${prod.name} 库存不足` });
      }

      // Deduct stock
      prod.stock -= entry.quantity;
      totalAmount += prod.price * entry.quantity;

      orderItems.push({
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product: { name: prod.name },
        price: prod.price,
        quantity: entry.quantity
      });
    }

    const newOrder = {
      id: `ord-${Date.now()}`,
      user: { phone },
      total_amount: Number(totalAmount.toFixed(2)),
      status: 'paid', // Mark as paid for the complete checkout flow
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: orderItems,
      shipping_name: shipping_name || '未填写',
      shipping_phone: shipping_phone || phone,
      shipping_address: shipping_address || '未填写',
      payment_method: payment_method || 'wechat'
    };

    orders.unshift(newOrder); // Add to head of admin's list

    res.json({
      code: 200,
      message: '订单提交成功，请在后台查看并处理订单！',
      data: newOrder
    });
  });

  // AI Assistant Chat API (小爪App DeepSeek 方案 — 意图分类 + 提示词工程 + 兜底)
  app.post('/api/v1/app/ai/chat', async (req, res) => {
    const { message, petName, petType, petBreed, petWeight, petGender, history } = req.body;
    if (!message) {
      return res.status(400).json({ code: 400, message: '消息内容不能为空' });
    }

    const pet = {
      name: petName || '毛孩子',
      type: petType || '宠物',
      breed: petBreed || '混血',
      weight: petWeight || 5,
      gender: petGender || '未知',
    };

    // ── Step 1: 意图分类 ──
    const intent = classifyIntent(message);

    if (!intent.isPetRelated) {
      const fallbacks: Record<string, string> = {
        non_pet: '🐾 我是AI管家，专门回答养宠相关的问题哦～\n\n你可以问我：\n• 宠物饮食营养建议\n• 疾病预防和健康护理\n• 行为训练技巧\n• 日常护理知识\n\n有什么养宠问题需要帮忙吗？',
        unknown: '🐾 不好意思，我没有理解你的问题。作为宠物管家，我建议你试试问这些：\n\n🍽️ “狗狗每天吃多少合适？”\n🏥 “猫咪疫苗多久打一次？”\n🛁 “怎么给宠物洗澡？”\n💊 “驱虫药怎么选？”\n\n换个方式描述你的宠物问题吧～',
      };
      return res.json({
        code: 200, message: 'success',
        data: { reply: fallbacks[intent.category] || fallbacks['unknown'], intent_blocked: true }
      });
    }

    // ── Step 2: 尝试调用 DeepSeek API ──
    try {
      const systemPrompt = buildSystemPrompt(pet);
      const messages: { role: string; content: string }[] = [
        { role: 'system', content: systemPrompt },
      ];

      if (history && history.length > 0) {
        const recent = history.slice(-10);
        for (const h of recent) {
          messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content });
        }
      }

      messages.push({
        role: 'user',
        content: `[系统上下文] 主人正在和我聊关于宠物”${pet.name}”（${pet.breed || pet.type}，${pet.weight}kg）的事情。\n\n${message}`,
      });

      if (DEEPSEEK_API_KEY) {
        let reply = await callDeepSeek(messages);
        reply = stripMarkdown(reply);
        return res.json({ code: 200, message: 'success', data: { reply } });
      }
    } catch (err: any) {
      console.warn('DeepSeek API call failed, using fallback:', err.message);
    }

    // ── Step 3: API 未配置或调用失败 → 智能兜底 ──
    const isEmergency = intent.category === 'emergency';
    let reply: string;
    if (isEmergency) {
      reply = `🚨 ${pet.name}出现紧急情况！请立即采取以下措施：第一，保持冷静，仔细观察${pet.name}的症状。第二，立即联系最近的24小时宠物医院。第三，在去医院的路上用毛巾包裹${pet.name}保持温暖。第四，不要自行喂药或催吐。⚠️ 我是AI管家，无法替代兽医急救，请立即就医！`;
    } else if (pet.type === '猫咪') {
      reply = `🐾 关于${pet.name}的问题～作为一只${pet.breed || '猫咪'}，平时建议高蛋白低碳水配餐，定时定量，确保充足饮水保护肾脏。定期梳毛能有效减少毛球症。如果有精神不振或频繁抓挠耳朵，记得在提醒列表里设个驱虫提醒哦！ 有什么具体问题随时问我～`;
    } else {
      reply = `🐾 关于${pet.name}的问题～狗狗需要充足的日常户外活动。喂养方面注意不要给它吃巧克力、葡萄或高盐分的食物。记得关注关节健康和体外寄生虫防护。有任何护理、食谱或健康问题，我随时为您解答！`;
    }

    res.json({
      code: 200, message: 'success',
      data: { reply, notice: '（使用本地宠物知识库生成，配置 DEEPSEEK_API_KEY 后可体验完整 AI 会话）' }
    });
  });

  // ──────────────────────── VITE MIDDLEWARE SETUP ────────────────────────

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(process.cwd(), 'admin'),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[XiaoZhua Admin] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
