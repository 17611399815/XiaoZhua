import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Button, Input, Form, Select, Radio, Badge, Tag, Tooltip, List, Divider, Modal, App, Dropdown } from 'antd';
import {
  MobileOutlined,
  SendOutlined,
  PlusOutlined,
  HeartOutlined,
  ShopOutlined,
  HistoryOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  RobotOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  SmileOutlined,
  BookOutlined,
  PictureOutlined,
  HomeOutlined,
  UserOutlined,
  MessageOutlined,
  BellOutlined,
  PayCircleOutlined,
  CoffeeOutlined,
  MedicineBoxOutlined,
  InboxOutlined,
  CameraOutlined,
  LockOutlined,
  CustomerServiceOutlined,
  StarOutlined,
  EditOutlined,
  DashboardOutlined,
  FireOutlined,
  InfoCircleOutlined,
  RightOutlined,
  TagOutlined,
  PhoneOutlined,
  MailOutlined,
  NotificationOutlined,
  DownOutlined
} from '@ant-design/icons';
import axios from 'axios';
import appLogoImg from '../../assets/app-logo.jpg';
import aiIconImg from '../../assets/ai-icon.png';

// ── Wheel Picker (matching Flutter ListWheelScrollView) ──
function WheelColumn({ items, value, onChange, width = 70 }: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  width?: number;
}) {
  const itemH = 44;
  const visibleCount = 3;
  const containerRef = useRef<HTMLDivElement>(null);

  const idx = items.indexOf(value);
  const startIndex = idx >= 0 ? idx : 0;

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const centerIdx = Math.round(scrollTop / itemH);
    if (centerIdx >= 0 && centerIdx < items.length) {
      onChange(items[centerIdx]);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el && idx >= 0) {
      // Instantly set position
      el.scrollTop = idx * itemH;
      // Also apply a small timeout to ensure proper alignment after modal transitions finish
      const t1 = setTimeout(() => {
        el.scrollTo({ top: idx * itemH, behavior: 'auto' });
      }, 50);
      const t2 = setTimeout(() => {
        el.scrollTo({ top: idx * itemH, behavior: 'smooth' });
      }, 150);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [value, idx]);

  return (
    <div style={{ position: 'relative', width, height: itemH * visibleCount, overflow: 'hidden' }}>
      {/* center highlight */}
      <div style={{
        position: 'absolute', top: itemH, left: 4, right: 4, height: itemH,
        background: 'rgba(254, 243, 200, 0.5)', borderRadius: 12, pointerEvents: 'none', zIndex: 0
      }} />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: '100%', overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          msOverflowStyle: 'none', scrollbarWidth: 'none',
          padding: `${itemH}px 0`
        }}
      >
        {items.map((item, i) => {
          const isSelected = item === value;
          return (
            <div
              key={i}
              onClick={() => onChange(item)}
              style={{
                height: itemH, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isSelected ? 20 : 16,
                fontWeight: isSelected ? 800 : 500,
                color: isSelected ? '#2D2621' : '#C0A080',
                scrollSnapAlign: 'start',
                cursor: 'pointer', userSelect: 'none',
                transition: 'all 0.15s'
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
      {/* top & bottom fade mask */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: itemH, background: 'linear-gradient(180deg, #FFFDF9, transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: itemH, background: 'linear-gradient(0deg, #FFFDF9, transparent)', pointerEvents: 'none' }} />
    </div>
  );
}

// ── Wheel Date Picker Modal ──
function WheelDatePickerModal({ open, onClose, value, onChange }: {
  open: boolean;
  onClose: () => void;
  value: string;   // YYYY-MM-DD
  onChange: (v: string) => void;
}) {
  const now = new Date();
  const [y, setY] = useState(String(now.getFullYear()));
  const [m, setM] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [d, setD] = useState(String(now.getDate()).padStart(2, '0'));

  // Sync state when opened or value changes
  useEffect(() => {
    if (open) {
      const currentDate = new Date();
      let targetDate = currentDate;
      if (value) {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          targetDate = parsed;
        }
      }
      setY(String(targetDate.getFullYear()));
      setM(String(targetDate.getMonth() + 1).padStart(2, '0'));
      setD(String(targetDate.getDate()).padStart(2, '0'));
    }
  }, [open, value]);

  const years = Array.from({ length: 31 }, (_, i) => String(now.getFullYear() - 30 + i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  const maxDay = daysInMonth(Number(y), Number(m));
  const days = Array.from({ length: maxDay }, (_, i) => String(i + 1).padStart(2, '0'));

  const safeDay = Number(d) > maxDay ? String(maxDay).padStart(2, '0') : d;

  const handleConfirm = () => {
    const day = Number(safeDay) > maxDay ? maxDay : Number(safeDay);
    onChange(`${y}-${m}-${String(day).padStart(2, '0')}`);
    onClose();
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={340} centered styles={{ body: { padding: '20px 16px', background: '#FFFDF9', borderRadius: 20 } }}>
      <h3 style={{ textAlign: 'center', fontSize: 17, fontWeight: 900, color: '#2D2621', marginBottom: 16 }}>选择日期</h3>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
        <WheelColumn items={years} value={y} onChange={setY} width={75} />
        <span style={{ fontSize: 18, color: '#C0A080', fontWeight: 700, margin: '0 2px' }}>年</span>
        <WheelColumn items={months} value={m} onChange={setM} width={55} />
        <span style={{ fontSize: 18, color: '#C0A080', fontWeight: 700, margin: '0 2px' }}>月</span>
        <WheelColumn items={days} value={safeDay} onChange={setD} width={55} />
        <span style={{ fontSize: 18, color: '#C0A080', fontWeight: 700, margin: '0 2px' }}>日</span>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Button block onClick={onClose} style={{ borderRadius: 12, height: 42, fontWeight: 700, color: '#999' }}>取消</Button>
        <Button block type="primary" onClick={handleConfirm} style={{
          borderRadius: 12, height: 42, fontWeight: 800, fontSize: 15,
          background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)', border: 'none'
        }}>确定</Button>
      </div>
    </Modal>
  );
}

// ── Beautiful & Intuitive Weight Picker Modal (Replacing clumsy wheel columns) ──
function WheelWeightPickerModal({ open, onClose, value, onChange }: {
  open: boolean;
  onClose: () => void;
  value: number;
  onChange: (v: number) => void;
}) {
  const [tempWeight, setTempWeight] = useState<string>('4');

  // Sync state when opened or value changes
  useEffect(() => {
    if (open) {
      setTempWeight(String(Math.round(value || 4)));
    }
  }, [open, value]);

  const handleConfirm = () => {
    const finalVal = Math.max(1, Math.min(150, Math.round(Number(tempWeight))));
    onChange(finalVal);
    onClose();
  };

  const weights = Array.from({ length: 150 }, (_, i) => String(i + 1));

  return (
    <Modal 
      open={open} 
      onCancel={onClose} 
      footer={null} 
      width={280} 
      centered 
      styles={{ body: { padding: '24px 20px', background: '#FFFDF9', borderRadius: 24 } }}
    >
      <h3 style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: '#2D2621', marginBottom: 20 }}>
        ⚖️ 滚动选择宠物体重
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#FFF9F5', padding: '10px 20px', borderRadius: 16, border: '1px solid #FFE2C4' }}>
          <WheelColumn items={weights} value={tempWeight} onChange={setTempWeight} width={80} />
          <span style={{ fontSize: 20, fontWeight: 800, color: '#FF8A3D' }}>KG</span>
        </div>
        <span style={{ fontSize: 12, color: '#C0A080', fontWeight: 600 }}>上下滚动选择整数体重值</span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <Button block onClick={onClose} style={{ borderRadius: 14, height: 44, fontWeight: 700, color: '#999' }}>
          取消
        </Button>
        <Button 
          block 
          type="primary" 
          onClick={handleConfirm} 
          style={{
            borderRadius: 14, height: 44, fontWeight: 800, fontSize: 15,
            background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)', border: 'none'
          }}
        >
          确定
        </Button>
      </div>
    </Modal>
  );
}

// Interfaces matching backend
interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  gender: string;
  weight: number;
  emoji: string;
  meetDate: string;
  daysTogether?: number;
}

interface WeightRecord {
  id: string;
  petId: string;
  weight: number;
  recordDate: string;
}

interface Reminder {
  id: string;
  petId: string;
  title: string;
  date: string;
  type: string;
  done: boolean;
}

interface Expense {
  id: string;
  petId: string;
  category: string;
  amount: number;
  recordDate: string;
  notes: string;
}

interface Note {
  id: string;
  petId: string;
  title: string;
  content: string;
  recordDate: string;
}

interface StockItem {
  id: string;
  name: string;
  category: string;
  remaining: number;
  total: number;
  unit: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  is_on_sale: boolean;
  emoji: string;
  description: string;
}

// Premium visual token representation components replacing low-fidelity emojis
function PetAvatar({ emojiOrUrl, size = 48, borderRadius = 14 }: { emojiOrUrl: string; size?: number; borderRadius?: number }) {
  if (emojiOrUrl && (emojiOrUrl.startsWith('http') || emojiOrUrl.startsWith('data:'))) {
    return (
      <img
        src={emojiOrUrl}
        style={{ width: size, height: size, borderRadius, objectFit: 'cover', display: 'block' }}
        alt="avatar"
      />
    );
  }

  // Map representation keys to high-end Swiss-style pastel badges
  let label = 'PET';
  let bg = '#F5ECE1';
  let color = '#B45309';

  const s = emojiOrUrl || '';
  if (s === '🐱' || s === '猫' || s === '猫咪') {
    label = 'CAT';
    bg = '#FFF4DE';
    color = '#FF8A3D';
  } else if (s === '🐶' || s === '狗' || s === '狗狗') {
    label = 'DOG';
    bg = '#E0F2FE';
    color = '#0284C7';
  } else if (s === '🐰' || s === '兔' || s === '小兔') {
    label = 'RAB';
    bg = '#FCE7F3';
    color = '#DB2777';
  } else if (s === '🐹' || s === '仓鼠') {
    label = 'HAM';
    bg = '#FEF3C7';
    color = '#D97706';
  } else if (s === '🦜' || s === '鹦鹉') {
    label = 'PAR';
    bg = '#ECFDF5';
    color = '#059669';
  } else if (s === '🦎' || s === '爬宠') {
    label = 'REP';
    bg = '#F0FDF4';
    color = '#15803D';
  } else if (s === '🦆' || s === '鸭') {
    label = 'DUC';
    bg = '#EFF6FF';
    color = '#2563EB';
  } else if (s === '🐭' || s === '龙猫') {
    label = 'CHI';
    bg = '#F3F4F6';
    color = '#4B5563';
  } else {
    // If it's a name, use its first letter(s)
    label = s.trim() ? s.trim().substring(0, 3).toUpperCase() : '🐾';
    bg = '#FFF4DE';
    color = '#FF8A3D';
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size > 35 ? 12 : 9,
      fontWeight: 800,
      color: color,
      border: '1px solid rgba(180, 83, 9, 0.08)',
      letterSpacing: 0.5,
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {label === '🐾' ? <SmileOutlined style={{ fontSize: size * 0.45 }} /> : label}
    </div>
  );
}

function ProductIcon({ emoji }: { emoji: string }) {
  // Map common product category emojis to premium Ant Design Icons
  const s = emoji || '';
  if (s === '🍗' || s === '主粮' || s === 'food') {
    return <CoffeeOutlined style={{ fontSize: 18, color: '#FF8A3D' }} />;
  }
  if (s === '🍖' || s === '零食' || s === 'snack') {
    return <FireOutlined style={{ fontSize: 18, color: '#D97706' }} />;
  }
  if (s === '🎾' || s === '玩具' || s === 'toy') {
    return <SmileOutlined style={{ fontSize: 18, color: '#10B981' }} />;
  }
  if (s === '💊' || s === '医疗' || s === 'medical') {
    return <MedicineBoxOutlined style={{ fontSize: 18, color: '#EC4899' }} />;
  }
  if (s === '🛹' || s === '用品' || s === 'supplies') {
    return <InboxOutlined style={{ fontSize: 18, color: '#14B8A6' }} />;
  }
  return <ShoppingCartOutlined style={{ fontSize: 18, color: '#FF8A3D' }} />;
}

function MobileAppContent() {
  const { message } = App.useApp();

  const presetRecipes = [
    {
      title: "鸡肉胡萝卜自制主粮",
      ingredients: "鸡胸肉 500g, 胡萝卜 100g, 南瓜 100g, 西兰花 50g, 燕麦 30g",
      steps: "1. 鸡胸肉与南瓜、胡萝卜一同蒸熟。\n2. 将蒸熟的食材用搅拌机打碎或切细丁。\n3. 西兰花烫熟切碎，燕麦用热水泡软。\n4. 所有食材混合均匀，揉成小丸子或直接分装冷冻保存。"
    },
    {
      title: "牛肉红薯美毛配方",
      ingredients: "牛里脊肉 400g, 红薯 150g, 蛋黄 2个, 三文鱼油 5ml, 椰子油 2g",
      steps: "1. 牛里脊肉切丁，红薯蒸熟捣成泥。\n2. 锅中微热椰子油，将牛肉丁炒至变色熟透。\n3. 将牛肉、红薯泥、蛋黄（煮熟捣碎）混合拌匀。\n4. 最后滴入三文鱼油搅拌均匀即可喂食。"
    },
    {
      title: "猫咪纯肉补水主食罐罐",
      ingredients: "鸡腿肉(去骨去皮) 300g, 鸭胸肉 100g, 鸡肝 50g, 蛋黄 1个, 纯净水 150ml",
      steps: "1. 鸡腿肉、鸭胸肉、鸡肝切小块。\n2. 放入蒸碗中，加入150ml水，小火蒸30分钟至肉质酥烂。\n3. 取出蒸熟的肉和汤汁，加入一个熟蛋黄，用手持搅拌棒打成细腻的肉泥即可。"
    }
  ];
  // Mobile UI States
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Language and custom feature states
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [petManageMode, setPetManageMode] = useState<'list' | 'edit' | 'add'>('list');
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [addingPetForm, setAddingPetForm] = useState({
    name: '',
    type: '猫咪',
    breed: '',
    gender: '男孩',
    weight: 4.5,
    emoji: '🐱',
    meetDate: new Date().toISOString().split('T')[0]
  });

  // Modal control states (rendering inside emulator)
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [selectedVipTier, setSelectedVipTier] = useState<string>('monthly_auto');

  // Password fields
  const [pwdForm, setPwdForm] = useState({ newPwd: '', confirmPwd: '' });
  
  // Feedback fields
  const [feedbackForm, setFeedbackForm] = useState({ type: '建议', email: '', content: '' });

  // AI Recommendation list
  const [recommendProducts, setRecommendProducts] = useState<any[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);
  const [aiRecommendText, setAiRecommendText] = useState('');

  // Translation helper
  const t = (zh: string, en: string) => {
    return language === 'en' ? en : zh;
  };
  
  // App Screens
  // 'login' | 'onboarding' | 'home' | 'feature'
  const [screen, setScreen] = useState<'login' | 'onboarding' | 'home' | 'feature'>('login');
  const [activeFeature, setActiveFeature] = useState<string>('weight');

  // Pet Onboarding Step (0 to 6), matching 小爪App detailed registration flow
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [newPetForm, setNewPetForm] = useState({
    userNickname: '',
    name: '',
    type: '猫咪',
    breed: '',
    gender: '男孩',
    weight: 4.5,
    emoji: '🐱',
    meetDate: new Date().toISOString().split('T')[0],
    birthday: '',
    arrivalDate: new Date().toISOString().split('T')[0]
  });

  // Business Data State
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [appOrders, setAppOrders] = useState<any[]>([]);
  const [shopSearchKeyword, setShopSearchKeyword] = useState('');
  const [shopSelectedCategory, setShopSelectedCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const name = p.name || '';
      const desc = p.description || '';
      const matchesSearch = name.toLowerCase().includes(shopSearchKeyword.toLowerCase()) || 
                            desc.toLowerCase().includes(shopSearchKeyword.toLowerCase());
      const matchesCategory = shopSelectedCategory === 'all' || p.category === shopSelectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, shopSearchKeyword, shopSelectedCategory]);
  
  // Cart for shop
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  
  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; notice?: string }>>([
    { sender: 'ai', text: '你好！我是AI管家 🐾\n请问有什么可以帮你的吗？我可以帮你解答养宠问题、推荐宠物食谱、分析健康数据等～' }
  ]);
  // AI suggestion chips (matching Flutter design)
  const aiSuggestions = [
    { icon: '🍽️', text: '我家宠物每天吃多少合适？' },
    { icon: '🏥', text: '常见宠物疾病怎么预防？' },
    { icon: '🛁', text: '多久给宠物洗澡合适？' },
    { icon: '🐾', text: '新宠到家需要注意什么？' },
    { icon: '💊', text: '驱虫药多久用一次？' },
    { icon: '✂️', text: '宠物美容频率建议' },
  ];
  const [aiTyping, setAiTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Feature Add Forms
  const [addWeightVal, setAddWeightVal] = useState('');

  // Weight & Date Picker Modal states
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [subpageWeightOpen, setSubpageWeightOpen] = useState(false);
  const [selectedInt, setSelectedInt] = useState(4);
  const [selectedDec, setSelectedDec] = useState(5);

  // Date picker modal states (for birthday, arrival date in onboarding)
  const [datePickerOpen, setDatePickerOpen] = useState<'birthday' | 'arrival' | null>(null);

  // Checkout flow states
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay' | 'bank'>('wechat');

  // Standalone Flutter Workspace state
  const [workspaceTab, setWorkspaceTab] = useState<'simulator' | 'explorer' | 'compile_spec'>('explorer');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('mobile/lib/main.dart');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [compilePlatform, setCompilePlatform] = useState<'ios' | 'android' | 'harmony'>('ios');

  const startMockCompile = () => {
    setIsCompiling(true);
    setCompileLogs([]);
    
    let logs: string[] = [];
    let successMsg = "";
    
    if (compilePlatform === 'ios') {
      logs = [
        "⚙️ Flutter SDK (v3.22.2) Initializing iOS build target...",
        "🔍 Checking system environment (Xcode v15.4, CocoaPods v1.15.2)...",
        "📦 Resolving packages in mobile/pubspec.yaml...",
        "  -> flutter_lints: ^3.0.0 (cached)",
        "  -> provider: ^6.1.2 (cached)",
        "  -> google_generative_ai: ^0.4.0 (cached)",
        "  -> http: ^1.2.1 (cached)",
        "  -> shared_preferences: ^2.2.3 (cached)",
        "🚀 Running 'pod install' to generate CocoaPods workspace...",
        "  -> Installing Pods for iOS 17.0 SDK target...",
        "  -> Pod installation finished successfully.",
        "🛠️ Executing Swift and Objective-C compiling steps...",
        "  -> Compiling theme/app_theme.dart -> AppTheme.framework (Release Mode)",
        "  -> Compiling services/app_provider.dart -> AppProvider.framework (Release Mode)",
        "  -> Compiling pages/home_page.dart -> HomePage.framework (Release Mode)",
        "  -> Compiling pages/shop/shop_page.dart -> ShopPage.framework (Release Mode)",
        "📱 Linking binaries with Apple iOS CoreGraphics & UIKit...",
        "✏️ Signing product with XiaoZhua Developer Profile...",
        "📦 Generating Runner.app archive & iOS App Bundle (IPA)...",
        "✨ Xcode iOS Archiving COMPLETED SUCCESSFULLY!",
        "🎉 XiaoZhua App iOS Target Build Succeeded (iOS 17.0+ ready)!"
      ];
      successMsg = "小爪 App iOS 端独立编译检查成功！包体已符合 iOS App Store 规范！🐾";
    } else if (compilePlatform === 'android') {
      logs = [
        "⚙️ Flutter SDK (v3.22.2) Initializing Android build target...",
        "🔍 Checking system environment (JDK 17, Android SDK Platform 34)...",
        "📦 Resolving packages in mobile/pubspec.yaml...",
        "  -> flutter_lints: ^3.0.0 (cached)",
        "  -> provider: ^6.1.2 (cached)",
        "  -> google_generative_ai: ^0.4.0 (cached)",
        "  -> http: ^1.2.1 (cached)",
        "  -> shared_preferences: ^2.2.3 (cached)",
        "🚀 Running 'gradlew assembleRelease' to build Android Application Package...",
        "  -> Running Gradle task ':app:compileReleaseJavaWithJavac'...",
        "  -> Running Gradle task ':app:mergeReleaseAssets'...",
        "  -> Running Gradle task ':app:compressReleaseAssets'...",
        "🛠️ Executing Dart AOT compiling steps...",
        "  -> Compiling theme/app_theme.dart -> libapp.so (armeabi-v7a, arm64-v8a, x86_64)",
        "  -> Compiling services/app_provider.dart -> libapp.so (Release Mode)",
        "  -> Compiling pages/home_page.dart -> libapp.so (Release Mode)",
        "  -> Compiling pages/shop/shop_page.dart -> libapp.so (Release Mode)",
        "📦 Optimizing bytecode with R8 (ProGuard rules applied)...",
        "✒️ Signing product with XiaoZhua Release Keystore...",
        "📦 Generating app-release.apk & app-release.aab (Android App Bundle)...",
        "✨ Gradle Android Release Build COMPLETED SUCCESSFULLY!",
        "🎉 XiaoZhua App Android Target APK / AAB generated (Android 10.0+ ready)!"
      ];
      successMsg = "小爪 App Android 端 Gradle 编译成功！APK与AAB安装包已完美适配谷歌生态及主流国产应用商店！🐾";
    } else {
      logs = [
        "⚙️ Flutter SDK for HarmonyOS (v3.22.0-OHOS) Initializing HarmonyOS target...",
        "🔍 Checking system environment (DevEco Studio SDK 5.0, Node.js v18.15.0)...",
        "📦 Resolving packages in mobile/pubspec.yaml (OHOS custom bindings enabled)...",
        "  -> flutter_ohos_bindings: ^1.0.0 (cached)",
        "  -> google_generative_ai: ^0.4.0 (cached)",
        "  -> http: ^1.2.1 (cached)",
        "  -> shared_preferences: ^2.2.3 (cached)",
        "🚀 Running 'ohpm install' to pull OpenHarmony Packet Manager dependencies...",
        "  -> HarmonyOS Package installation finished.",
        "🛠️ Executing ArkTS / ArkUI Cross-Compilation and Dart Native Engine setup...",
        "  -> Generating ohos/entry/src/main/ets/Application...",
        "  -> Compiling theme/app_theme.dart -> libflutter.so (Harmony Native Platform)",
        "  -> Compiling services/app_provider.dart -> libflutter.so (Harmony Native Platform)",
        "  -> Compiling pages/home_page.dart -> libflutter.so (Harmony Native Platform)",
        "  -> Compiling pages/shop/shop_page.dart -> libflutter.so (Harmony Native Platform)",
        "✏️ Signing product with Huawei Developer Certificate (HarmonyOS Signature Profile)...",
        "📦 Compiling into Har/Hap package (HarmonyOS App Package)...",
        "✨ DevEco Compiler & Flutter OHOS build COMPLETED SUCCESSFULLY!",
        "🎉 XiaoZhua App HarmonyOS Next / OpenHarmony Target HAP Succeeded!"
      ];
      successMsg = "小爪 App 鸿蒙星河版 (HarmonyOS NEXT) 编译自测完成！Hap包已就绪，原生适配纯血鸿蒙系统！🐾";
    }

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < logs.length) {
        setCompileLogs(prev => [...prev, logs[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsCompiling(false);
        message.success(successMsg);
      }
    }, 250);
  };

  useEffect(() => {
    if (workspaceTab === 'explorer' && selectedFilePath) {
      setFileLoading(true);
      axios.get(`/api/v1/source-code?path=${encodeURIComponent(selectedFilePath)}`)
        .then(res => {
          if (res.data && res.data.code === 200) {
            setFileContent(res.data.content);
          } else {
            setFileContent('加载失败: ' + JSON.stringify(res.data));
          }
        })
        .catch(err => {
          setFileContent('读取文件出错: ' + (err.response?.data?.error || err.message));
        })
        .finally(() => {
          setFileLoading(false);
        });
    }
  }, [workspaceTab, selectedFilePath]);

  const openWeightPicker = () => {
    const currentW = newPetForm.weight || 4.5;
    const intPart = Math.floor(currentW);
    const decPart = Math.round((currentW - intPart) * 10);
    setSelectedInt(intPart);
    setSelectedDec(decPart);
    setIsWeightModalOpen(true);
  };
  const [addReminderTitle, setAddReminderTitle] = useState('');
  const [addReminderType, setAddReminderType] = useState('vaccine');
  const [addExpenseCategory, setAddExpenseCategory] = useState('food');
  const [addExpenseAmount, setAddExpenseAmount] = useState('');
  const [addExpenseNotes, setAddExpenseNotes] = useState('');
  const [addNoteTitle, setAddNoteTitle] = useState('');
  const [addNoteContent, setAddNoteContent] = useState('');

  // Status Bar Clock
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync Timer for SMS Code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle auto scroll for chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, aiTyping]);

  // Fetch Business Data once user is set
  useEffect(() => {
    if (user && user.phone) {
      fetchPets();
      fetchStocks();
      fetchProducts();
      fetchAppOrders();
    }
  }, [user]);

  // Fetch items whenever currentPet changes
  useEffect(() => {
    if (currentPet) {
      fetchWeightRecords(currentPet.id);
      fetchReminders(currentPet.id);
      fetchExpenses(currentPet.id);
      fetchNotes(currentPet.id);
    }
  }, [currentPet]);

  // API Call: Fetch Pets
  const fetchPets = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`/api/v1/app/pets?phone=${user.phone}`);
      const petList = res.data.data || [];
      setPets(petList);
      if (petList.length > 0) {
        setCurrentPet(petList[0]);
        setScreen('home');
      } else {
        setScreen('onboarding');
        setOnboardingStep(0);
      }
    } catch (err: any) {
      message.error('无法加载宠物信息');
    }
  };

  // API Call: Fetch Weights
  const fetchWeightRecords = async (petId: string) => {
    try {
      const res = await axios.get(`/api/v1/app/weights?petId=${petId}`);
      setWeights(res.data.data || []);
    } catch (err) {}
  };

  // API Call: Fetch Reminders
  const fetchReminders = async (petId: string) => {
    try {
      const res = await axios.get(`/api/v1/app/reminders?petId=${petId}`);
      setReminders(res.data.data || []);
    } catch (err) {}
  };

  // API Call: Fetch Expenses
  const fetchExpenses = async (petId: string) => {
    try {
      const res = await axios.get(`/api/v1/app/expenses?petId=${petId}`);
      setExpenses(res.data.data || []);
    } catch (err) {}
  };

  // API Call: Fetch Notes
  const fetchNotes = async (petId: string) => {
    try {
      const res = await axios.get(`/api/v1/app/notes?petId=${petId}`);
      setNotes(res.data.data || []);
    } catch (err) {}
  };

  // API Call: Fetch Stocks
  const fetchStocks = async () => {
    try {
      const res = await axios.get('/api/v1/app/stocks');
      setStocks(res.data.data || []);
    } catch (err) {}
  };

  // API Call: Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/v1/app/products');
      setProducts(res.data.data || []);
    } catch (err) {}
  };

  // API Call: Fetch App Orders
  const fetchAppOrders = async () => {
    if (!user || !user.phone) return;
    try {
      const res = await axios.get('/api/v1/app/orders', {
        params: { phone: user.phone }
      });
      setAppOrders(res.data.data || []);
    } catch (err) {}
  };

  // Send Mock SMS
  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      message.warning('请输入11位中国手机号');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/v1/app/auth/send-code', { phone });
      setIsCodeSent(true);
      setCountdown(60);
      message.success('验证码 1234 已发送（测试默认 1234 登录）');
    } catch (err: any) {
      message.error('发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  // Login Handle
  const handleLoginSubmit = async () => {
    if (!phone || !code) {
      message.warning('请输入手机号和验证码');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/app/auth/login', { phone, code });
      if (res.data.code === 200) {
        setUser(res.data.data.user);
        message.success('手机端模拟登录成功 🐾');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || '验证码错误，测试请输入 1234');
    } finally {
      setLoading(false);
    }
  };

  // Skip / Quick Account Helper
  const handleQuickLogin = (quickPhone: string) => {
    setPhone(quickPhone);
    setCode('1234');
    setIsCodeSent(true);
    setCountdown(60);
    message.info(`已自动填入账号。请输入验证码 1234 或点击登录即可！`);
  };

  // Handle Onboarding Next Step (7 steps: 0-6, matching 小爪App flow)
  const handleOnboardingNext = async () => {
    if (onboardingStep < 6) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      // Step 6 Submit: Register pet via API
      setLoading(true);
      try {
        const res = await axios.post('/api/v1/app/pets', {
          phone: user.phone,
          ...newPetForm
        });
        if (res.data.code === 200) {
          // Update user nickname if provided
          if (newPetForm.userNickname && user) {
            user.nickname = newPetForm.userNickname;
          }
          message.success(`欢迎进入小爪管家，${newPetForm.name}!`);
          setPets([...pets, res.data.data]);
          setCurrentPet(res.data.data);
          setScreen('home');
        }
      } catch (err: any) {
        message.error('宠物资料创建失败');
      } finally {
        setLoading(false);
      }
    }
  };

  // Onboarding Prev Step
  const handleOnboardingPrev = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  // Add Pet — go through full 7-step registration (matching 小爪App)
  const handleQuickAddPet = () => {
    // Reset form for new pet
    setNewPetForm({
      userNickname: user?.nickname || '',
      name: '',
      type: '猫咪',
      breed: '',
      gender: '男孩',
      weight: 4.5,
      emoji: '🐱',
      meetDate: new Date().toISOString().split('T')[0],
      birthday: '',
      arrivalDate: new Date().toISOString().split('T')[0]
    });
    setOnboardingStep(1); // 跳过昵称步骤，直接从宠物种类开始
    setScreen('onboarding');
    message.info('请填写新宠物的详细信息 🐾');
  };

  // Switch Active Pet
  const handleSwitchPet = (petId: any) => {
    const selected = pets.find(p => String(p.id) === String(petId));
    if (selected) {
      setCurrentPet(selected);
      message.success(`切换至 ${selected.name}`);
    }
  };

  // API Call: Add Weight Record
  const handleAddWeight = async () => {
    if (!addWeightVal || isNaN(Number(addWeightVal))) {
      message.warning('请输入正确的体重数字');
      return;
    }
    if (!currentPet) return;
    try {
      const res = await axios.post('/api/v1/app/weights', {
        petId: currentPet.id,
        weight: Number(addWeightVal)
      });
      setWeights([...weights, res.data.data]);
      // Update local current pet weight
      setCurrentPet({ ...currentPet, weight: Number(addWeightVal) });
      setPets(pets.map(p => p.id === currentPet.id ? { ...p, weight: Number(addWeightVal) } : p));
      setAddWeightVal('');
      message.success('体重记录成功！');
    } catch (err) {
      message.error('体重记录失败');
    }
  };

  // API Call: Add Reminder
  const handleAddReminder = async () => {
    if (!addReminderTitle) {
      message.warning('请输入提醒事务内容');
      return;
    }
    if (!currentPet) return;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3); // Default 3 days later
    const dateStr = targetDate.toISOString().split('T')[0];

    try {
      const res = await axios.post('/api/v1/app/reminders', {
        petId: currentPet.id,
        title: addReminderTitle,
        type: addReminderType,
        date: dateStr
      });
      setReminders([...reminders, res.data.data]);
      setAddReminderTitle('');
      message.success('健康事务提醒已添加！');
    } catch (err) {
      message.error('事务添加失败');
    }
  };

  // API Call: Toggle Reminder Checked State
  const handleToggleReminder = async (id: string) => {
    try {
      const res = await axios.put(`/api/v1/app/reminders/${id}/toggle`);
      setReminders(reminders.map(r => r.id === id ? res.data.data : r));
      message.success('备忘状态更新');
    } catch (err) {}
  };

  // API Call: Add Expense
  const handleAddExpense = async () => {
    if (!addExpenseAmount || isNaN(Number(addExpenseAmount))) {
      message.warning('请输入正确的金额');
      return;
    }
    if (!currentPet) return;
    try {
      const res = await axios.post('/api/v1/app/expenses', {
        petId: currentPet.id,
        category: addExpenseCategory,
        amount: Number(addExpenseAmount),
        notes: addExpenseNotes
      });
      setExpenses([...expenses, res.data.data]);
      setAddExpenseAmount('');
      setAddExpenseNotes('');
      message.success('记账成功 🧾');
    } catch (err) {
      message.error('记账失败');
    }
  };

  // API Call: Add Notes/Diary
  const handleAddNote = async () => {
    if (!addNoteTitle || !addNoteContent) {
      message.warning('请完善日记标题和内容');
      return;
    }
    if (!currentPet) return;
    try {
      const res = await axios.post('/api/v1/app/notes', {
        petId: currentPet.id,
        title: addNoteTitle,
        content: addNoteContent
      });
      setNotes([...notes, res.data.data]);
      setAddNoteTitle('');
      setAddNoteContent('');
      message.success('宠物日记已保存 ✍️');
    } catch (err) {
      message.error('保存日记失败');
    }
  };

  // API Call: Add Cart Item
  const handleAddToCart = (productId: string, name: string) => {
    const qty = (cart[productId] || 0) + 1;
    setCart({ ...cart, [productId]: qty });
    message.success(`已添加 ${name} 到购物车`);
  };

  // Update Cart Quantity
  const handleUpdateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      const newCart = { ...cart };
      delete newCart[productId];
      setCart(newCart);
    } else {
      setCart({ ...cart, [productId]: qty });
    }
  };

  // AI Product Recommendation
  const handleAiRecommend = async () => {
    if (!currentPet) {
      message.warning(t('请先为您的爱宠建档，以便AI为您精准推荐商品～', 'Please register your pet first so AI can recommend products!'));
      return;
    }
    setShowRecommendModal(true);
    setIsRecommending(true);
    setAiRecommendText('');
    setRecommendProducts([]);

    try {
      // 1. Determine recommended products based on pet type
      const petTypeNormal = currentPet.type.toLowerCase();
      let selectedIds = ['prod-3', 'prod-5', 'prod-7']; // Default
      if (petTypeNormal.includes('猫') || petTypeNormal.includes('cat')) {
        selectedIds = ['prod-1', 'prod-4', 'prod-6'];
      } else if (petTypeNormal.includes('狗') || petTypeNormal.includes('dog')) {
        selectedIds = ['prod-2', 'prod-7', 'prod-5'];
      }
      
      const recs = products.filter(p => selectedIds.includes(p.id));
      setRecommendProducts(recs);

      // 2. Call backend AI chat route to get custom recommendation reasoning
      const petInfoStr = `宠物名字：${currentPet.name}，种类：${currentPet.type}，品种：${currentPet.breed}，性别：${currentPet.gender}，体重：${currentPet.weight}kg。`;
      const prompt = `你是小爪宠物的专属AI管家。现在我们有以下商品在售：${recs.map(r => `【${r.name} (${r.description})】`).join('、')}。请根据以下宠物数据推荐这些商品，写一段温馨治愈的100字推荐语说明原因，以第一人称对主人说：${petInfoStr}`;
      
      const res = await axios.post('/api/v1/app/ai/chat', {
        message: prompt,
        petName: currentPet.name,
        petType: currentPet.type,
        petBreed: currentPet.breed,
        petWeight: currentPet.weight,
        petGender: currentPet.gender
      });

      if (res.data?.data?.reply) {
        setAiRecommendText(res.data.data.reply);
      } else {
        setAiRecommendText(t(
          `小爪AI管家深度分析发现，您的爱宠 ${currentPet.name} 是一只可爱的 ${currentPet.breed} ${currentPet.type}。根据它的体重 ${currentPet.weight}kg，我们推荐了这些最适合它的口粮和保健品，全面支持它的活力和健康毛发！🐾`,
          `XiaoZhua AI analyzer found that your pet ${currentPet.name} is a lovely ${currentPet.breed} ${currentPet.type}. Based on its weight ${currentPet.weight}kg, we have selected the most suitable food and supplements to support its vitality and healthy coat! 🐾`
        ));
      }
    } catch (err) {
      setAiRecommendText(t(
        `小爪AI管家分析中：根据 ${currentPet.name} 的特征，为您推荐了专属精选。优质的营养补充与运动玩乐是它们保持长寿健康的秘诀！🐾`,
        `XiaoZhua AI suggests: Based on ${currentPet.name}'s features, we picked high-quality foods and active toys to protect its long-term health and wellness! 🐾`
      ));
    } finally {
      setIsRecommending(false);
    }
  };

  // Feedback Submission handler
  const handleSendFeedback = async () => {
    if (!feedbackForm.content.trim()) {
      message.error(t('请填写您的反馈意见内容', 'Please enter your feedback content'));
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/app/feedback', {
        email: feedbackForm.email || user?.phone || 'anonymous@xiaozhua.com',
        type: feedbackForm.type,
        content: feedbackForm.content
      });
      if (res.data.code === 200) {
        message.success(res.data.message);
        setFeedbackForm({ type: '建议', email: '', content: '' });
        setShowFeedbackModal(false);
      }
    } catch (err) {
      message.error(t('提交反馈失败', 'Failed to submit feedback'));
    } finally {
      setLoading(false);
    }
  };

  // Password setting handler
  const handleSavePassword = () => {
    const { newPwd, confirmPwd } = pwdForm;
    if (!newPwd || newPwd.length < 6) {
      message.error(t('密码长度不能少于6位', 'Password length must be at least 6 characters'));
      return;
    }
    if (newPwd !== confirmPwd) {
      message.error(t('两次输入的密码不一致', 'Passwords do not match'));
      return;
    }
    message.success(t('修改密码设置成功！下次可使用新密码登录🐾', 'Password set successfully! You can use it next time! 🐾'));
    setShowPasswordModal(false);
    setPwdForm({ newPwd: '', confirmPwd: '' });
  };

  // API Call: Checkout Mobile Shop Order (Pops Up Form)
  const handleCheckout = () => {
    const orderItems = Object.entries(cart).map(([productId, qty]) => ({
      productId,
      quantity: qty
    }));

    if (orderItems.length === 0) {
      message.warning('购物车为空');
      return;
    }

    setShippingName(user?.nickname || newPetForm.userNickname || '铲屎官');
    setShippingPhone(user?.phone || '');
    setShippingAddress('北京市朝阳区萌宠活力苑A区3号楼');
    setPaymentMethod('wechat');
    setCheckoutModalOpen(true);
  };

  // API Call: Process payment and confirm order placement
  const handleConfirmPayment = async () => {
    const orderItems = Object.entries(cart).map(([productId, qty]) => ({
      productId,
      quantity: qty
    }));

    if (orderItems.length === 0) {
      message.warning('购物车为空');
      return;
    }

    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim()) {
      message.warning('请填写完整的收货信息');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/v1/app/orders', {
        phone: user.phone,
        items: orderItems,
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress,
        payment_method: paymentMethod
      });
      if (res.data.code === 200) {
        message.success({
          content: '支付成功！订单已自动创建，可前往“个人-订单信息”查看。🐾',
          duration: 4
        });
        setCart({});
        setCheckoutModalOpen(false);
        // Sync lists
        fetchProducts();
        fetchAppOrders();
        
        // Record expense locally for pet accounting if currentPet exists
        if (currentPet) {
          const orderTotal = res.data.data.total_amount;
          await axios.post('/api/v1/app/expenses', {
            petId: currentPet.id,
            category: 'supplies',
            amount: orderTotal,
            notes: `商城订单 ${res.data.data.id}`
          });
          fetchExpenses(currentPet.id);
        }
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || '购买或支付失败，请检查商品库存');
    } finally {
      setLoading(false);
    }
  };

  // API Call: Send Chat Message to Gemini / Simulated Assistant
  // Helper: send with explicit text (used by suggestion chips)
  const handleSendChatWithText = async (text: string) => {
    setChatMessages(prev => [...prev, { sender: 'user', text }]);
    setAiTyping(true);
    try {
      const formattedHistory = chatMessages
        .filter(msg => msg.text)
        .map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', content: msg.text }));
      const res = await axios.post('/api/v1/app/ai/chat', {
        message: text,
        petName: currentPet?.name,
        petType: currentPet?.type,
        petBreed: currentPet?.breed,
        petWeight: currentPet?.weight,
        petGender: currentPet?.gender,
        history: formattedHistory
      });
      setChatMessages(prev => [...prev, { sender: 'ai', text: res.data.data.reply, notice: res.data.data.notice }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: '🐾 不好意思，AI服务暂时连接不上～\n\n请稍后再试或者换个问题问我吧！' }]);
    } finally {
      setAiTyping(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setAiTyping(true);

    try {
      const formattedHistory = chatMessages
        .filter(msg => msg.text)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          content: msg.text
        }));

      const res = await axios.post('/api/v1/app/ai/chat', {
        message: userText,
        petName: currentPet?.name,
        petType: currentPet?.type,
        petBreed: currentPet?.breed,
        petWeight: currentPet?.weight,
        petGender: currentPet?.gender,
        history: formattedHistory
      });

      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'ai', 
          text: res.data.data.reply,
          notice: res.data.data.notice
        }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: '🐾 喵呜……网络好像有些小波动，但作为您心爱的宠物管家，我一如既往守护在您 and 毛孩子身边！记得按时投喂它哦！🐾' }
      ]);
    } finally {
      setAiTyping(false);
    }
  };

  // Nav to specific feature pages
  const handleOpenFeature = (featureKey: string) => {
    setActiveFeature(featureKey);
    setScreen('feature');
  };

  // Total Expenses this month
  const totalThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Return to Home
  const handleBackToHome = () => {
    setScreen('home');
  };

  // Logout App User
  const handleLogoutApp = () => {
    setUser(null);
    setScreen('login');
    setIsCodeSent(false);
    setCart({});
    setPets([]);
    setCurrentPet(null);
  };

  // Onboarding animal assets details
  const onboardingAnimals = [
    { emoji: '🐱', label: '喵星人' },
    { emoji: '🐶', label: '汪星人' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#121214',
      color: '#E6E6E6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* WORKSPACE HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#1A1A1E',
        padding: '12px 24px',
        borderBottom: '1px solid #2D2D34',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🐾</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 900, fontSize: 16, color: '#FFB23F', letterSpacing: '0.5px' }}>
                XIAOZHUA MOBILE WORKSPACE
              </span>
              <span style={{
                background: 'rgba(255, 178, 63, 0.15)',
                color: '#FFB23F',
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 4,
                fontWeight: 700,
                border: '1px solid rgba(255, 178, 63, 0.3)'
              }}>
                Flutter Target: iOS 17.0+ | Android 10+ | HarmonyOS NEXT (原生多端)
              </span>
            </div>
            <span style={{ fontSize: 11, color: '#888', display: 'block', marginTop: 2 }}>
              小爪 APP 独立开发控制台 · Flutter 原生工程与 H5 小程序联调沙箱
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Tab controllers */}
          <div style={{
            display: 'flex',
            background: '#26262B',
            borderRadius: 10,
            padding: 4,
            border: '1px solid #32323A'
          }}>
            <button
              onClick={() => setWorkspaceTab('explorer')}
              style={{
                background: workspaceTab === 'explorer' ? '#FFB23F' : 'transparent',
                color: workspaceTab === 'explorer' ? '#121214' : '#E6E6E6',
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>📂</span>
              <span>Flutter 独立原生端</span>
            </button>
            <button
              onClick={() => setWorkspaceTab('simulator')}
              style={{
                background: workspaceTab === 'simulator' ? '#FFB23F' : 'transparent',
                color: workspaceTab === 'simulator' ? '#121214' : '#E6E6E6',
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>📱</span>
              <span>H5 小程序沙箱</span>
            </button>
            <button
              onClick={() => setWorkspaceTab('compile_spec')}
              style={{
                background: workspaceTab === 'compile_spec' ? '#FFB23F' : 'transparent',
                color: workspaceTab === 'compile_spec' ? '#121214' : '#E6E6E6',
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>🛠️</span>
              <span>Flutter 编译构建规范</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#888' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span>独立原生移动端就绪</span>
          </div>
        </div>
      </div>

      {/* WORKSPACE BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* TAB 1: SIMULATOR WORKSPACE */}
        {workspaceTab === 'simulator' && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%' }}>
            {/* Left Control Column */}
            <div style={{
              width: 380,
              background: '#1A1A1E',
              borderRight: '1px solid #2D2D34',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto'
            }}>
              <div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#FFB23F', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 4 }}>
                    H5 Mini-Program Sandbox
                  </span>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#FFF' }}>H5 小程序沙箱联调</h3>
                  <p style={{ fontSize: 12, color: '#A0A0A5', marginTop: 6, lineHeight: 1.5 }}>
                    本沙箱专为 H5 轻量化小程序生态设计，与独立的原生 Flutter 移动端保持架构解耦，共享同一个安全 RESTful 交互后端。
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30 }}>
                  <div 
                    onClick={() => handleQuickLogin('13800138000')}
                    style={{
                      background: '#26262B',
                      border: '1px solid #32323A',
                      borderRadius: 12,
                      padding: 14,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FFB23F'; e.currentTarget.style.background = '#2D2D35'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#32323A'; e.currentTarget.style.background = '#26262B'; }}
                  >
                    <span style={{ fontSize: 24 }}>🐱</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#FFF', display: 'block' }}>旺财麻麻</span>
                      <span style={{ fontSize: 11, color: '#888', display: 'block', marginTop: 2 }}>手机号: 13800138000</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#FFB23F', fontWeight: 700 }}>快捷接入 →</span>
                  </div>

                  <div 
                    onClick={() => handleQuickLogin('13912345678')}
                    style={{
                      background: '#26262B',
                      border: '1px solid #32323A',
                      borderRadius: 12,
                      padding: 14,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FFB23F'; e.currentTarget.style.background = '#2D2D35'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#32323A'; e.currentTarget.style.background = '#26262B'; }}
                  >
                    <span style={{ fontSize: 24 }}>🐶</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#FFF', display: 'block' }}>猫咪守护者</span>
                      <span style={{ fontSize: 11, color: '#888', display: 'block', marginTop: 2 }}>手机号: 13912345678</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#FFB23F', fontWeight: 700 }}>快捷接入 →</span>
                  </div>
                </div>

                <div style={{ background: '#26262B', padding: 16, borderRadius: 12, border: '1px solid #32323A', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>🤖</span>
                    <span style={{ fontWeight: 800, fontSize: 12, color: '#FFB23F' }}>Gemini AI 智能大脑已就绪</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#A0A0A5', margin: 0, lineHeight: 1.5 }}>
                    中央 AI 系统已直连 <b>Gemini 3.5-flash</b> 极速推理引擎！小程序沙箱及 Flutter 端均可使用相同服务。
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 178, 63, 0.05)', padding: 14, borderRadius: 12, border: '1px dashed rgba(255, 178, 63, 0.2)' }}>
                  <span style={{ fontWeight: 800, fontSize: 11, color: '#FFB23F', display: 'block', marginBottom: 4 }}>💡 原生端与小程序关系</span>
                  <span style={{ fontSize: 11, color: '#A0A0A5', lineHeight: 1.4 }}>
                    小爪 App 原生端完全基于 <b>Flutter</b> 独立开发（代码保存在独立的 `mobile` 目录），此处 H5 仅用于微信小程序与快捷网页沙箱，两者独立并存。
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #2D2D34', paddingTop: 16, marginTop: 16, fontSize: 11, color: '#666' }}>
                <span>© XiaoZhua App Studio · 独立移动端与 H5 混合架构</span>
              </div>
            </div>





      {/* RIGHT: iPhone Simulator Core Body */}
      <div style={{
        flex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        background: 'linear-gradient(135deg, #FFF9F0 0%, #FFEEDD 100%)',
        position: 'relative'
      }}>
        {/* iPhone Outer Device Wrapper */}
        <div style={{
          width: 385,
          height: 775,
          borderRadius: 48,
          background: '#1F1F1F',
          padding: 13,
          boxShadow: '0 25px 60px rgba(120,60,10,0.22), inset 0 2px 8px rgba(255,255,255,0.2)',
          border: '4px solid #3d3d3d',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Side Buttons Visual decoration */}
          <div style={{ position: 'absolute', width: 3, height: 40, left: -7, top: 120, background: '#3D3D3D', borderRadius: '4px 0 0 4px' }} />
          <div style={{ position: 'absolute', width: 3, height: 50, left: -7, top: 180, background: '#3D3D3D', borderRadius: '4px 0 0 4px' }} />
          <div style={{ position: 'absolute', width: 3, height: 50, left: -7, top: 240, background: '#3D3D3D', borderRadius: '4px 0 0 4px' }} />
          <div style={{ position: 'absolute', width: 3, height: 75, right: -7, top: 170, background: '#3D3D3D', borderRadius: '0 4px 4px 0' }} />

          {/* iPhone Inner Bezel Screen */}
          <div style={{
            flex: 1,
            borderRadius: 36,
            background: '#FFFDF9',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
          }}>
            {/* Status Bar Section */}
            <div style={{
              height: 38,
              background: '#FFFDF9',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              fontWeight: 700,
              color: '#333',
              zIndex: 10,
              position: 'relative',
              userSelect: 'none'
            }}>
              <span>{currentTime}</span>
              {/* Dynamic Island / Notch Mock */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: 8,
                transform: 'translateX(-50%)',
                width: 100,
                height: 24,
                borderRadius: 12,
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px'
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1c1c1c' }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#0e1111' }} />
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <svg width="15" height="10" viewBox="0 0 15 10" style={{ fill: '#2D2621' }}>
                  <rect x="0" y="8" width="2" height="2" rx="0.5" />
                  <rect x="3" y="6" width="2" height="4" rx="0.5" />
                  <rect x="6" y="4" width="2" height="6" rx="0.5" />
                  <rect x="9" y="2" width="2" height="8" rx="0.5" />
                  <rect x="12" y="0" width="2" height="10" rx="0.5" />
                </svg>
                <svg width="14" height="10" viewBox="0 0 14 10" style={{ fill: 'none', stroke: '#2D2621', strokeWidth: '1.6', strokeLinecap: 'round' }}>
                  <path d="M1 2.5C4 0.5 10 0.5 13 2.5" />
                  <path d="M3 5.5C5.5 4 8.5 4 11 5.5" />
                  <path d="M5.5 8C6.5 7.2 7.5 7.2 8.5 8" />
                </svg>
                <svg width="22" height="11" viewBox="0 0 22 11" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" fill="none" stroke="#2D2621" strokeWidth="1" />
                  <rect x="2.5" y="2.5" width="12" height="6" rx="1.5" fill="#2D2621" />
                  <path d="M20 3.5C20.5 3.5 21 4 21 4.5V6.5C21 7 20.5 7.5 20 7.5" fill="none" stroke="#2D2621" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* SCREEN BODY SCROLLER */}
            <div style={{
              flex: 1,
              overflowY: (screen === 'feature' && activeFeature === 'ai') ? 'hidden' : 'auto',
              padding: (screen === 'feature' && activeFeature === 'ai') ? '0' : '14px 16px 24px 16px',
              display: 'flex',
              flexDirection: 'column',
              background: '#FAF6F0',
              transition: 'all 0.2s ease'
            }}>
              {/* SCREEN 0: Phone Login Page */}
              {screen === 'login' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px 10px' }}>
                  <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(255,138,61,0.25)'
                    }}>
                      <img src={appLogoImg} alt="小爪" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: 22, fontWeight: 900, color: '#2D2621', letterSpacing: 1 }}>小爪</h2>
                    <span style={{ fontSize: 13, color: '#8C6239', fontWeight: 500 }}>记录每一个爪印时刻</span>
                  </div>

                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: 24,
                    padding: '28px 20px',
                    boxShadow: '0 10px 30px rgba(45,38,33,0.04)',
                    border: '1px solid #EADEC9'
                  }}>
                    <div style={{ marginBottom: 20 }}>
                      <span style={{ fontSize: 12, color: '#8C6239', fontWeight: 700, display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>手机号</span>
                      <Input
                        placeholder="请输入您的手机号"
                        size="large"
                        maxLength={11}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ borderRadius: 12, borderColor: '#EADEC9', height: 46 }}
                      />
                    </div>

                    <div style={{ marginBottom: 28 }}>
                      <span style={{ fontSize: 12, color: '#8C6239', fontWeight: 700, display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>短信验证码</span>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <Input
                          placeholder="4位验证码"
                          size="large"
                          maxLength={4}
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          style={{ borderRadius: 12, borderColor: '#EADEC9', height: 46 }}
                        />
                        <Button
                          size="large"
                          disabled={countdown > 0}
                          style={{
                            borderRadius: 12,
                            background: countdown > 0 ? '#FAF6F0' : '#FF8A3D',
                            borderColor: countdown > 0 ? '#EADEC9' : '#FF8A3D',
                            color: countdown > 0 ? '#A8621B' : '#FFF',
                            fontSize: 13,
                            fontWeight: 700,
                            height: 46,
                            padding: '0 18px'
                          }}
                          onClick={handleSendCode}
                        >
                          {countdown > 0 ? `${countdown}s` : '获取'}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={loading}
                      style={{
                        height: 48,
                        borderRadius: 14,
                        background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)',
                        borderColor: '#FF8A3D',
                        fontSize: 15,
                        fontWeight: 800,
                        boxShadow: '0 6px 18px rgba(255,138,61,0.2)'
                      }}
                      onClick={handleLoginSubmit}
                    >
                      验证并登录
                    </Button>
                  </div>
                </div>
              )}

              {/* SCREEN 1: Onboarding Pet Profiling */}
              {screen === 'onboarding' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {/* Top Bar onboarding */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleOnboardingPrev} disabled={onboardingStep === 0} />
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#A8621B' }}>新建宠物档案 ({onboardingStep + 1}/7)</span>
                    <span style={{ width: 32 }} />
                  </div>

                  {/* Onboarding steps contents — 7 steps matching 小爪App Flutter flow */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                    {/* STEP 0: Profile Setup — 用户昵称 (matching /profile-setup) */}
                    {onboardingStep === 0 && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: 72, height: 72, borderRadius: 24,
                          background: 'linear-gradient(135deg, #FFB23F 0%, #FF8A3D 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 16px auto',
                          boxShadow: '0 8px 20px rgba(255,138,61,0.2)'
                        }}>
                          <UserOutlined style={{ fontSize: 32, color: '#FFF' }} />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#2D2621', marginBottom: 4 }}>欢迎使用小爪！</h3>
                        <span style={{ fontSize: 12, color: '#8C6239', display: 'block', marginBottom: 20 }}>先告诉我们关于你的信息</span>

                        <div style={{ background: '#FFF', borderRadius: 24, padding: 20, border: '1px solid #EADEC9', textAlign: 'left' }}>
                          <span style={{ fontSize: 12, color: '#8C6239', fontWeight: 700, display: 'block', marginBottom: 8 }}>你的昵称</span>
                          <Input
                            placeholder="如：小宝妈妈、旺财铲屎官…"
                            size="large"
                            value={newPetForm.userNickname}
                            onChange={(e) => setNewPetForm({ ...newPetForm, userNickname: e.target.value })}
                            style={{ borderRadius: 12, borderColor: '#EADEC9' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 1: Pet Type — 宠物种类 (matching /pet-type) */}
                    {onboardingStep === 1 && (
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#2D2621', textAlign: 'center', marginBottom: 16 }}>毛孩子是哪一类星人？</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {['猫咪', '狗狗', '小兔', '其他'].map((t) => {
                            const isSelected = t === '其他'
                              ? !['猫咪', '狗狗', '小兔'].includes(newPetForm.type)
                              : newPetForm.type === t;
                            return (
                              <Button
                                key={t}
                                size="large"
                                style={{
                                  height: 50,
                                  borderRadius: 14,
                                  background: isSelected ? '#FFF4DE' : '#FFF',
                                  borderColor: isSelected ? '#FFB23F' : '#EADEC9',
                                  color: isSelected ? '#FF8A3D' : '#8C6239',
                                  fontWeight: 900,
                                  fontSize: 14
                                }}
                                onClick={() => {
                                  if (t === '其他') {
                                    setNewPetForm({ ...newPetForm, type: '', breed: '', emoji: '🐾' });
                                  } else {
                                    const defaultBreed = t === '猫咪' ? '英国短毛猫' : t === '狗狗' ? '金毛巡回猎犬' : '侏儒兔';
                                    setNewPetForm({ ...newPetForm, type: t, breed: defaultBreed, emoji: t === '猫咪' ? '🐱' : t === '狗狗' ? '🐶' : t === '小兔' ? '🐰' : '🐾' });
                                  }
                                }}
                              >
                                {t === '猫咪' ? '猫咪家族' : t === '狗狗' ? '狗狗家族' : t === '小兔' ? '兔兔家族' : '其他品种'}
                              </Button>
                            );
                          })}

                          {!['猫咪', '狗狗', '小兔'].includes(newPetForm.type) && (
                            <div style={{ marginTop: 8 }}>
                              <span style={{ fontSize: 12, color: '#8C6239', fontWeight: 700, display: 'block', marginBottom: 6 }}>手动填写宠物种类</span>
                              <Input
                                placeholder="如：仓鼠、龙猫、爬宠、鹦鹉"
                                size="large"
                                value={newPetForm.type}
                                onChange={(e) => setNewPetForm({ ...newPetForm, type: e.target.value })}
                                style={{ borderRadius: 12, borderColor: '#EADEC9' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Pet Detail — 名字+品种+生日+到家时间 (matching /pet-detail) */}
                    {onboardingStep === 2 && (
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#2D2621', textAlign: 'center', marginBottom: 16 }}>让我们更了解它</h3>
                        <div style={{ background: '#FFF', borderRadius: 24, padding: 20, border: '1px solid #EADEC9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                          <div style={{ marginBottom: 14 }}>
                            <span style={{ fontSize: 12, color: '#8C6239', fontWeight: 700, display: 'block', marginBottom: 8 }}>🏷️ 它的名字</span>
                            <Input
                              placeholder="例如：旺财、咪咪、大白"
                              size="large"
                              value={newPetForm.name}
                              onChange={(e) => setNewPetForm({ ...newPetForm, name: e.target.value })}
                              style={{ borderRadius: 12, borderColor: '#EADEC9' }}
                            />
                          </div>
                          <div style={{ marginBottom: 14 }}>
                            <span style={{ fontSize: 12, color: '#8C6239', fontWeight: 700, display: 'block', marginBottom: 8 }}>🏷️ 品种</span>
                            <Input
                              placeholder={newPetForm.type === '狗狗' ? '如：金毛、柯基、柴犬...' : newPetForm.type === '猫咪' ? '如：英短、布偶、暹罗...' : '请输入宠物品种'}
                              size="large"
                              value={newPetForm.breed}
                              onChange={(e) => setNewPetForm({ ...newPetForm, breed: e.target.value })}
                              style={{ borderRadius: 12, borderColor: '#EADEC9' }}
                            />
                          </div>
                          <div style={{ marginBottom: 14 }}>
                            <span style={{ fontSize: 12, color: '#8C6239', fontWeight: 700, display: 'block', marginBottom: 8 }}>🎂 宠物生日</span>
                            <div
                              onClick={() => setDatePickerOpen('birthday')}
                              style={{
                                height: 42, borderRadius: 12, border: '1px solid #EADEC9',
                                display: 'flex', alignItems: 'center', padding: '0 12px',
                                cursor: 'pointer', background: '#FFF',
                                fontSize: 15, color: newPetForm.birthday ? '#2D2621' : '#C0A080',
                                fontWeight: newPetForm.birthday ? 600 : 400
                              }}
                            >
                              {newPetForm.birthday || '选择日期'}
                              <CalendarOutlined style={{ marginLeft: 'auto', color: '#C0A080' }} />
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: 12, color: '#8C6239', fontWeight: 700, display: 'block', marginBottom: 8 }}>🏠 到家时间</span>
                            <div
                              onClick={() => setDatePickerOpen('arrival')}
                              style={{
                                height: 42, borderRadius: 12, border: '1px solid #EADEC9',
                                display: 'flex', alignItems: 'center', padding: '0 12px',
                                cursor: 'pointer', background: '#FFF',
                                fontSize: 15, color: '#2D2621', fontWeight: 600
                              }}
                            >
                              {newPetForm.arrivalDate || newPetForm.meetDate || '选择日期'}
                              <CalendarOutlined style={{ marginLeft: 'auto', color: '#C0A080' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Gender — 性别 (matching /gender) */}
                    {onboardingStep === 3 && (
                      <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#2D2621', marginBottom: 20 }}>毛孩子的性别是？</h3>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                          <div
                            style={{
                              width: 115,
                              height: 115,
                              background: newPetForm.gender === '男孩' ? '#E0F2FE' : '#FFF',
                              border: newPetForm.gender === '男孩' ? '2px solid #0284C7' : '1px solid #EADEC9',
                              borderRadius: 24,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: newPetForm.gender === '男孩' ? '0 6px 15px rgba(2,132,199,0.1)' : 'none',
                              transition: 'all 0.2s'
                            }}
                            onClick={() => setNewPetForm({ ...newPetForm, gender: '男孩' })}
                          >
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                              <UserOutlined style={{ fontSize: 20, color: '#0284C7' }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#0284C7' }}>小正太 (男孩)</span>
                          </div>
                          <div
                            style={{
                              width: 115,
                              height: 115,
                              background: newPetForm.gender === '女孩' ? '#FCE7F3' : '#FFF',
                              border: newPetForm.gender === '女孩' ? '2px solid #DB2777' : '1px solid #EADEC9',
                              borderRadius: 24,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: newPetForm.gender === '女孩' ? '0 6px 15px rgba(219,39,119,0.1)' : 'none',
                              transition: 'all 0.2s'
                            }}
                            onClick={() => setNewPetForm({ ...newPetForm, gender: '女孩' })}
                          >
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                              <UserOutlined style={{ fontSize: 20, color: '#DB2777' }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#DB2777' }}>小公主 (女孩)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Weight — 体重 (matching /weight) */}
                    {onboardingStep === 4 && (
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#2D2621', textAlign: 'center', marginBottom: 16 }}>当前体重是多少？</h3>
                        <div style={{ background: '#FFF', borderRadius: 24, padding: 24, border: '1px solid #EADEC9', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                            <div style={{
                              width: 120, height: 110, borderRadius: 20,
                              background: '#FFF9F5', border: '1px solid #FFE2C4',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              boxShadow: '0 4px 10px rgba(255,138,61,0.04)'
                            }}>
                              <span style={{ fontSize: 36, fontWeight: 900, color: '#FF8A3D' }}>{Math.round(newPetForm.weight || 4)}</span>
                              <span style={{ fontSize: 18, fontWeight: 800, color: '#C0A080' }}>KG</span>
                            </div>
                          </div>
                          <Button
                            type="default"
                            onClick={openWeightPicker}
                            style={{
                              borderRadius: 10, border: '1px dashed #FFB23F', color: '#FF8A3D',
                              fontWeight: 700, fontSize: 13
                            }}
                          >
                            滑动选择体重
                          </Button>
                          <span style={{ display: 'block', fontSize: 11, color: '#8C6239', marginTop: 12 }}>精确的体重能帮我们计算更合理的食谱成分哦</span>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: Avatar — 宠物头像 (matching Flutter /avatar) */}
                    {onboardingStep === 5 && (
                      <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#2D2621', marginBottom: 4 }}>宠物头像</h3>
                        <span style={{ fontSize: 12, color: '#A8621B', display: 'block', marginBottom: 12 }}>选一个可爱的头像或上传照片</span>

                        {/* Large circular preview — matching Flutter design */}
                        <div onClick={() => document.getElementById('avatar-file-input')?.click()}
                          style={{
                            width: 88, height: 88, borderRadius: '50%',
                            background: '#FEF3C6', border: '4px solid #FFB23F',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 12px auto', overflow: 'hidden', cursor: 'pointer',
                            boxShadow: '0 6px 20px rgba(255,178,63,0.3)'
                          }}>
                          {newPetForm.emoji && (newPetForm.emoji.startsWith('http') || newPetForm.emoji.startsWith('data:')) ? (
                            <img src={newPetForm.emoji} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
                          ) : (
                            <span style={{ fontSize: 42 }}>{newPetForm.emoji || '🐕'}</span>
                          )}
                        </div>
                        <span onClick={() => document.getElementById('avatar-file-input')?.click()}
                          style={{ fontSize: 12, color: '#FF8A3D', cursor: 'pointer', fontWeight: 700 }}>
                          📷 {newPetForm.emoji && (newPetForm.emoji.startsWith('http') || newPetForm.emoji.startsWith('data:')) ? '更换照片' : '上传头像'}
                        </span>
                        <input id="avatar-file-input" type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target?.files?.[0];
                            if (file) { const r = new FileReader(); r.onloadend = () => setNewPetForm({ ...newPetForm, emoji: r.result as string }); r.readAsDataURL(file); }
                          }} />

                        {/* Emoji grid — matching Flutter */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 14 }}>
                          {['🐕', '🐩', '🐈', '🐇', '🐹', '🐰', '🦜', '🐠', '🦮', '🐕‍🦺', '🐈‍⬛', '🐢'].map((emoji) => {
                            const sel = newPetForm.emoji === emoji;
                            return (
                              <div key={emoji} onClick={() => setNewPetForm({ ...newPetForm, emoji })}
                                style={{
                                  height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: sel ? '#FEF3C6' : '#FFF', border: sel ? '2px solid #FFB23F' : '1px solid #FFE7D1',
                                  borderRadius: 12, cursor: 'pointer', fontSize: 24, transition: 'all 0.15s',
                                  boxShadow: sel ? '0 3px 10px rgba(255,178,63,0.25)' : '0 1px 3px rgba(0,0,0,0.04)'
                                }}>{emoji}</div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* STEP 6: Profile Preview — 资料预览 (matching /profile-preview) */}
                    {onboardingStep === 6 && (
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#2D2621', textAlign: 'center', marginBottom: 4 }}>确认档案信息 🎉</h3>
                        <span style={{ fontSize: 12, color: '#8C6239', display: 'block', textAlign: 'center', marginBottom: 14 }}>检查一下，没问题就开启小爪之旅吧</span>

                        <div style={{ background: '#FFF', borderRadius: 20, padding: 16, border: '1px solid #FFE7D1', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                          {/* User info */}
                          {newPetForm.userNickname && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '8px 10px', background: '#FFFDF5', borderRadius: 12, border: '1px solid #FFE7D1' }}>
                              <UserOutlined style={{ color: '#FF8A3D', fontSize: 16 }} />
                              <div>
                                <span style={{ fontSize: 10, color: '#999', display: 'block' }}>铲屎官</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2621' }}>{newPetForm.userNickname}</span>
                              </div>
                            </div>
                          )}

                          {/* Pet preview card */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px', background: '#FFFDF9', borderRadius: 16, border: '2px solid #FFE7D1' }}>
                            <div style={{
                              width: 60, height: 60, borderRadius: 16,
                              background: '#FFF4DE',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 32, overflow: 'hidden'
                            }}>
                              {newPetForm.emoji && (newPetForm.emoji.startsWith('http') || newPetForm.emoji.startsWith('data:'))
                                ? <img src={newPetForm.emoji} style={{ width: 60, height: 60, objectFit: 'cover' }} alt="pet" />
                                : <span>{newPetForm.emoji}</span>
                              }
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <span style={{ fontSize: 16, fontWeight: 900, color: '#2D2621' }}>{newPetForm.name || '未命名'}</span>
                                <span style={{ fontSize: 11, color: newPetForm.gender === '男孩' ? '#0284C7' : '#DB2777', fontWeight: 700 }}>
                                  {newPetForm.gender === '男孩' ? '♂' : '♀'}
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: '#8C6239', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                                <span>🐾 {newPetForm.type}</span>
                                <span>🏷️ {newPetForm.breed || '未设置'}</span>
                                <span>⚖️ {newPetForm.weight} KG</span>
                              </div>
                              {newPetForm.birthday && <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>🎂 {newPetForm.birthday}</div>}
                              <div style={{ fontSize: 10, color: '#999' }}>🏠 到家 {newPetForm.meetDate}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Onboarding Bottom nav */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    disabled={
                      (onboardingStep === 1 && !newPetForm.type) ||
                      (onboardingStep === 2 && !newPetForm.name)
                    }
                    style={{
                      height: 48,
                      borderRadius: 14,
                      background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)',
                      borderColor: '#FF8A3D',
                      fontWeight: 800,
                      fontSize: 15,
                      marginTop: 16,
                      boxShadow: '0 4px 12px rgba(255,138,61,0.15)'
                    }}
                    onClick={handleOnboardingNext}
                  >
                    {onboardingStep === 6 ? '开启小爪管家生活 🎉' : '下一步 →'}
                  </Button>
                </div>
              )}

              {/* SCREEN 2: App Home Main Dashboard */}
              {screen === 'home' && currentPet && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  
                  {/* Top Navbar: Integrated Pet Header mimicking Figure 1 Left Corner */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Pet Avatar in a Circular avatar shape (replacing Smile face/old avatar) */}
                      <PetAvatar emojiOrUrl={currentPet.emoji} size={48} borderRadius={24} />
                      
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 900, color: '#2D2621' }}>{currentPet.name}</span>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: currentPet.gender === '男孩' ? '#EAB308' : '#EC4899', // GG or MM colors
                          }}>
                            {currentPet.gender === '男孩' ? 'GG' : 'MM'}
                          </span>
                          <span style={{ fontSize: 12, color: '#8C6239', fontWeight: 500 }}>{currentPet.breed}</span>
                          
                          {/* Pet Switch Select Indicator built in-line */}
                          {pets.length > 1 && (
                            <Dropdown
                              menu={{
                                items: pets.map(p => ({
                                  key: String(p.id),
                                  label: p.name,
                                })),
                                onClick: ({ key }) => handleSwitchPet(key)
                              }}
                              trigger={['click']}
                            >
                              <DownOutlined style={{ fontSize: 11, color: '#FF8A3D', cursor: 'pointer', paddingLeft: 2 }} />
                            </Dropdown>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: '#999', marginTop: 1 }}>
                          相伴 {currentPet.daysTogether || 0} 天 · 与你相伴{currentPet.daysTogether || 0}天
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button
                        size="small"
                        type="text"
                        onClick={handleQuickAddPet}
                        style={{
                          background: '#FFF4DE',
                          color: '#FF8A3D',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          border: '1px solid #FFE7D1',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <PlusOutlined style={{ fontSize: 9 }} /> 新的成员
                      </Button>
                    </div>
                  </div>

                  {/* Quick Pills Indicator bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    <div
                      style={{
                        background: '#FFFFFF',
                        borderRadius: 16,
                        padding: '10px 8px',
                        textAlign: 'center',
                        border: '1px solid #EADEC9',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => handleOpenFeature('reminder')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 3 }}>
                        <BellOutlined style={{ fontSize: 11, color: '#D97706' }} />
                        <span style={{ fontSize: 11, color: '#8C6239', fontWeight: 700 }}>疫苗接种</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#D97706', display: 'block' }}>
                        {reminders.filter(r => !r.done).length > 0 ? `${reminders.filter(r => !r.done).length} 项未完` : '无事务'}
                      </span>
                    </div>

                    <div
                      style={{
                        background: '#FFFFFF',
                        borderRadius: 16,
                        padding: '10px 8px',
                        textAlign: 'center',
                        border: '1px solid #EADEC9',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => handleOpenFeature('accounting')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 3 }}>
                        <PayCircleOutlined style={{ fontSize: 11, color: '#10B981' }} />
                        <span style={{ fontSize: 11, color: '#8C6239', fontWeight: 700 }}>本月花费</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#10B981', display: 'block' }}>¥{totalThisMonth}</span>
                    </div>

                    <div
                      style={{
                        background: '#FFFFFF',
                        borderRadius: 16,
                        padding: '10px 8px',
                        textAlign: 'center',
                        border: '1px solid #EADEC9',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => handleOpenFeature('stock')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 3 }}>
                        <InboxOutlined style={{ fontSize: 11, color: '#0EA5E9' }} />
                        <span style={{ fontSize: 11, color: '#8C6239', fontWeight: 700 }}>囤货提醒</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#0EA5E9', display: 'block' }}>
                        {stocks.filter(s => s.remaining === 0).length > 0 ? `${stocks.filter(s => s.remaining === 0).length} 项断货` : '储备充足'}
                      </span>
                    </div>
                  </div>

                  {/* Ad banner (Image 2 style) */}
                  <div
                    style={{
                      width: '100%',
                      height: 100,
                      borderRadius: 20,
                      overflow: 'hidden',
                      backgroundImage: "linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.5) 100%), url('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(45,38,33,0.1)',
                      border: '1px solid rgba(255,178,63,0.1)'
                    }}
                    onClick={() => handleOpenFeature('spa')}
                  >
                    {/* Top-left Badge */}
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 12,
                      background: '#FFB23F',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 9,
                      fontWeight: 900,
                      color: '#2D2621',
                      zIndex: 10
                    }}>
                      特惠预约
                    </div>

                    {/* Middle Info text */}
                    <div style={{ flex: 1, marginTop: 14, zIndex: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#FFF', display: 'block', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        👑 皇家夏季草本深层芳疗 SPA
                      </span>
                      <span style={{ fontSize: 9, color: '#E5E7EB', display: 'block', marginTop: 2, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        瑞士负离子防静电防虫尊享大促，全国...
                      </span>
                    </div>

                    {/* Right Orange Circle Arrow action */}
                    <div style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#FF8A3D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(255,138,61,0.4)',
                      zIndex: 5
                    }}>
                      <RightOutlined style={{ color: '#FFF', fontSize: 10 }} />
                    </div>

                    {/* Bottom Indicator Dots */}
                    <div style={{
                      position: 'absolute',
                      bottom: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      zIndex: 5
                    }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                      <div style={{ width: 12, height: 4, borderRadius: 2, background: '#FFB23F' }} />
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                    </div>
                  </div>

                  {/* Your Devices (您的设备) Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                      borderRadius: 20,
                      padding: '14px 16px',
                      color: '#FFF',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => handleOpenFeature('devices')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #FFB23F 0%, #FF8A3D 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(255,138,61,0.2)'
                      }}>
                        <NotificationOutlined style={{ fontSize: 20, color: '#FFF' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: '#FFF8F0', letterSpacing: 0.5 }}>您的设备</h4>
                          <span style={{
                            fontSize: 8,
                            padding: '1px 5px',
                            borderRadius: 4,
                            background: '#10B981',
                            color: '#FFF',
                            fontWeight: 900,
                            letterSpacing: 0.5
                          }}>ONLINE</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#9CA3AF', display: 'block' }}>绑定宠物监控、GPS定位器、智能水机等</span>
                      </div>
                      <RightOutlined style={{ fontSize: 12, color: '#FFB23F', opacity: 0.8 }} />
                    </div>
                  </div>

                  {/* Feature Menu Grid: 4 columns, borderless, cute enlarged icons mimicking Figure 1 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px 6px',
                    marginTop: 8,
                    marginBottom: 8,
                    padding: '4px 0'
                  }}>
                    {[
                      { key: 'reminder', label: '提醒', icon: <BellOutlined />, color: '#D97706', bg: '#FEF3C7' },
                      { key: 'accounting', label: '记账', icon: <PayCircleOutlined />, color: '#10B981', bg: '#D1FAE5' },
                      { key: 'recipe', label: '食谱', icon: <CoffeeOutlined />, color: '#3B82F6', bg: '#DBEAFE' },
                      { key: 'stock', label: '囤货', icon: <InboxOutlined />, color: '#14B8A6', bg: '#CCFBF1' },
                      { key: 'note', label: '记事', icon: <EditOutlined />, color: '#8B5CF6', bg: '#F3E8FF' },
                      { key: 'weight', label: '体重', icon: <DashboardOutlined />, color: '#FF8A3D', bg: '#FFF4DE' },
                      { key: 'medical', label: '病历', icon: <MedicineBoxOutlined />, color: '#EC4899', bg: '#FCE7F3' },
                      { key: 'shop', label: '商城', icon: <ShopOutlined />, color: '#FF8A3D', bg: '#FFF4DE' },
                      { key: 'album', label: '相册', icon: <CameraOutlined />, color: '#6366F1', bg: '#E0E7FF' }
                    ].map((feat) => {
                      return (
                        <div
                          key={feat.key}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onClick={() => handleOpenFeature(feat.key)}
                        >
                          {/* Circle Icon Container */}
                          <div style={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            background: feat.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: feat.color,
                            fontSize: 22,
                            marginBottom: 6,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                            border: '1px solid rgba(0,0,0,0.02)',
                            transition: 'transform 0.2s',
                          }}
                          >
                            {feat.icon}
                          </div>
                          <span style={{
                            fontSize: 11,
                            color: '#4A3E3D',
                            fontWeight: 700,
                            letterSpacing: 0.2,
                            textAlign: 'center'
                          }}>
                            {feat.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SCREEN 3: Active Feature Sub-pages */}
              {screen === 'feature' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Sub-page Header nav */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #FFE7D1',
                    paddingBottom: 8,
                    marginBottom: activeFeature === 'ai' ? 0 : 10,
                    padding: activeFeature === 'ai' ? '12px 16px 8px 16px' : '0 0 8px 0',
                    background: activeFeature === 'ai' ? '#FFFDF9' : 'transparent',
                    zIndex: 20
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBackToHome} style={{ padding: 4 }} />
                      <span style={{ fontSize: 15, fontWeight: 900, color: '#2D2621', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {activeFeature === 'weight' && t('体重监测', 'Weight Tracking')}
                        {activeFeature === 'reminder' && t('日常提醒', 'Reminders')}
                        {activeFeature === 'accounting' && t('宠物账本', 'Pet Ledger')}
                        {activeFeature === 'recipe' && t('营养食谱', 'Recipes')}
                        {activeFeature === 'note' && t('萌宠日记', 'Diary')}
                        {activeFeature === 'medical' && t('病例医疗', 'Medical')}
                        {activeFeature === 'stock' && t('囤货库存', 'Inventory')}
                        {activeFeature === 'album' && t('照片墙', 'Photo Wall')}
                        {activeFeature === 'shop' && t('小爪严选商城', 'XiaoZhua Mall')}
                        {activeFeature === 'pet-manage' && t('宠物管理', 'Pet Management')}
                        {activeFeature === 'ai' && t('AI管家', 'AI Companion')}
                        {activeFeature === 'me' && t('个人', 'Profile')}
                        {activeFeature === 'message' && t('消息中心', 'Message Center')}
                        {activeFeature === 'devices' && t('您的设备', 'Devices')}
                        {activeFeature === 'spa' && t('特惠预约 SPA', 'VIP SPA Booking')}
                      </span>
                    </div>

                    {activeFeature === 'shop' && (
                      <Button 
                        size="small" 
                        type="primary" 
                        icon={<span>🤖</span>}
                        onClick={handleAiRecommend}
                        style={{ 
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', 
                          borderColor: 'transparent',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 900,
                          color: '#FFF',
                          boxShadow: '0 2px 6px rgba(139,92,246,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {t('AI推荐', 'AI Recommend')}
                      </Button>
                    )}
                  </div>

                  {/* SUB-PAGE CONTENTS */}
                  <div style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: (activeFeature === 'ai' || activeFeature === 'shop') ? 'hidden' : 'auto',
                    display: (activeFeature === 'ai' || activeFeature === 'shop') ? 'flex' : 'block',
                    flexDirection: (activeFeature === 'ai' || activeFeature === 'shop') ? 'column' : undefined,
                    height: '100%',
                    overflow: (activeFeature === 'ai' || activeFeature === 'shop') ? 'hidden' : undefined
                  }}>
                    
                    {/* FEATURE: Weight Tracker */}
                    {activeFeature === 'weight' && currentPet && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ background: '#FFF', padding: 14, borderRadius: 16, border: '1px solid #FFE7D1', textAlign: 'center' }}>
                          <span style={{ fontSize: 11, color: '#999' }}>当前体重</span>
                          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#FF8A3D', margin: '2px 0' }}>{currentPet.weight} <span style={{ fontSize: 14 }}>KG</span></h2>
                          <span style={{ fontSize: 11, color: '#C09060' }}>上次测量：{weights[weights.length - 1]?.recordDate || '无记录'}</span>
                        </div>

                        {/* Add weight record */}
                        <div style={{ background: '#FFF', padding: 14, borderRadius: 16, border: '1px solid #FFE7D1', textAlign: 'center' }}>
                          <Button 
                            type="primary" 
                            onClick={() => setSubpageWeightOpen(true)} 
                            style={{ 
                              background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)', 
                              border: 'none', 
                              borderRadius: 12, 
                              height: 40, 
                              fontWeight: 800,
                              width: '100%'
                            }}
                          >
                            ⚖️ 滚动记录新体重
                          </Button>
                        </div>

                        <WheelWeightPickerModal
                          open={subpageWeightOpen}
                          onClose={() => setSubpageWeightOpen(false)}
                          value={currentPet.weight}
                          onChange={async (v) => {
                            try {
                              const res = await axios.post('/api/v1/app/weights', {
                                petId: currentPet.id,
                                weight: v
                              });
                              setWeights([...weights, res.data.data]);
                              setCurrentPet({ ...currentPet, weight: v });
                              setPets(pets.map(p => p.id === currentPet.id ? { ...p, weight: v } : p));
                              message.success(`成功记录体重：${v} KG！`);
                            } catch (err) {
                              message.error('体重记录失败');
                            }
                          }}
                        />

                        {/* Weight records list */}
                        <h4 style={{ margin: '8px 0 2px 0', color: '#8C6239' }}>测量历史</h4>
                        <div style={{ maxHeight: 200, overflowY: 'auto', background: '#FFF', borderRadius: 12, border: '1px solid #FFE7D1' }}>
                          <List
                            size="small"
                            dataSource={[...weights].reverse()}
                            renderItem={(item) => (
                              <List.Item style={{ padding: '8px 12px' }}>
                                <span style={{ color: '#555', fontWeight: 600 }}>⚖️ {item.weight} KG</span>
                                <span style={{ fontSize: 11, color: '#999' }}>{item.recordDate}</span>
                              </List.Item>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* FEATURE: Reminders List */}
                    {activeFeature === 'reminder' && currentPet && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Add reminder */}
                        <div style={{ background: '#FFF', padding: 12, borderRadius: 16, border: '1px solid #FFE7D1', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <Input
                            placeholder="需要提醒什么事？(如：驱虫)"
                            value={addReminderTitle}
                            onChange={(e) => setAddReminderTitle(e.target.value)}
                            style={{ borderRadius: 8 }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <Select
                              defaultValue="vaccine"
                              style={{ flex: 1 }}
                              onChange={(val) => setAddReminderType(val)}
                              options={[
                                { value: 'vaccine', label: '💉 疫苗' },
                                { value: 'deworm', label: '🐛 驱虫' },
                                { value: 'bath', label: '🧼 洗澡' },
                                { value: 'other', label: '📝 其他' }
                              ]}
                            />
                            <Button type="primary" onClick={handleAddReminder} style={{ background: '#FFB23F', borderColor: '#FFB23F', borderRadius: 8 }}>设提醒</Button>
                          </div>
                        </div>

                        {/* Reminders List */}
                        <h4 style={{ margin: '8px 0 2px 0', color: '#8C6239' }}>备忘清单 (三天后触发)</h4>
                        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #FFE7D1', overflow: 'hidden' }}>
                          {reminders.length === 0 ? (
                            <p style={{ padding: 20, textAlign: 'center', color: '#888', margin: 0 }}>暂无提醒，去添加一个吧 ⏰</p>
                          ) : (
                            <List
                              dataSource={reminders}
                              renderItem={(item) => (
                                <List.Item style={{
                                  padding: '10px 14px',
                                  textDecoration: item.done ? 'line-through' : 'none',
                                  opacity: item.done ? 0.6 : 1,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input
                                      type="checkbox"
                                      checked={item.done}
                                      onChange={() => handleToggleReminder(item.id)}
                                      style={{ width: 16, height: 16 }}
                                    />
                                    <div>
                                      <span style={{ fontWeight: 700, color: '#333' }}>
                                        {item.type === 'vaccine' ? '💉 ' : item.type === 'deworm' ? '🐛 ' : item.type === 'bath' ? '🧼 ' : '📝 '}
                                        {item.title}
                                      </span>
                                      <span style={{ display: 'block', fontSize: 10, color: '#999' }}>计划时间: {item.date}</span>
                                    </div>
                                  </div>
                                  <Tag color={item.done ? 'default' : 'orange'}>{item.done ? '已完成' : '待办'}</Tag>
                                </List.Item>
                              )}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* FEATURE: Accounting Bookkeeper */}
                    {activeFeature === 'accounting' && currentPet && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ background: '#FFF', padding: 14, borderRadius: 16, border: '1px solid #FFE7D1', textAlign: 'center' }}>
                          <span style={{ fontSize: 11, color: '#999' }}>本月花费累计</span>
                          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#16A34A', margin: '2px 0' }}>¥ {totalThisMonth}</h2>
                          <span style={{ fontSize: 11, color: '#C09060' }}>记录笔数：{expenses.length} 笔</span>
                        </div>

                        {/* Add Expense Form */}
                        <div style={{ background: '#FFF', padding: 12, borderRadius: 16, border: '1px solid #FFE7D1', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Select
                              defaultValue="food"
                              style={{ width: 100 }}
                              onChange={(val) => setAddExpenseCategory(val)}
                              options={[
                                { value: 'food', label: '🍗 主粮' },
                                { value: 'snack', label: '🍖 零食' },
                                { value: 'toy', label: '🎾 玩具' },
                                { value: 'medical', label: '💊 医疗' },
                                { value: 'supplies', label: '🛹 用品' }
                              ]}
                            />
                            <Input
                              placeholder="金额 (元)"
                              type="number"
                              value={addExpenseAmount}
                              onChange={(e) => setAddExpenseAmount(e.target.value)}
                              style={{ borderRadius: 8 }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Input
                              placeholder="备注说明 (如：买冻干)"
                              value={addExpenseNotes}
                              onChange={(e) => setAddExpenseNotes(e.target.value)}
                              style={{ borderRadius: 8 }}
                            />
                            <Button type="primary" onClick={handleAddExpense} style={{ background: '#16A34A', borderColor: '#16A34A', borderRadius: 8 }}>记一笔</Button>
                          </div>
                        </div>

                        {/* Expenses list */}
                        <h4 style={{ margin: '8px 0 2px 0', color: '#8C6239' }}>支出明细</h4>
                        <div style={{ maxHeight: 200, overflowY: 'auto', background: '#FFF', borderRadius: 12, border: '1px solid #FFE7D1' }}>
                          <List
                            size="small"
                            dataSource={[...expenses].reverse()}
                            renderItem={(item) => (
                              <List.Item style={{ padding: '10px 14px' }}>
                                <div>
                                  <span style={{ fontWeight: 700, color: '#333' }}>
                                    {item.category === 'food' ? '🍗 主粮' : item.category === 'snack' ? '🍖 零食' : item.category === 'toy' ? '🎾 玩具' : item.category === 'medical' ? '💊 医疗' : '🛹 用品'}
                                  </span>
                                  {item.notes && <span style={{ display: 'block', fontSize: 11, color: '#888' }}>{item.notes}</span>}
                                </div>
                                <span style={{ color: '#DC2626', fontWeight: 900 }}>-¥{item.amount}</span>
                              </List.Item>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* FEATURE: Recipes Guide */}
                    {activeFeature === 'recipe' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {presetRecipes.map((r, idx) => (
                          <Card
                            key={idx}
                            title={<span style={{ fontSize: 14, fontWeight: 900, color: '#8C6239' }}>{r.title}</span>}
                            size="small"
                            style={{ borderRadius: 16, borderColor: '#FFE7D1' }}
                          >
                            <p style={{ fontSize: 12, margin: '0 0 6px 0' }}><b>主要配料：</b>{r.ingredients}</p>
                            <Divider style={{ margin: '6px 0' }} />
                            <p style={{ fontSize: 11, margin: 0, color: '#666', whiteSpace: 'pre-line' }}>{r.steps}</p>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* FEATURE: Diary Notes */}
                    {activeFeature === 'note' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Add Diary */}
                        <div style={{ background: '#FFF', padding: 12, borderRadius: 16, border: '1px solid #FFE7D1', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <Input
                            placeholder="日记标题 (如：今天带它去晒太阳)"
                            value={addNoteTitle}
                            onChange={(e) => setAddNoteTitle(e.target.value)}
                            style={{ borderRadius: 8 }}
                          />
                          <Input.TextArea
                            placeholder="日记详细内容..."
                            rows={3}
                            value={addNoteContent}
                            onChange={(e) => setAddNoteContent(e.target.value)}
                            style={{ borderRadius: 8 }}
                          />
                          <Button type="primary" onClick={handleAddNote} style={{ background: '#FFB23F', borderColor: '#FFB23F', borderRadius: 8, alignSelf: 'flex-end' }}>保存日记</Button>
                        </div>

                        {/* Diaries List */}
                        <h4 style={{ margin: '8px 0 2px 0', color: '#8C6239' }}>回忆相册 / 随笔 ({notes.length})</h4>
                        {notes.map((n) => (
                          <Card key={n.id} size="small" style={{ borderRadius: 14, borderColor: '#FFE7D1', marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontWeight: 900, fontSize: 13, color: '#333' }}>✍️ {n.title}</span>
                              <span style={{ fontSize: 10, color: '#999', marginLeft: 'auto' }}>{n.recordDate}</span>
                            </div>
                            <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.5 }}>{n.content}</p>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* FEATURE: Medical Records */}
                    {activeFeature === 'medical' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Card size="small" title="🐾 疫苗卡" style={{ borderRadius: 14, borderColor: '#FFE7D1' }}>
                          <p style={{ fontSize: 12, margin: '0 0 6px 0' }}><b>猫三联 / 狂犬疫苗：</b> 正常进行中</p>
                          <p style={{ fontSize: 11, color: '#999', margin: 0 }}>最近接种日期：2026-05-15</p>
                        </Card>
                        <Card size="small" title="🏥 医疗门诊记录" style={{ borderRadius: 14, borderColor: '#FFE7D1' }}>
                          <p style={{ fontSize: 12, margin: '0 0 6px 0' }}><b>因软便进行常规体检：</b> 精神良好，无猫瘟，开处益生菌一盒调理肠胃。</p>
                          <p style={{ fontSize: 11, color: '#999', margin: 0 }}>问诊时间：2026-06-12 · 爱德士宠物医院</p>
                        </Card>
                      </div>
                    )}

                    {/* FEATURE: Stock Tracker */}
                    {activeFeature === 'stock' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {stocks.map((s) => {
                          const percent = Math.floor((s.remaining / s.total) * 100) || 0;
                          return (
                            <div key={s.id} style={{ background: '#FFF', padding: 12, borderRadius: 16, border: '1px solid #FFE7D1' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>
                                  {s.category === 'food' ? '🍗 ' : s.category === 'snack' ? '🍖 ' : '🛹 '}
                                  {s.name}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 900, color: percent < 30 ? '#EF4444' : '#16A34A' }}>
                                  {s.remaining}/{s.total} {s.unit}
                                </span>
                              </div>
                              <div style={{ width: '100%', height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{
                                  width: `${percent}%`,
                                  height: '100%',
                                  background: percent < 30 ? '#EF4444' : '#16A34A',
                                  borderRadius: 4
                                }} />
                              </div>
                              {percent < 30 && <span style={{ display: 'block', fontSize: 10, color: '#EF4444', marginTop: 4 }}>🚨 库存偏低，请在后台系统采购或手机端商城加购！</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* FEATURE: Pet Album — add button at top */}
                    {activeFeature === 'album' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {/* Top bar with title + add button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#8C6239' }}>📸 共 4 张照片</span>
                          <label style={{
                            width: 36, height: 36, borderRadius: 12,
                            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', boxShadow: '0 3px 10px rgba(99,102,241,0.25)'
                          }}>
                            <PlusOutlined style={{ color: '#FFF', fontSize: 16 }} />
                            <input type="file" accept="image/*" style={{ display: 'none' }}
                              onChange={() => message.success('已添加一张照片！📸')} />
                          </label>
                        </div>
                        {/* Photo grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                          {[
                            { url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200', label: '阳光下的美喵 🐱' },
                            { url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200', label: '学会握手了！🐶' },
                            { url: 'https://images.unsplash.com/photo-1522850959074-3a7507729a9c?w=200', label: '第一次洗澡 🛁' },
                            { url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=200', label: '午后晒太阳 ☀️' },
                          ].map((photo, i) => (
                            <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #FFE7D1', background: '#FFF' }}>
                              <img src={photo.url} style={{ width: '100%', height: 110, objectFit: 'cover' }} alt="pet" />
                              <div style={{ padding: 6, textAlign: 'center', fontSize: 10, color: '#666' }}>{photo.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FEATURE: Pet Shop */}
                    {activeFeature === 'shop' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
                        
                        {/* Scrollable list items */}
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 2 }}>
                          {/* Search Bar */}
                          <div style={{ position: 'relative', width: '100%' }}>
                            <input
                              type="text"
                              placeholder="🔍 搜索商品名字/描述..."
                              value={shopSearchKeyword}
                              onChange={(e) => setShopSearchKeyword(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 14px 10px 38px',
                                borderRadius: 14,
                                border: '1px solid #FFE7D1',
                                background: '#FFF',
                                fontSize: 12,
                                color: '#2D2621',
                                outline: 'none',
                                boxSizing: 'border-box',
                                boxShadow: '0 2px 6px rgba(45,38,33,0.02)'
                              }}
                            />
                            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#FF8A3D' }}>🔍</span>
                            {shopSearchKeyword && (
                              <button
                                onClick={() => setShopSearchKeyword('')}
                                style={{
                                  position: 'absolute',
                                  right: 12,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  fontSize: 14,
                                  color: '#999',
                                  padding: 0
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Category Filter Pills */}
                          <div style={{ 
                            display: 'flex', 
                            gap: 6, 
                            overflowX: 'auto', 
                            paddingBottom: 4, 
                            scrollbarWidth: 'none', 
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                          }}>
                            {[
                              { key: 'all', label: '全部', emoji: '✨' },
                              { key: 'food', label: '主粮', emoji: '🍗' },
                              { key: 'snack', label: '零食', emoji: '🍖' },
                              { key: 'supplement', label: '补剂', emoji: '🧪' },
                              { key: 'toy', label: '玩具', emoji: '🎾' },
                              { key: 'supplies', label: '日用品', emoji: '🛹' },
                              { key: 'medicine', label: '医疗', emoji: '💊' }
                            ].map((cat) => {
                              const isSelected = shopSelectedCategory === cat.key;
                              return (
                                <button
                                  key={cat.key}
                                  onClick={() => setShopSelectedCategory(cat.key)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '6px 12px',
                                    borderRadius: 20,
                                    border: '1px solid ' + (isSelected ? 'transparent' : '#FFE7D1'),
                                    background: isSelected 
                                      ? 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)' 
                                      : '#FFF',
                                    color: isSelected ? '#FFF' : '#8C6239',
                                    fontSize: 11,
                                    fontWeight: isSelected ? 900 : 700,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s',
                                    boxShadow: isSelected ? '0 2px 6px rgba(255,138,61,0.2)' : 'none'
                                  }}
                                >
                                  <span>{cat.emoji}</span>
                                  <span>{cat.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Shop items list */}
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map((p) => (
                              <div key={p.id} style={{ background: '#FFF', padding: 12, borderRadius: 16, border: '1px solid #FFE7D1', display: 'flex', gap: 10, alignItems: 'center' }}>
                                <div style={{ width: 44, height: 44, background: '#FFF7ED', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                                  {p.emoji || '📦'}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontWeight: 900, color: '#333', fontSize: 13, display: 'block' }}>{p.name}</span>
                                  <span style={{ display: 'block', fontSize: 10, color: '#888', margin: '2px 0' }}>{p.description || '养宠囤货优选'}</span>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                    <span style={{ fontWeight: 900, color: '#EF4444', fontSize: 14 }}>¥{p.price}</span>
                                    <span style={{ fontSize: 10, color: p.stock < 10 ? '#EF4444' : '#999' }}>库存: {p.stock}</span>
                                  </div>
                                </div>
                                <Button size="small" shape="circle" type="primary" disabled={p.stock <= 0} onClick={() => handleAddToCart(p.id, p.name)} style={{ background: '#FFB23F', borderColor: '#FFB23F' }}>+</Button>
                              </div>
                            ))
                          ) : (
                            <div style={{ textAlign: 'center', padding: '36px 12px', background: '#FFF', borderRadius: 16, border: '1px solid #FFE7D1' }}>
                              <span style={{ fontSize: 32, display: 'block', marginBottom: 10 }}>🔍</span>
                              <span style={{ fontSize: 12, color: '#8C6239', fontWeight: 700, display: 'block', marginBottom: 4 }}>没有找到相关商品 🐾</span>
                              <span style={{ fontSize: 10, color: '#999' }}>换个关键词或选择其他分类试试吧</span>
                            </div>
                          )}
                        </div>

                        {/* Shopping Cart Bar FIXED at the bottom of the container */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFECE0', padding: '10px 14px', borderRadius: 16, border: '1px solid #FFE2C4', boxShadow: '0 -2px 10px rgba(255,138,61,0.05)', marginTop: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 900, color: '#C2410C' }}>🛒 购物车: {Object.values(cart).reduce((a, b) => a + b, 0)} 件</span>
                          {Object.keys(cart).length > 0 && (
                            <Button 
                              size="middle" 
                              type="primary" 
                              onClick={handleCheckout} 
                              style={{ 
                                background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)', 
                                border: 'none',
                                borderRadius: 10, 
                                fontSize: 12, 
                                fontWeight: 800,
                                height: 36
                              }}
                            >
                              立即下单
                            </Button>
                          )}
                        </div>

                      </div>
                    )}

                    {/* FEATURE: AI管家 Chat (小爪App Flutter 风格) */}
                    {activeFeature === 'ai' && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        background: '#FFFDF9',
                        overflow: 'hidden'
                      }}>
                        {/* Chat header — matching Flutter AiAssistantPage gradient header */}
                        <div style={{
                          padding: '16px 18px',
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                          borderRadius: '0 0 24px 24px',
                          boxShadow: '0 8px 20px rgba(139,92,246,0.2)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 48, height: 48, borderRadius: 16,
                              background: 'rgba(255,255,255,0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '1px solid rgba(255,255,255,0.35)',
                              overflow: 'hidden'
                            }}>
                              <img src={aiIconImg} alt="AI" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: 18, fontWeight: 900, color: '#FFF', display: 'block' }}>AI管家</span>
                              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                                {currentPet ? `正在为 ${currentPet.name} 提供专属建议 ✨` : '养宠问题、健康提醒、食谱建议都可以问我'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Messages Panel */}
                        <div style={{
                          flex: 1,
                          overflowY: 'auto',
                          padding: chatMessages.length <= 1 ? '0' : '16px 16px 20px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          background: '#FDF8F3'
                        }}>
                          {chatMessages.length <= 1 ? (
                            /* ── Welcome View with Suggestion Chips (matching Flutter) ── */
                            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                              <div style={{
                                width: 80, height: 80, borderRadius: 26,
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 14px auto',
                                boxShadow: '0 8px 24px rgba(139,92,246,0.25)',
                                overflow: 'hidden'
                              }}>
                                <img src={aiIconImg} alt="AI" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                              </div>
                              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#2D2621', marginBottom: 4 }}>今天想照顾好哪一件事？</h3>
                              <span style={{ fontSize: 12, color: '#8C6239', display: 'block', marginBottom: 20 }}>选择一个问题开始，或者直接输入你的疑问</span>

                              {/* Suggestion chips */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                                {aiSuggestions.map((s, idx) => {
                                  const isHighlighted = idx === 0 || idx === 1;
                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => {
                                        setChatInput(s.text);
                                        setTimeout(() => {
                                          setChatInput('');
                                          const userText = s.text;
                                          setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
                                          // auto-trigger send
                                          handleSendChatWithText(s.text);
                                        }, 50);
                                      }}
                                      style={{
                                        padding: '10px 14px',
                                        borderRadius: 16,
                                        background: isHighlighted ? '#F3E8FF' : '#FFF',
                                        border: isHighlighted ? '1px solid rgba(139,92,246,0.3)' : '1px solid #EADEC9',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        fontSize: 12,
                                        fontWeight: isHighlighted ? 800 : 600,
                                        color: isHighlighted ? '#7C3AED' : '#2D2621',
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      <span>{s.icon}</span>
                                      <span>{s.text}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            /* ── Chat Messages ── */
                            <>
                              {chatMessages.map((msg, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    marginBottom: 10
                                  }}
                                >
                                  <div style={{
                                    padding: '12px 14px',
                                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    background: msg.sender === 'user'
                                      ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                                      : '#FFFFFF',
                                    color: msg.sender === 'user' ? '#FFF' : '#2D2621',
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                    whiteSpace: 'pre-wrap',
                                    border: msg.sender === 'user' ? 'none' : '1px solid #EADEC9',
                                    boxShadow: '0 2px 8px rgba(45,38,33,0.04)'
                                  }}>
                                    {msg.text}
                                  </div>
                                  {msg.notice && (
                                    <span style={{ fontSize: 10, color: '#FF8A3D', marginTop: 4, display: 'block', fontWeight: 700 }}>
                                      <BellOutlined style={{ marginRight: 4 }} /> {msg.notice}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </>
                          )}

                          {/* Loading: "小爪思考中..." bouncing dots (matching Flutter) */}
                          {aiTyping && (
                            <div style={{
                              alignSelf: 'flex-start',
                              background: '#FFFFFF',
                              padding: '14px 18px',
                              borderRadius: '18px 18px 18px 4px',
                              border: '1px solid #EADEC9',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 2px 8px rgba(45,38,33,0.04)'
                            }}>
                              <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                {[0, 200, 400].map((delay, i) => (
                                  <span key={i} style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: '#8B5CF6',
                                    display: 'inline-block',
                                    animation: 'bounce 0.8s ease-in-out infinite',
                                    animationDelay: `${delay}ms`
                                  }} />
                                ))}
                              </span>
                              <span style={{ fontSize: 12, color: '#8C6239', marginLeft: 4 }}>小爪思考中...</span>
                              <style>{`@keyframes bounce { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
                            </div>
                          )}
                          <div ref={chatBottomRef} />
                        </div>

                        {/* Input bar — matching Flutter */}
                        <div style={{
                          display: 'flex',
                          padding: '10px 14px 14px',
                          gap: 10,
                          background: '#FFFFFF',
                          borderTop: '1px solid #FFE7D1',
                          boxShadow: '0 -4px 12px rgba(45,38,33,0.03)'
                        }}>
                          <Input
                            placeholder="输入你的问题..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onPressEnter={handleSendChat}
                            disabled={aiTyping}
                            style={{
                              flex: 1,
                              borderRadius: 20,
                              borderColor: '#EADEC9',
                              padding: '8px 16px',
                              fontSize: 13,
                              background: '#FDF8F3'
                            }}
                          />
                          <div
                            onClick={aiTyping ? undefined : handleSendChat}
                            style={{
                              width: 42, height: 42, borderRadius: 14,
                              background: aiTyping ? '#D1D5DB' : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: aiTyping ? 'not-allowed' : 'pointer',
                              boxShadow: aiTyping ? 'none' : '0 4px 12px rgba(139,92,246,0.25)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <SendOutlined style={{ color: '#FFF', fontSize: 16 }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FEATURE: 宠物管理 — 宠物列表 & 新增 & 编辑 */}
                    {activeFeature === 'pet-manage' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {petManageMode === 'list' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Header Add Button */}
                            <Button 
                              type="dashed" 
                              onClick={() => {
                                setAddingPetForm({
                                  name: '',
                                  type: '猫咪',
                                  breed: '',
                                  gender: '男孩',
                                  weight: 4.5,
                                  emoji: '🐱',
                                  meetDate: new Date().toISOString().split('T')[0]
                                });
                                setPetManageMode('add');
                              }}
                              style={{ 
                                borderRadius: 14, 
                                height: 48, 
                                border: '2px dashed #FFB23F', 
                                color: '#FF8A3D',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6
                              }}
                            >
                              ➕ {t('添加新宠物', 'Add New Pet')}
                            </Button>

                            {/* Pets List */}
                            {pets.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '30px 12px', background: '#FFF', borderRadius: 16, border: '1px solid #FFE7D1' }}>
                                <span style={{ fontSize: 32, display: 'block', marginBottom: 10 }}>🐾</span>
                                <span style={{ fontSize: 12, color: '#8C6239', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                                  {t('暂无宠物档案', 'No pet profiles found')}
                                </span>
                                <span style={{ fontSize: 10, color: '#999' }}>{t('点击上方按钮，开启小爪智能守护！', 'Click the button above to register a pet!')}</span>
                              </div>
                            ) : (
                              pets.map((p) => {
                                const isActive = currentPet?.id === p.id;
                                return (
                                  <div 
                                    key={p.id} 
                                    style={{ 
                                      background: '#FFF', 
                                      borderRadius: 18, 
                                      padding: '14px 16px', 
                                      border: isActive ? '2px solid #FFB23F' : '1px solid #FFE7D1', 
                                      boxShadow: isActive ? '0 4px 12px rgba(255,178,63,0.15)' : 'none',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 10
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                      <div style={{
                                        width: 48, height: 48, borderRadius: '50%', background: '#FEF3C6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 24, overflow: 'hidden', flexShrink: 0
                                      }}>
                                        {p.emoji && (p.emoji.startsWith('http') || p.emoji.startsWith('data:')) ? (
                                          <img src={p.emoji} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="pet" />
                                        ) : p.emoji || '🐾'}
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                          <span style={{ fontSize: 15, fontWeight: 900, color: '#2D2621' }}>{p.name}</span>
                                          {isActive && (
                                            <span style={{ background: '#FFF7ED', color: '#FF8A3D', fontSize: 10, padding: '1px 6px', borderRadius: 6, border: '1px solid #FFE7D1', fontWeight: 800 }}>
                                              {t('当前活跃', 'Active')}
                                            </span>
                                          )}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                                          {p.type} · {p.breed} · {p.gender} · {p.weight}kg
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action row */}
                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #FFF5EB', paddingTop: 8 }}>
                                      {!isActive && (
                                        <Button 
                                          size="small" 
                                          onClick={() => {
                                            setCurrentPet(p);
                                            message.success(t(`已成功切换当前宠物为：${p.name}！🐾`, `Switched active pet to ${p.name}! 🐾`));
                                          }}
                                          style={{ fontSize: 11, borderRadius: 8, borderColor: '#FFE7D1', color: '#8C6239' }}
                                        >
                                          {t('设为活跃', 'Set Active')}
                                        </Button>
                                      )}
                                      <Button 
                                        size="small" 
                                        type="primary"
                                        onClick={() => {
                                          setEditingPet({ ...p });
                                          setPetManageMode('edit');
                                        }}
                                        style={{ fontSize: 11, borderRadius: 8, background: '#FFB23F', borderColor: '#FFB23F' }}
                                      >
                                        ✏️ {t('编辑', 'Edit')}
                                      </Button>
                                      <Button 
                                        size="small" 
                                        danger
                                        onClick={async () => {
                                          Modal.confirm({
                                            title: t('确认删除宠物', 'Delete Pet Confirmation'),
                                            content: t(`你确定要删除宠物 ${p.name} 吗？删除后其相关健康数据将被清空。`, `Are you sure you want to delete ${p.name}? This will clear its health records.`),
                                            okText: t('确认删除', 'Delete'),
                                            cancelText: t('取消', 'Cancel'),
                                            onOk: async () => {
                                              try {
                                                await axios.delete(`/api/v1/app/pets/${p.id}`, { params: { phone: user?.phone } });
                                                const updatedPets = pets.filter(x => x.id !== p.id);
                                                setPets(updatedPets);
                                                if (isActive) {
                                                  setCurrentPet(updatedPets.length > 0 ? updatedPets[0] : null);
                                                }
                                                message.success(t('宠物删除成功！', 'Pet deleted successfully!'));
                                              } catch (err) {
                                                message.error(t('删除失败', 'Delete failed'));
                                              }
                                            }
                                          });
                                        }}
                                        style={{ fontSize: 11, borderRadius: 8 }}
                                      >
                                        🗑️ {t('删除', 'Delete')}
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}

                        {/* EDIT MODE */}
                        {petManageMode === 'edit' && editingPet && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontWeight: 900, color: '#8C6239' }}>✏️ {t('编辑宠物档案', 'Edit Pet')}</span>
                              <Button size="small" onClick={() => setPetManageMode('list')}>{t('返回列表', 'Back')}</Button>
                            </div>

                            {[
                              { label: t('🐾 宠物名字', '🐾 Pet Name'), field: 'name', type: 'text', value: editingPet.name },
                              { label: t('🏷️ 品种', '🏷️ Breed'), field: 'breed', type: 'text', value: editingPet.breed },
                              { label: t('🐕 种类', '🐕 Type'), field: 'type', type: 'text', value: editingPet.type },
                              { label: t('⚤ 性别', '⚤ Gender'), field: 'gender', type: 'text', value: editingPet.gender },
                              { label: t('⚖️ 体重 (kg)', '⚖️ Weight (kg)'), field: 'weight', type: 'number', value: String(editingPet.weight) },
                              { label: t('📅 到家日期', '📅 Arrival Date'), field: 'meetDate', type: 'date', value: editingPet.meetDate || '' },
                            ].map((field) => (
                              <div key={field.field} style={{ background: '#FFF', borderRadius: 16, padding: '12px 16px', border: '1px solid #FFE7D1' }}>
                                <span style={{ fontSize: 11, color: '#A8621B', fontWeight: 700, display: 'block', marginBottom: 6 }}>{field.label}</span>
                                <Input
                                  type={field.type as any}
                                  value={field.value}
                                  onChange={(e) => {
                                    setEditingPet({ ...editingPet, [field.field]: field.type === 'number' ? Number(e.target.value) : e.target.value });
                                  }}
                                  style={{ borderRadius: 10, borderColor: '#FFE2C4' }}
                                />
                              </div>
                            ))}

                            <Button type="primary" block size="large"
                              onClick={async () => {
                                try {
                                  const res = await axios.put(`/api/v1/app/pets/${editingPet.id}`, { phone: user?.phone, ...editingPet });
                                  if (res.data.code === 200) {
                                    message.success(t('宠物信息已更新！🐾', 'Pet info updated successfully! 🐾'));
                                    setPets(pets.map(p => p.id === editingPet.id ? res.data.data : p));
                                    if (currentPet?.id === editingPet.id) {
                                      setCurrentPet(res.data.data);
                                    }
                                    setPetManageMode('list');
                                  }
                                } catch (err) {
                                  message.error(t('更新失败', 'Update failed'));
                                }
                              }}
                              style={{ borderRadius: 14, height: 46, fontWeight: 900, background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)', border: 'none', marginTop: 4 }}>
                              {t('保存修改', 'Save Changes')}
                            </Button>
                          </div>
                        )}

                        {/* ADD MODE */}
                        {petManageMode === 'add' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontWeight: 900, color: '#8C6239' }}>➕ {t('新增宠物档案', 'Add Pet')}</span>
                              <Button size="small" onClick={() => setPetManageMode('list')}>{t('返回列表', 'Back')}</Button>
                            </div>

                            {[
                              { label: t('🐾 宠物名字', '🐾 Pet Name'), field: 'name', type: 'text', placeholder: t('给宝贝起个好听的名字', 'Enter pet name') },
                              { label: t('🐕 种类', '🐕 Type'), field: 'type', type: 'select', options: [t('猫咪', 'Cat'), t('狗狗', 'Dog'), t('仓鼠', 'Hamster'), t('兔子', 'Rabbit'), t('其他', 'Other')] },
                              { label: t('🏷️ 品种', '🏷️ Breed'), field: 'breed', type: 'text', placeholder: t('例如：英国短毛猫、金毛', 'e.g. British Shorthair, Golden Retriever') },
                              { label: t('⚤ 性别', '⚤ Gender'), field: 'gender', type: 'select', options: [t('男孩', 'Boy'), t('女孩', 'Girl')] },
                              { label: t('⚖️ 体重 (kg)', '⚖️ Weight (kg)'), field: 'weight', type: 'number', placeholder: '4.5' },
                              { label: t('📅 到家日期', '📅 Arrival Date'), field: 'meetDate', type: 'date' },
                            ].map((field) => (
                              <div key={field.field} style={{ background: '#FFF', borderRadius: 16, padding: '12px 16px', border: '1px solid #FFE7D1' }}>
                                <span style={{ fontSize: 11, color: '#A8621B', fontWeight: 700, display: 'block', marginBottom: 6 }}>{field.label}</span>
                                {field.type === 'select' ? (
                                  <Select
                                    value={(addingPetForm as any)[field.field]}
                                    onChange={(val) => setAddingPetForm({ ...addingPetForm, [field.field]: val })}
                                    style={{ width: '100%' }}
                                    options={(field.options || []).map(opt => ({ label: opt, value: opt }))}
                                  />
                                ) : (
                                  <Input
                                    type={field.type as any}
                                    placeholder={field.placeholder}
                                    value={(addingPetForm as any)[field.field]}
                                    onChange={(e) => {
                                      setAddingPetForm({ ...addingPetForm, [field.field]: field.type === 'number' ? Number(e.target.value) : e.target.value });
                                    }}
                                    style={{ borderRadius: 10, borderColor: '#FFE2C4' }}
                                  />
                                )}
                              </div>
                            ))}

                            <Button type="primary" block size="large"
                              onClick={async () => {
                                if (!addingPetForm.name) {
                                  message.error(t('请输入宠物名字', 'Please enter pet name'));
                                  return;
                                }
                                setLoading(true);
                                try {
                                  const emoji = addingPetForm.type.includes('猫') || addingPetForm.type.includes('Cat') ? '🐱' : '🐶';
                                  const res = await axios.post('/api/v1/app/pets', {
                                    phone: user?.phone,
                                    ...addingPetForm,
                                    emoji
                                  });
                                  if (res.data.code === 200) {
                                    message.success(t(`宠物 ${addingPetForm.name} 注册建档成功！🐾`, `Pet ${addingPetForm.name} registered successfully! 🐾`));
                                    setPets([...pets, res.data.data]);
                                    if (!currentPet) {
                                      setCurrentPet(res.data.data);
                                    }
                                    setPetManageMode('list');
                                  }
                                } catch (err) {
                                  message.error(t('新增宠物档案失败', 'Failed to add pet'));
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              style={{ borderRadius: 14, height: 46, fontWeight: 900, background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)', border: 'none', marginTop: 4 }}>
                              {t('完成建档', 'Create Profile')}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* FEATURE: 个人 — 小爪App 风格完整版 */}
                    {activeFeature === 'me' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* User Header Card */}
                        <div style={{
                          background: 'linear-gradient(135deg, #FFB23F 0%, #FF8A3D 100%)',
                          borderRadius: 20,
                          padding: 16,
                          color: '#FFF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          boxShadow: '0 4px 12px rgba(255,138,61,0.2)'
                        }}>
                          <div style={{
                            width: 54,
                            height: 54,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.3)',
                            border: '2px solid #FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 28
                          }}>
                            {currentPet?.emoji && (currentPet?.emoji.startsWith('http') || currentPet?.emoji.startsWith('data:')) ? (
                              <img src={currentPet.emoji} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
                            ) : (<span>{currentPet?.emoji || '🐾'}</span>)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 18, fontWeight: 900 }}>{user?.nickname || newPetForm.userNickname || '铲屎官'}</div>
                            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>📱 {user?.phone || '未绑定手机'}</div>
                            {currentPet && (<div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>🐾 {currentPet.name} · 相伴 {currentPet.daysTogether || 0} 天</div>)}
                          </div>
                        </div>

                        {/* 小爪会员卡片 — 放在上面 */}
                        <div onClick={() => setShowVipModal(true)} style={{
                          background: 'linear-gradient(135deg, #1F1F1F 0%, #3D2C1E 100%)',
                          borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 12,
                          border: '1px solid rgba(255,178,63,0.25)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #FFD700 0%, #FF8A3D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👑</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 900, color: '#FFD700' }}>{t('小爪会员', 'XiaoZhua VIP')}</div>
                            <div style={{ fontSize: 11, color: '#C0A080', marginTop: 1 }}>{t('开通会员享更多专属权益 ✨', 'Join VIP for unlimited features ✨')}</div>
                          </div>
                          <RightOutlined style={{ color: '#FFD700', fontSize: 14 }} />
                        </div>

                        {/* 我的订单 - 淘宝/美团风格 */}
                        <div style={{
                          background: '#FFF', borderRadius: 18, padding: '14px 16px', border: '1px solid #FFE7D1'
                        }}>
                          {/* Title and View All */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 900, color: '#2D2621' }}>🛍️ {t('我的订单', 'My Orders')}</span>
                            <div 
                              onClick={() => { fetchAppOrders(); setShowOrderHistoryModal(true); }} 
                              style={{ fontSize: 11, color: '#FF8A3D', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
                            >
                              <span>{t('查看全部', 'View All')}</span>
                              <RightOutlined style={{ fontSize: 10 }} />
                            </div>
                          </div>

                          {/* Order status items */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
                            {[
                              { label: t('待付款', 'To Pay'), icon: '🪙', count: 0 },
                              { label: t('待发货', 'To Ship'), icon: '📦', count: appOrders.filter(o => o.status === 'pending').length },
                              { label: t('待收货', 'To Receive'), icon: '🚚', count: appOrders.filter(o => o.status === 'paid' || o.status === 'shipped').length },
                              { label: t('退款/售后', 'Refunds'), icon: '🔄', count: 0 }
                            ].map((item, index) => (
                              <div 
                                key={index} 
                                onClick={() => { fetchAppOrders(); setShowOrderHistoryModal(true); }} 
                                style={{ flex: 1, position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                              >
                                <span style={{ fontSize: 22 }}>{item.icon}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#555' }}>{item.label}</span>
                                {item.count > 0 && (
                                  <div style={{
                                    position: 'absolute', top: -3, right: '22%',
                                    background: '#EF4444', color: '#FFF', fontSize: 9, fontWeight: 900,
                                    borderRadius: '50%', width: 14, height: 14,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(239,68,68,0.3)'
                                  }}>
                                    {item.count}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 宠物管理入口 — 始终可以进入 */}
                        <div onClick={() => { setPetManageMode('list'); handleOpenFeature('pet-manage'); }} style={{
                          background: '#FFF', borderRadius: 18, padding: '16px', border: '1px solid #FFE7D1',
                          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer'
                        }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 14, background: '#FEF3C6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, overflow: 'hidden', flexShrink: 0
                          }}>
                            {currentPet?.emoji ? (
                              currentPet.emoji.startsWith('http') || currentPet.emoji.startsWith('data:') ? (
                                <img src={currentPet.emoji} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="pet" />
                              ) : currentPet.emoji
                            ) : '🐾'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#2D2621' }}>🐾 {t('宠物管理', 'Pet Management')}</div>
                            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                              {currentPet ? `${currentPet.name} · ${currentPet.type} · ${currentPet.breed} · ${currentPet.weight}kg` : t('管理与添加您的爱宠档案', 'Manage and add your pet profiles')}
                            </div>
                          </div>
                          <RightOutlined style={{ color: '#C0A080', fontSize: 14 }} />
                        </div>

                        {/* 菜单列表 — 全功能 */}
                        {[
                          { group: t('账户', 'Account'), items: [
                            { 
                              icon: '🌐', 
                              label: t('切换语言', 'Change Language'), 
                              sub: language === 'en' ? 'English' : '简体中文', 
                              action: () => setShowLanguageModal(true) 
                            },
                            { 
                              icon: '🔐', 
                              label: t('设置密码', 'Set Password'), 
                              sub: t('修改或设置登录密码', 'Change login password'), 
                              action: () => {
                                setPwdForm({ newPwd: '', confirmPwd: '' });
                                setShowPasswordModal(true);
                              } 
                            },
                          ]},
                          { group: t('服务', 'Services'), items: [
                            { 
                              icon: '💬', 
                              label: t('意见反馈', 'Feedback'), 
                              sub: t('帮助我们变得更好', 'Help us do better'), 
                              action: () => {
                                setFeedbackForm({ type: '建议', email: user?.phone || '', content: '' });
                                setShowFeedbackModal(true);
                              } 
                            },
                            { 
                              icon: '⭐', 
                              label: t('评价我们', 'Rate Us'), 
                              sub: t('给个五星好评吧～', 'Give us 5-stars review~'), 
                              action: () => {
                                Modal.confirm({
                                  title: t('应用市场评价', 'App Store Rating'),
                                  content: t('是否立即前往应用市场为《小爪宠物管家》写个好评？您的反馈对我们非常重要！', 'Would you like to visit App Store to rate XiaoZhua Pet House? Your support means the world to us!'),
                                  okText: t('立即好评', 'Rate Now'),
                                  cancelText: t('稍后再说', 'Later'),
                                  onOk: () => {
                                    message.success(t('已模拟跳转应用商店评价接口！感谢支持 🌟🌟🌟🌟🌟', 'Redirecting you to the App Store, thank you! 🌟🌟🌟🌟🌟'));
                                  }
                                });
                              } 
                            },
                            { 
                              icon: '📋', 
                              label: t('用户协议', 'User Agreement'), 
                              sub: t('查看服务条款与隐私政策', 'Check terms and privacy policies'), 
                              action: () => setShowAgreementModal(true) 
                            },
                            { 
                              icon: 'ℹ️', 
                              label: t('关于我们', 'About Us'), 
                              sub: t('小爪宠物管家 v1.0.0', 'XiaoZhua Pet House v1.0.0'), 
                              action: () => message.info(t('小爪宠物管家 — 像家人一样守护你的爱宠 ❤️', 'XiaoZhua Pet House — Guard your beloved pet like family ❤️')) 
                            },
                          ]},
                        ].map((group, gi) => (
                          <div key={gi} style={{ background: '#FFF', borderRadius: 18, padding: '12px 16px', border: '1px solid #FFE7D1' }}>
                            <div style={{ fontSize: 11, color: '#C0A080', fontWeight: 700, marginBottom: 8 }}>{group.group}</div>
                            {group.items.map((item, ii) => (
                              <div key={ii} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: ii < group.items.length - 1 ? '1px solid #F9F2EB' : 'none', cursor: 'pointer' }}>
                                <span style={{ fontSize: 18 }}>{item.icon}</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2D2621' }}>{item.label}</div>
                                  <div style={{ fontSize: 11, color: '#999' }}>{item.sub}</div>
                                </div>
                                <RightOutlined style={{ color: '#D1C0B0', fontSize: 12 }} />
                              </div>
                            ))}
                          </div>
                        ))}

                        {/* 退出登录 */}
                        <Button danger type="primary" block size="large" onClick={handleLogoutApp}
                          style={{ borderRadius: 14, height: 46, fontWeight: 900, background: '#FF4D4F', border: 'none' }}>
                          {t('退出登录', 'Logout')}
                        </Button>
                        <div style={{ height: 16 }} />
                      </div>
                    )}

                    {/* FEATURE: Message Center */}
                    {activeFeature === 'message' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Messages List */}
                        <div style={{ background: '#FFF', borderRadius: 20, padding: 16, border: '1px solid #FFE7D1' }}>
                          <h4 style={{ margin: '0 0 12px 0', color: '#8C6239', fontSize: 14, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                            ✉️ 宠物消息中心
                          </h4>
                          {[
                            { id: 1, title: '小爪智能管家版本升级通知', time: '10分钟前', text: '全新推出『您的设备』智能硬件绑定功能，支持宠物监控摄像头及智能GPS定位器！', type: 'system', unread: true },
                            { id: 2, title: '💊 驱虫防病温馨提醒', time: '2小时前', text: `宝贝「${currentPet?.name || '爱宠'}」下一次体内外驱虫还有3天，请及时备药驱虫。`, type: 'alert', unread: true },
                            { id: 3, title: '🎁 皇家芳疗SPA特惠预约开启', time: '昨天', text: '『皇家夏季草本深层芳疗 SPA』特惠预约已开始，负离子防静电防虫尊享大促！', type: 'activity', unread: false },
                            { id: 4, title: '🥤 饮水量异常预警', time: '2天前', text: `智能饮水机监测到「${currentPet?.name || '爱宠'}」近24小时饮水量低于标准，建议观察尿量。`, type: 'device', unread: false },
                            { id: 5, title: '🛡️ 隐私保护加密服务已启用', time: '3天前', text: '您的爱宠档案、定位信息及监控画面已进行端到端加密保护，数据安全无虞。', type: 'security', unread: false }
                          ].map((msg) => (
                            <div key={msg.id} style={{
                              padding: '12px 0',
                              borderBottom: '1px solid #F9F2EB',
                              position: 'relative'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: 13, color: '#333', fontWeight: msg.unread ? 800 : 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {msg.unread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />}
                                  {msg.title}
                                </span>
                                <span style={{ fontSize: 10, color: '#999' }}>{msg.time}</span>
                              </div>
                              <p style={{ fontSize: 11, color: '#666', margin: 0, lineHeight: 1.5 }}>{msg.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FEATURE: Your Devices */}
                    {activeFeature === 'devices' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Device Bind Status Banner */}
                        <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: 16, borderRadius: 20, color: '#FFF' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 14, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                              📟 已绑定智能硬件设备
                            </span>
                            <Tag color="success">全部在线</Tag>
                          </div>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>支持绑定监控、定位项圈、自动喂食机、饮水机，实现全天候云端守护爱宠。</span>
                        </div>

                        {/* List of Bound Devices */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {/* Device 1: Camera */}
                          <div style={{ background: '#FFF', borderRadius: 20, padding: 14, border: '1px solid #FFE7D1', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <CameraOutlined style={{ fontSize: 18, color: '#3B82F6' }} />
                                </div>
                                <div>
                                  <span style={{ fontSize: 13, fontWeight: 900, color: '#333', display: 'block' }}>小爪高清宠物监控 Pro</span>
                                  <span style={{ fontSize: 10, color: '#999' }}>设备号: CN-CAM-88921</span>
                                </div>
                              </div>
                              <span style={{ fontSize: 11, color: '#10B981', fontWeight: 800 }}>● 在线</span>
                            </div>
                            
                            {/* Live video mock preview */}
                            <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 14, overflow: 'hidden', background: '#000', marginBottom: 10 }}>
                              <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} alt="pet live stream" />
                              
                              {/* Overlay controls */}
                              <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
                                <span style={{ color: '#FFF', fontSize: 10, fontWeight: 700 }}>LIVE 直播中</span>
                              </div>
                              <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 6, color: '#FFF', fontSize: 10 }}>
                                广角镜头 1080P
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                              <Button size="small" type="primary" ghost style={{ borderRadius: 8, fontSize: 11, fontWeight: 700 }} onClick={() => message.info('正在开启双向语音通话...')}>🎙️ 语音通话</Button>
                              <Button size="small" type="primary" ghost style={{ borderRadius: 8, fontSize: 11, fontWeight: 700 }} onClick={() => message.success('照片已保存到萌宠相册中！')}>📸 极速抓拍</Button>
                              <Button size="small" type="primary" style={{ background: '#FF8A3D', borderColor: '#FF8A3D', borderRadius: 8, fontSize: 11, fontWeight: 700 }} onClick={() => message.success('已向喂食机发送加餐指令，投喂冻干5g！')}>🍗 远程加餐</Button>
                            </div>
                          </div>

                          {/* Device 2: GPS Tracker */}
                          <div style={{ background: '#FFF', borderRadius: 20, padding: 14, border: '1px solid #FFE7D1', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <DashboardOutlined style={{ fontSize: 18, color: '#D97706' }} />
                                </div>
                                <div>
                                  <span style={{ fontSize: 13, fontWeight: 900, color: '#333', display: 'block' }}>小爪超长续航 GPS 户外防丢项圈</span>
                                  <span style={{ fontSize: 10, color: '#999' }}>电量：88% · 搜星：12颗</span>
                                </div>
                              </div>
                              <span style={{ fontSize: 11, color: '#10B981', fontWeight: 800 }}>● 在线</span>
                            </div>

                            {/* Map locator mock */}
                            <div style={{ background: '#F3F4F6', borderRadius: 14, padding: 12, border: '1px solid #E5E7EB', marginBottom: 10 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 16 }}>📍</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#333' }}>当前位置: 北京市朝阳区亮马桥路宠物友好社区</span>
                              </div>
                              <span style={{ fontSize: 10, color: '#666', display: 'block', marginLeft: 24 }}>最新定位时间：1分钟前 · 精准度 5 米以内</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                              <Button size="small" type="dashed" style={{ flex: 1, borderRadius: 8, fontSize: 11 }} onClick={() => message.info('正在定位项圈鸣叫寻宠...')}>🔊 发声寻宠</Button>
                              <Button size="small" type="primary" ghost style={{ flex: 1, borderRadius: 8, fontSize: 11 }} onClick={() => message.success('电子安全围栏范围已设为500米')}>🌐 电子围栏</Button>
                            </div>
                          </div>
                        </div>

                        {/* Add New Device Button & Instructions */}
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          block
                          size="large"
                          style={{ background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)', border: 'none', borderRadius: 14, height: 46, fontWeight: 900 }}
                          onClick={() => {
                            Modal.confirm({
                              title: '🔌 绑定智能宠物新设备',
                              content: (
                                <div style={{ marginTop: 12 }}>
                                  <span style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>第一步：选择设备品类</span>
                                  <Select
                                    defaultValue="feeder"
                                    style={{ width: '100%', marginBottom: 12 }}
                                    options={[
                                      { value: 'feeder', label: '🍲 智能自动喂食机' },
                                      { value: 'water', label: '🥤 智能循环活水机' },
                                      { value: 'litter', label: '🚽 智能全自动猫砂盆' },
                                      { value: 'health', label: '📊 宠物睡眠运动监测项圈' }
                                    ]}
                                  />
                                  <span style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>第二步：输入设备底部 SN 串号</span>
                                  <Input placeholder="例如：SN-FEED-998124" />
                                </div>
                              ),
                              okText: '确认绑定',
                              cancelText: '取消',
                              centered: true,
                              onOk: () => {
                                message.success('设备绑定并配置成功！状态已同步至云端。');
                              }
                            });
                          }}
                        >
                          绑定新设备
                        </Button>
                      </div>
                    )}

                    {/* FEATURE: Special Booking SPA */}
                    {activeFeature === 'spa' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Hero Image */}
                        <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 20, overflow: 'hidden' }}>
                          <img src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="SPA" />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)', padding: 12, color: '#FFF' }}>
                            <span style={{ fontSize: 16, fontWeight: 900, display: 'block' }}>👑 皇家夏季草本深层芳疗 SPA</span>
                            <span style={{ fontSize: 11, opacity: 0.9 }}>瑞士负离子防静电防虫大促，享受星级呵护</span>
                          </div>
                        </div>

                        {/* Description */}
                        <div style={{ background: '#FFF', borderRadius: 20, padding: 16, border: '1px solid #FFE7D1' }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#8C6239', fontSize: 13, fontWeight: 900 }}>🌸 项目特色</h4>
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                            <li><b>草本深层芳疗：</b> 采用阿尔卑斯山天然有机金盏花与洋甘菊精油，深层滋养毛囊。</li>
                            <li><b>防静电防虫：</b> 特效负离子微气泡SPA浴，中和毛发静电，添加天然驱蜱防虱成分。</li>
                            <li><b>香氛精修：</b> 特聘资深美容师进行毛发开结与蓬松造型设计。</li>
                          </ul>
                          <Divider style={{ margin: '12px 0' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: 11, color: '#999' }}>服务尊享价</span>
                              <span style={{ fontSize: 20, fontWeight: 900, color: '#EF4444', display: 'block' }}>¥ 198 <span style={{ fontSize: 11, textDecoration: 'line-through', color: '#999', fontWeight: 'normal' }}>原价¥380</span></span>
                            </div>
                            <Tag color="orange">特惠预约中</Tag>
                          </div>
                        </div>

                        {/* Booking Form */}
                        <div style={{ background: '#FFF', borderRadius: 20, padding: 16, border: '1px solid #FFE7D1', display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <h4 style={{ margin: 0, color: '#8C6239', fontSize: 13, fontWeight: 900 }}>📅 立即填写预约资料</h4>
                          
                          <div>
                            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 6 }}>预约宝贝</span>
                            <Input value={currentPet?.name || '我的宠物'} disabled style={{ borderRadius: 8, background: '#FAF6F0' }} />
                          </div>

                          <div>
                            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 6 }}>预约到店时间</span>
                            <Select
                              defaultValue="tomorrow_morning"
                              style={{ width: '100%' }}
                              options={[
                                { value: 'tomorrow_morning', label: '明天上午 (10:00 - 12:00)' },
                                { value: 'tomorrow_afternoon', label: '明天下午 (14:00 - 18:00)' },
                                { value: 'weekend_morning', label: '本周末上午 (10:00 - 12:00)' },
                                { value: 'weekend_afternoon', label: '本周末下午 (14:00 - 18:00)' }
                              ]}
                            />
                          </div>

                          <div>
                            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 6 }}>联系手机号</span>
                            <Input value={user?.phone || '13888888888'} disabled style={{ borderRadius: 8, background: '#FAF6F0' }} />
                          </div>

                          <Button
                            type="primary"
                            size="large"
                            block
                            style={{ background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)', border: 'none', borderRadius: 12, height: 42, fontWeight: 900, marginTop: 4 }}
                            onClick={() => {
                              // Save as a reminder
                              setReminders([...reminders, {
                                id: Math.random().toString(),
                                petId: currentPet?.id || '',
                                title: '👑 皇家夏季草本深层芳疗 SPA (已预约)',
                                date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                type: 'other',
                                done: false
                              }]);
                              Modal.success({
                                title: '预约成功！🎉',
                                content: '您的皇家SPA特惠预约已同步。我们将稍后拨打电话为您确认具体到店细节！备忘提醒也已自动添加至您的日常事务中。',
                                centered: true,
                                okText: '好哒'
                              });
                              setScreen('home');
                            }}
                          >
                            确认特惠预约到店
                          </Button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* === INTUITIVE WORKSPACE INTERACTIVE MODALS === */}

              {/* MODAL: 切换语言 */}
              <Modal
                title={t('🌐 切换语言', '🌐 Change Language')}
                open={showLanguageModal}
                onCancel={() => setShowLanguageModal(false)}
                footer={null}
                centered
                width={310}
                styles={{ body: { padding: '16px 12px', borderRadius: 20 } }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div 
                    onClick={() => { setLanguage('zh'); setShowLanguageModal(false); message.success('已切换为简体中文 🇨🇳'); }} 
                    style={{
                      padding: '12px 16px', borderRadius: 12, border: language === 'zh' ? '2px solid #FF8A3D' : '1px solid #FFE7D1',
                      background: language === 'zh' ? '#FFF9F5' : '#FFF', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#2D2621' }}>简体中文</span>
                    {language === 'zh' && <span style={{ color: '#FF8A3D', fontWeight: 900 }}>✓</span>}
                  </div>
                  <div 
                    onClick={() => { setLanguage('en'); setShowLanguageModal(false); message.success('Switched to English 🇺🇸'); }} 
                    style={{
                      padding: '12px 16px', borderRadius: 12, border: language === 'en' ? '2px solid #FF8A3D' : '1px solid #FFE7D1',
                      background: language === 'en' ? '#FFF9F5' : '#FFF', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#2D2621' }}>English</span>
                    {language === 'en' && <span style={{ color: '#FF8A3D', fontWeight: 900 }}>✓</span>}
                  </div>
                </div>
              </Modal>

              {/* MODAL: 设置密码 */}
              <Modal
                title={t('🔐 设置密码', '🔐 Set Password')}
                open={showPasswordModal}
                onCancel={() => setShowPasswordModal(false)}
                footer={null}
                centered
                width={310}
                styles={{ body: { padding: '16px 12px', borderRadius: 20 } }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#A8621B', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      {t('输入新密码 (不低于6位)', 'New Password (at least 6 chars)')}
                    </span>
                    <Input.Password
                      placeholder={t('请输入新密码', 'Enter new password')}
                      value={pwdForm.newPwd}
                      onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })}
                      style={{ borderRadius: 10, borderColor: '#FFE2C4' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#A8621B', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      {t('确认新密码', 'Confirm Password')}
                    </span>
                    <Input.Password
                      placeholder={t('请再次输入新密码', 'Confirm new password')}
                      value={pwdForm.confirmPwd}
                      onChange={(e) => setPwdForm({ ...pwdForm, confirmPwd: e.target.value })}
                      style={{ borderRadius: 10, borderColor: '#FFE2C4' }}
                    />
                  </div>
                  <Button
                    type="primary"
                    block
                    onClick={handleSavePassword}
                    style={{
                      borderRadius: 14, height: 40, fontWeight: 900, marginTop: 6,
                      background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)', border: 'none'
                    }}
                  >
                    {t('保存密码', 'Save Password')}
                  </Button>
                </div>
              </Modal>

              {/* MODAL: 意见反馈 */}
              <Modal
                title={t('💬 意见反馈', '💬 User Feedback')}
                open={showFeedbackModal}
                onCancel={() => setShowFeedbackModal(false)}
                footer={null}
                centered
                width={310}
                styles={{ body: { padding: '16px 12px', borderRadius: 20 } }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#A8621B', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      {t('反馈类型', 'Feedback Type')}
                    </span>
                    <Select
                      value={feedbackForm.type}
                      onChange={(val) => setFeedbackForm({ ...feedbackForm, type: val })}
                      style={{ width: '100%' }}
                      options={[
                        { value: '建议', label: t('建议与想法', 'Suggestion & Ideas') },
                        { value: '问题', label: t('功能故障/报错', 'Bug Reports') },
                        { value: '其他', label: t('其他合作/咨询', 'Others') }
                      ]}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: '#A8621B', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      {t('您的联系邮箱/手机', 'Your Email / Phone')}
                    </span>
                    <Input
                      placeholder={t('例如：yourname@example.com', 'e.g. yourname@example.com')}
                      value={feedbackForm.email}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                      style={{ borderRadius: 10, borderColor: '#FFE2C4' }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: '#A8621B', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      {t('反馈详细内容', 'Detailed Feedback')}
                    </span>
                    <Input.TextArea
                      rows={4}
                      placeholder={t('请在此填写意见，系统将自动汇总并转发给：17611399815@163.com', 'Write your feedback here. System will forward it to 17611399815@163.com')}
                      value={feedbackForm.content}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
                      style={{ borderRadius: 10, borderColor: '#FFE2C4', fontSize: 12 }}
                    />
                  </div>

                  <Button
                    type="primary"
                    block
                    loading={loading}
                    onClick={handleSendFeedback}
                    style={{
                      borderRadius: 14, height: 42, fontWeight: 900, marginTop: 6,
                      background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)', border: 'none'
                    }}
                  >
                    {t('发送意见', 'Submit Feedback')}
                  </Button>
                </div>
              </Modal>

              {/* MODAL: 小爪会员专属权益 */}
              <Modal
                title={null}
                open={showVipModal}
                onCancel={() => setShowVipModal(false)}
                footer={null}
                centered
                width={330}
                styles={{ body: { padding: 0, borderRadius: 24, overflow: 'hidden' } }}
              >
                {/* Premium Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #1A1A1A 0%, #352515 100%)',
                  padding: '24px 20px',
                  color: '#FFF',
                  textAlign: 'center',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>👑</div>
                  <h3 style={{ margin: 0, color: '#FFD700', fontSize: 18, fontWeight: 900 }}>{t('小爪会员尊享计划', 'XiaoZhua VIP Premium')}</h3>
                  <p style={{ margin: '4px 0 0 0', color: '#C0A080', fontSize: 11 }}>{t('专属AI陪伴，爱宠健康的全方位专家保障', 'Expert health support & unlimited AI companion')}</p>
                </div>

                {/* Benefits Grid */}
                <div style={{ padding: '16px 20px', background: '#FFF' }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#2D2621', marginBottom: 10 }}>✨ {t('会员特权', 'VIP Benefits')}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                    {[
                      { icon: '🤖', title: t('AI管家无限对话', 'Unlimited AI chat') },
                      { icon: '📊', title: t('云端多维度分析', 'Cloud Analysis') },
                      { icon: '🏷️', title: t('自营商品享92折', '8% Off Store') },
                      { icon: '🐾', title: t('支持10只宠物建档', 'Up to 10 Pets') }
                    ].map((b, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FDFBF7', padding: '6px 10px', borderRadius: 8, border: '1px solid #FFEEDF' }}>
                        <span style={{ fontSize: 14 }}>{b.icon}</span>
                        <span style={{ fontSize: 10, color: '#8C6239', fontWeight: 700 }}>{b.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tiers / Subscription Options */}
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#2D2621', marginBottom: 10 }}>💳 {t('选择套餐', 'Choose Subscription')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {[
                      { id: 'monthly_auto', name: t('连续包月', 'Monthly Auto-renew'), price: 15, sub: t('次月 ¥15 自动续订', 'Auto-renews at ¥15/mo'), badge: t('最受欢迎', 'Popular') },
                      { id: 'monthly', name: t('月卡会员', '1-Month Pass'), price: 19, sub: t('单月开通不自动续费', 'No auto-renewal') },
                      { id: 'quarterly', name: t('季卡会员', '3-Month Pass'), price: 45, sub: t('低至 ¥15.0/月', 'Equivalent to ¥15/mo') },
                      { id: 'annual', name: t('年卡会员', '12-Month Pass'), price: 128, sub: t('相当于半折优惠 ¥10.6/月', 'Best value ¥10.6/mo'), badge: t('最划算', 'Best Value') },
                    ].map((tier) => {
                      const isSel = selectedVipTier === tier.id;
                      return (
                        <div 
                          key={tier.id}
                          onClick={() => setSelectedVipTier(tier.id)}
                          style={{
                            padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                            border: isSel ? '2px solid #FF8A3D' : '1px solid #FFE7D1',
                            background: isSel ? '#FFFDFB' : '#FFF',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            position: 'relative'
                          }}
                        >
                          {tier.badge && (
                            <span style={{
                              position: 'absolute', top: -6, right: 10,
                              background: 'linear-gradient(90deg, #FF8A3D 0%, #EF4444 100%)',
                              color: '#FFF', fontSize: 8, fontWeight: 900, padding: '1px 6px', borderRadius: 6
                            }}>
                              {tier.badge}
                            </span>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#2D2621' }}>{tier.name}</div>
                            <div style={{ fontSize: 10, color: '#999', marginTop: 1 }}>{tier.sub}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 18, fontWeight: 900, color: '#FF8A3D' }}>¥ {tier.price}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pay action */}
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={() => {
                      const tierNames: Record<string, string> = {
                        monthly_auto: t('连续包月', 'Monthly Auto-renew'),
                        monthly: t('月卡会员', '1-Month Pass'),
                        quarterly: t('季卡会员', '3-Month Pass'),
                        annual: t('年卡会员', '12-Month Pass')
                      };
                      const priceMap: Record<string, number> = { monthly_auto: 15, monthly: 19, quarterly: 45, annual: 128 };
                      const name = tierNames[selectedVipTier];
                      const price = priceMap[selectedVipTier];

                      Modal.info({
                        title: t('小爪支付中心', 'XiaoZhua Payment'),
                        content: t(
                          `您已选择 【${name}】套餐，应付金额为：¥${price}。小爪在线支付安全沙箱加载成功！我们将于下阶段对接微信/支付宝原生支付能力。本次交易仅用于测试开通体验！🐾`,
                          `You have selected ${name} at ¥${price}. Secure Sandbox initiated! We will link real WeChat/Alipay API soon. This transaction is a simulation! 🐾`
                        ),
                        centered: true,
                        okText: t('模拟完成支付', 'Complete Payment'),
                        onOk: () => {
                          message.success(t(`恭喜您！成功开通【${name}】专属小爪会员！🎉`, `Congratulations! You are now a ${name} Premium Member! 🎉`));
                          setShowVipModal(false);
                        }
                      });
                    }}
                    style={{
                      borderRadius: 14, height: 46, fontWeight: 900,
                      background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)', border: 'none',
                      boxShadow: '0 4px 14px rgba(255,138,61,0.3)'
                    }}
                  >
                    ⚡ {t('确认购买并前往安全支付', 'Confirm and Pay')}
                  </Button>
                </div>
              </Modal>

              {/* MODAL: 用户协议 */}
              <Modal
                title={t('📋 用户协议 & 隐私政策', '📋 User Agreement & Privacy Policy')}
                open={showAgreementModal}
                onCancel={() => setShowAgreementModal(false)}
                footer={null}
                centered
                width={320}
                styles={{ body: { padding: '12px 14px', borderRadius: 20 } }}
              >
                <div style={{ height: 320, overflowY: 'auto', paddingRight: 6, fontSize: 11, color: '#555', lineHeight: 1.6 }}>
                  <p style={{ fontWeight: 800, color: '#2D2621', fontSize: 12, margin: '0 0 8px 0' }}>{t('欢迎您注册使用小爪宠物管家！', 'Welcome to XiaoZhua Pet House!')}</p>
                  <p>{t('小爪（下称“我们”）深知您的宠物是您的挚爱家人。在您使用小爪宠物健康档案、智能记账、AI健康管家及宠物用品商城等服务前，请仔细阅读本协议：', 'We understand your pet is a beloved member of your family. Before using our pet registry, accounting, AI, and mall service, please review the following terms:')}</p>
                  
                  <p style={{ fontWeight: 800, color: '#2D2621', margin: '8px 0 4px 0' }}>1. {t('服务说明与账号安全', 'Services & Accounts')}</p>
                  <p>{t('您注册的手机号及设置的登录密码是您在小爪云端的唯一凭证。您同意妥善保管该密码，并对您账号下的所有宠物健康数据录入、商城购买交易等行为负全责。', 'Your registered mobile phone number and password are your unique credentials. You agree to keep them secure and assume responsibility for all health logging and purchases made under your account.')}</p>

                  <p style={{ fontWeight: 800, color: '#2D2621', margin: '8px 0 4px 0' }}>2. {t('健康数据及AI免责声明', 'Health Data & AI Disclaimer')}</p>
                  <p>{t('本应用所提供的体重分析、营养食谱推荐、AI管家日常调理对话建议，以及商城销售之宠物保健用品等相关信息及建议，皆为基于大模型及日常宠物照料常识之模拟参考。小爪无法代替专业执业兽医师之面诊。若宠物出现紧急临床症状或健康受损，您必须立即前往线下宠物医院就诊，小爪对此不承担医疗临床后果及法律责任。', 'All weight indicators, nutrient plans, AI Companion recommendations, and product descriptions are designed for reference and wellness coaching based on general petcare data. Our tools do not constitute veterinary medical diagnosis. If your pet shows acute clinical signs, please visit an offline pet hospital immediately.')}</p>

                  <p style={{ fontWeight: 800, color: '#2D2621', margin: '8px 0 4px 0' }}>3. {t('商城交易与虚拟产品退换', 'Mall Transactions & Digital Goods')}</p>
                  <p>{t('当您在小爪严选商城下单或订购“小爪会员”连续包月等虚拟服务时，一旦虚拟产品扣款开通成功，将无法进行退款。商城实物包裹在未拆封前提下，支持七天无理由退换。', 'When ordering physical supplies or purchasing XiaoZhua VIP digital renewals, digital items are non-refundable once activated. Unopened physical orders are eligible for 7-day hassle-free returns.')}</p>

                  <p style={{ fontWeight: 800, color: '#2D2621', margin: '8px 0 4px 0' }}>4. {t('隐私保障与信息加密', 'Privacy & Data Encryption')}</p>
                  <p>{t('我们将采用行业顶级高强度非对称算法对您的个人隐私、反馈邮箱、宠物历史就医病例及账本财务流水进行高压加密存储，绝不泄露给任何第三方机构。', 'We implement industry-standard encryption for your personal files, email queries, medical histories, and ledger details, ensuring absolute safety.')}</p>

                  <p style={{ marginTop: 12, borderTop: '1px solid #FFE7D1', paddingTop: 8, fontSize: 10, color: '#999', textAlign: 'center' }}>
                    {t('最新修订日期：2026年7月', 'Last updated: July 2026')}
                  </p>
                </div>
                <Button type="primary" block onClick={() => setShowAgreementModal(false)} style={{ borderRadius: 12, height: 38, background: '#FFB23F', borderColor: '#FFB23F', fontWeight: 800, marginTop: 12 }}>
                  {t('我已阅读并同意上述协议', 'I Have Read and Agree')}
                </Button>
              </Modal>

              {/* MODAL: AI 智能推荐商品 */}
              <Modal
                title={null}
                open={showRecommendModal}
                onCancel={() => setShowRecommendModal(false)}
                footer={null}
                centered
                width={330}
                styles={{ body: { padding: 0, borderRadius: 24, overflow: 'hidden' } }}
              >
                {/* Purple Gradient header */}
                <div style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  padding: '20px 16px',
                  color: '#FFF',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>🤖</div>
                  <h3 style={{ margin: 0, color: '#FFF', fontSize: 16, fontWeight: 900 }}>
                    {t('小爪智能 AI 推荐', 'XiaoZhua AI Product Advisor')}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 10 }}>
                    {t(`正在为 ${currentPet?.name} 分析最适合的产品...`, `Analyzing best items for ${currentPet?.name}...`)}
                  </p>
                </div>

                <div style={{ padding: '16px', background: '#FFF' }}>
                  {/* Loading indicator */}
                  {isRecommending ? (
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                      <span style={{ fontSize: 32, display: 'inline-block', animation: 'spin 2s linear infinite' }}>🐾</span>
                      <div style={{ fontSize: 12, color: '#8B5CF6', fontWeight: 800, marginTop: 12 }}>
                        {t('小爪智能管家正在深度分析配方与营养需求...', 'AI is analyzing formulations and requirements...')}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {/* AI Speech Bubble */}
                      <div style={{
                        background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 16,
                        padding: '12px 14px', position: 'relative', fontSize: 12, color: '#5B21B6',
                        lineHeight: 1.6
                      }}>
                        <span style={{ fontWeight: 900, display: 'block', marginBottom: 4 }}>💬 AI 管家推荐语：</span>
                        {aiRecommendText}
                      </div>

                      {/* Recommended products list */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#2D2621', marginBottom: 8 }}>🐾 {t('为您精选最适合的宝贝', 'Recommended for you')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {recommendProducts.map((p) => (
                            <div key={p.id} style={{ display: 'flex', gap: 10, background: '#F9FAFB', borderRadius: 14, padding: 10, border: '1px solid #F3F4F6', alignItems: 'center' }}>
                              <div style={{ width: 48, height: 48, borderRadius: 10, background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                                {p.image ? (
                                  <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} alt="product" />
                                ) : '📦'}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: '#2D2621' }}>{p.name}</div>
                                <div style={{ fontSize: 10, color: '#E11D48', fontWeight: 800, marginTop: 2 }}>{p.points} {t('金币', 'Coins')}</div>
                              </div>
                              <Button 
                                type="primary" 
                                size="small" 
                                onClick={() => {
                                  handleAddToCart(p.id, p.name);
                                }}
                                style={{ borderRadius: 8, fontSize: 10, background: '#8B5CF6', borderColor: '#8B5CF6' }}
                              >
                                🛒 {t('加入购物车', 'Add')}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    block 
                    onClick={() => setShowRecommendModal(false)}
                    style={{ borderRadius: 12, height: 38, marginTop: 14, fontWeight: 800 }}
                  >
                    {t('关闭推荐', 'Close')}
                  </Button>
                </div>
              </Modal>

              {/* === END OF INTERACTIVE WORKSPACE MODALS === */}

            </div>

            {/* Bottom Navigation Taskbar */}
            {(screen === 'home' || screen === 'feature') && (
              <div style={{
                height: 64,
                background: '#FFFFFF',
                borderTop: '1px solid #FFE7D1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '4px 6px',
                boxShadow: '0 -4px 15px rgba(45,38,33,0.025)',
                position: 'relative'
              }}>
                {[
                  {
                    key: 'home',
                    label: '首页',
                    icon: (
                      <svg viewBox="0 0 24 24" width="22" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12c0-3.5 3-5.5 6-5.5s4.5 2 4.5 2 1.5-2 4.5-2 6 2 6 5.5-2.5 5.5-6 5.5-4.5-2-4.5-2-1 2-4.5 2-6-2-6-5.5z" />
                        <path d="M12 9v1" />
                      </svg>
                    )
                  },
                  {
                    key: 'album',
                    label: '照片',
                    icon: (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                      </svg>
                    )
                  },
                  {
                    key: 'ai',
                    label: 'AI助理',
                    isGo: true,
                    icon: null
                  },
                  {
                    key: 'shop',
                    label: '商城',
                    icon: (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    )
                  },
                  {
                    key: 'me',
                    label: '个人',
                    badge: appOrders.length > 0 ? appOrders.length : undefined,
                    icon: (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )
                  }
                ].map((tab) => {
                  const isActive = tab.key === 'home' 
                    ? screen === 'home'
                    : (screen === 'feature' && activeFeature === tab.key);

                  if (tab.isGo) {
                    return (
                      <div
                        key={tab.key}
                        onClick={() => {
                          setScreen('feature');
                          setActiveFeature('ai');
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          zIndex: 99,
                          width: 58,
                          height: 58,
                          transform: 'translateY(-14px)'
                        }}
                      >
                        <div style={{
                          width: 52,
                          height: 52,
                          borderRadius: '50%',
                          background: '#1F1F1F',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transition: 'all 0.2s',
                          border: '2px solid #FFF'
                        }}>
                          <span style={{
                            color: '#FFF',
                            fontSize: 11,
                            fontWeight: 900,
                            letterSpacing: -0.2,
                            fontFamily: 'system-ui, sans-serif'
                          }}>AI助理</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={tab.key}
                      onClick={() => {
                        if (tab.key === 'home') {
                          setScreen('home');
                        } else {
                          setScreen('feature');
                          setActiveFeature(tab.key);
                        }
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flex: 1,
                        transition: 'all 0.2s',
                        color: isActive ? '#FF8A3D' : '#8C6239',
                        transform: isActive ? 'scale(1.04)' : 'scale(1)',
                        position: 'relative'
                      }}
                    >
                      <span style={{ marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {tab.icon}
                        
                        {/* Red Dot/Badge */}
                        {tab.badge && (
                          <span style={{
                            position: 'absolute',
                            top: -6,
                            right: -10,
                            background: '#EF4444',
                            color: '#FFF',
                            fontSize: 8,
                            fontWeight: 900,
                            borderRadius: 10,
                            padding: '1px 4px',
                            minWidth: 14,
                            textAlign: 'center',
                            lineHeight: '10px',
                            border: '1.5px solid #FFF',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}>
                            {tab.badge}
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: isActive ? 900 : 700, letterSpacing: 0.5 }}>{tab.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Virtual Home Gesture Indicator Bar */}
            <div style={{
              height: 20,
              background: screen === 'home' || screen === 'feature' ? '#FFF9F0' : '#FFFDF9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              paddingBottom: 6
            }}>
              <div style={{ width: 120, height: 5, borderRadius: 2.5, background: '#CCCCCC' }} />
            </div>

            {/* Wheel Weight Picker Modal (Flutter-style) */}
            <WheelWeightPickerModal
              open={isWeightModalOpen}
              onClose={() => setIsWeightModalOpen(false)}
              value={newPetForm.weight}
              onChange={(v) => { setNewPetForm({ ...newPetForm, weight: v }); message.success(`已设置体重为 ${v} KG`); }}
            />

            {/* Wheel Date Picker Modal */}
            <WheelDatePickerModal
              open={datePickerOpen !== null}
              onClose={() => setDatePickerOpen(null)}
              value={datePickerOpen === 'birthday' ? newPetForm.birthday : (newPetForm.arrivalDate || newPetForm.meetDate)}
              onChange={(v) => {
                if (datePickerOpen === 'birthday') {
                  setNewPetForm({ ...newPetForm, birthday: v });
                } else {
                  setNewPetForm({ ...newPetForm, meetDate: v, arrivalDate: v });
                }
              }}
            />

            {/* Taobao/Meituan Style Checkout Shipping & Payment Modal */}
            <Modal
              open={checkoutModalOpen}
              onCancel={() => setCheckoutModalOpen(false)}
              footer={null}
              width={330}
              centered
              styles={{ body: { padding: '20px 16px', background: '#FFFDF9', borderRadius: 24 } }}
              title={
                <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 900, color: '#2D2621' }}>
                  📦 确认订单与支付
                </div>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 440, overflowY: 'auto', paddingRight: 4 }}>
                
                {/* Section 1: Shipping Address */}
                <div style={{ background: '#FFF', padding: 12, borderRadius: 14, border: '1px solid #FFE7D1' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#FF8A3D', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    📍 收货人信息
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#999', display: 'block', marginBottom: 2 }}>收货人姓名</span>
                      <Input 
                        placeholder="请输入收货人姓名" 
                        value={shippingName} 
                        onChange={(e) => setShippingName(e.target.value)} 
                        style={{ borderRadius: 8, fontSize: 12 }} 
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#999', display: 'block', marginBottom: 2 }}>联系电话</span>
                      <Input 
                        placeholder="请输入联系电话" 
                        value={shippingPhone} 
                        onChange={(e) => setShippingPhone(e.target.value)} 
                        style={{ borderRadius: 8, fontSize: 12 }} 
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#999', display: 'block', marginBottom: 2 }}>收货地址</span>
                      <Input.TextArea 
                        rows={2} 
                        placeholder="请输入完整的收货地址" 
                        value={shippingAddress} 
                        onChange={(e) => setShippingAddress(e.target.value)} 
                        style={{ borderRadius: 8, fontSize: 12, resize: 'none' }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Items Summary */}
                <div style={{ background: '#FFF', padding: 12, borderRadius: 14, border: '1px solid #FFE7D1' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#8C6239', marginBottom: 6 }}>
                    🛍️ 商品清单
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(cart).map(([prodId, qty]) => {
                      const prod = products.find(p => p.id === prodId);
                      if (!prod) return null;
                      return (
                        <div key={prodId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555' }}>
                          <span>{prod.name} x {qty}</span>
                          <span style={{ fontWeight: 700 }}>¥{(prod.price * qty).toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div style={{ borderTop: '1px dashed #FFE7D1', marginTop: 4, paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 900, color: '#EF4444' }}>
                      <span>合计金额:</span>
                      <span>¥{Object.entries(cart).reduce((total, [id, qty]) => {
                        const prod = products.find(p => p.id === id);
                        return total + (prod ? prod.price * qty : 0);
                      }, 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Select Payment Method */}
                <div style={{ background: '#FFF', padding: 12, borderRadius: 14, border: '1px solid #FFE7D1' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#8C6239', marginBottom: 8 }}>
                    💳 选择付款方式
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { key: 'wechat', icon: '🟢', label: '微信支付', desc: '推荐微信快捷支付' },
                      { key: 'alipay', icon: '🔵', label: '支付宝', desc: '安全极速支付' },
                      { key: 'bank', icon: '💳', label: '银行卡支付', desc: '各大商业银行借记卡/贷记卡' }
                    ].map((pm) => {
                      const isSelected = paymentMethod === pm.key;
                      return (
                        <div 
                          key={pm.key}
                          onClick={() => setPaymentMethod(pm.key as any)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 10,
                            border: isSelected ? '2px solid #FF8A3D' : '1px solid #F3ECE6',
                            background: isSelected ? '#FFFDF0' : '#FFF',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 16 }}>{pm.icon}</span>
                            <div>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#333', display: 'block' }}>{pm.label}</span>
                              <span style={{ fontSize: 9, color: '#999', display: 'block' }}>{pm.desc}</span>
                            </div>
                          </div>
                          <div style={{
                            width: 14, height: 14, borderRadius: '50%',
                            border: '1px solid #FF8A3D',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isSelected ? '#FF8A3D' : 'transparent'
                          }}>
                            {isSelected && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFF' }} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Confirm Pay Button */}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Button block onClick={() => setCheckoutModalOpen(false)} style={{ borderRadius: 12, height: 42, fontWeight: 700, color: '#999' }}>
                  取消
                </Button>
                <Button 
                  block 
                  type="primary" 
                  loading={loading}
                  onClick={handleConfirmPayment}
                  style={{
                    borderRadius: 12, height: 42, fontWeight: 800, fontSize: 13,
                    background: 'linear-gradient(90deg, #FFB23F 0%, #FF8A3D 100%)', border: 'none'
                  }}
                >
                  立即付款
                </Button>
              </div>
            </Modal>

            {/* Taobao/Meituan Style Order History Modal */}
            <Modal
              open={showOrderHistoryModal}
              onCancel={() => setShowOrderHistoryModal(false)}
              footer={null}
              width={330}
              centered
              styles={{ body: { padding: '20px 14px', background: '#F8F9FA', borderRadius: 24 } }}
              title={
                <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 900, color: '#2D2621' }}>
                  📋 我的订单信息
                </div>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 460, overflowY: 'auto', paddingRight: 4 }}>
                {appOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 12px', background: '#FFF', borderRadius: 16, border: '1px solid #FFE7D1' }}>
                    <span style={{ fontSize: 36, display: 'block', marginBottom: 10 }}>📦</span>
                    <span style={{ fontSize: 12, color: '#8C6239', fontWeight: 800, display: 'block', marginBottom: 4 }}>暂无订单记录 🐾</span>
                    <span style={{ fontSize: 10, color: '#999', display: 'block', marginBottom: 12 }}>您还没有在商城购买过商品哦</span>
                    <Button 
                      size="small" 
                      type="primary" 
                      onClick={() => { setShowOrderHistoryModal(false); handleOpenFeature('shop'); }}
                      style={{ background: '#FF8A3D', borderColor: '#FF8A3D', borderRadius: 10, fontSize: 11, fontWeight: 800 }}
                    >
                      去商城逛逛
                    </Button>
                  </div>
                ) : (
                  appOrders.map((ord) => {
                    const totalQty = ord.items ? ord.items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) : 1;
                    return (
                      <div key={ord.id} style={{ background: '#FFF', padding: 12, borderRadius: 16, border: '1px solid #FFE7D1', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {/* Order Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3ECE6', paddingBottom: 6, fontSize: 10 }}>
                          <span style={{ color: '#888', fontWeight: 600 }}>单号: {ord.id}</span>
                          <span style={{ color: '#FF8A3D', fontWeight: 800 }}>已支付 🐾</span>
                        </div>

                        {/* Order Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {ord.items && ord.items.map((item: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>🛒 {item.product?.name || '未知商品'}</span>
                              <span style={{ fontSize: 11, color: '#666' }}>x{item.quantity || 1}  <strong style={{ color: '#333' }}>¥{(item.price || 0).toFixed(2)}</strong></span>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary Line */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #F3ECE6', paddingTop: 6, fontSize: 11 }}>
                          <span style={{ color: '#888' }}>共 {totalQty} 件商品</span>
                          <span style={{ fontWeight: 800, color: '#EF4444' }}>实付金额: ¥{(ord.total_amount || 0).toFixed(2)}</span>
                        </div>

                        {/* Shipping details */}
                        <div style={{ background: '#FAF8F5', padding: '6px 8px', borderRadius: 8, fontSize: 10, color: '#666', display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div>👤 收件人: <span style={{ fontWeight: 700, color: '#333' }}>{ord.shipping_name} ({ord.shipping_phone})</span></div>
                          <div>📍 地址: <span style={{ color: '#333' }}>{ord.shipping_address}</span></div>
                          <div>💳 支付方式: <span style={{ color: '#333', fontWeight: 700 }}>
                            {ord.payment_method === 'wechat' ? '🟢 微信支付' : ord.payment_method === 'alipay' ? '🔵 支付宝' : '💳 银行卡支付'}
                          </span></div>
                          <div style={{ fontSize: 9, color: '#999', marginTop: 2 }}>📅 下单时间: {new Date(ord.created_at).toLocaleString('zh-CN')}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div style={{ marginTop: 14 }}>
                <Button block onClick={() => setShowOrderHistoryModal(false)} style={{ borderRadius: 12, height: 38, fontWeight: 800, background: '#FFF', border: '1px solid #FFE7D1', color: '#8C6239' }}>
                  关闭
                </Button>
              </div>
            </Modal>

          </div>
        </div>
      </div>
    </div>
    )}

    {/* TAB 2: FLUTTER CODE EXPLORER */}
    {workspaceTab === 'explorer' && (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%', height: 'calc(100vh - 60px)' }}>
        {/* Left File Tree Panel */}
        <div style={{
          width: 320,
          background: '#1A1A1E',
          borderRight: '1px solid #2D2D34',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '20px 16px', borderBottom: '1px solid #2D2D34' }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: '#FFB23F', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 4 }}>
              Flutter Workspace Tree
            </span>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#FFF' }}>小爪 App 项目源码</h3>
          </div>
          
          <div style={{ padding: '12px 8px' }}>
            {/* File entries */}
            {[
              { path: 'mobile/pubspec.yaml', label: 'pubspec.yaml', type: 'config', icon: '📦' },
              { path: 'mobile/lib/main.dart', label: 'lib/main.dart', type: 'dart', icon: '🎯' },
              { path: 'mobile/lib/services/app_provider.dart', label: 'lib/services/app_provider.dart', type: 'dart', icon: '⚡' },
              { path: 'mobile/lib/theme/app_theme.dart', label: 'lib/theme/app_theme.dart', type: 'dart', icon: '🎨' },
              { path: 'mobile/lib/pages/home_page.dart', label: 'lib/pages/home_page.dart', type: 'dart', icon: '🏠' },
              { path: 'mobile/lib/pages/shop/shop_page.dart', label: 'lib/pages/shop/shop_page.dart', type: 'dart', icon: '🛒' },
              { path: 'mobile/lib/pages/ai_assistant/ai_assistant_page.dart', label: 'lib/pages/ai_assistant/ai_assistant_page.dart', type: 'dart', icon: '🤖' },
              { path: 'mobile/lib/pages/weight/weight_page.dart', label: 'lib/pages/weight/weight_page.dart', type: 'dart', icon: '⚖️' },
              { path: 'mobile/lib/pages/reminder/reminder_page.dart', label: 'lib/pages/reminder/reminder_page.dart', type: 'dart', icon: '⏰' },
            ].map((file) => {
              const isSelected = selectedFilePath === file.path;
              return (
                <div
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(255, 178, 63, 0.12)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #FFB23F' : '3px solid transparent',
                    color: isSelected ? '#FFF' : '#C0C0C5',
                    marginBottom: 4,
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ fontSize: 16 }}>{file.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 800 : 500, fontFamily: 'JetBrains Mono, SFMono-Regular, Consolas, monospace' }}>
                      {file.label.split('/').pop()}
                    </div>
                    <div style={{ fontSize: 11, color: isSelected ? '#FFB23F' : '#6E6E73', marginTop: 1 }}>
                      {file.path}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Code Content / Viewer Panel */}
        <div style={{
          flex: 1,
          background: '#121214',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Editor Header */}
          <div style={{
            background: '#1A1A1E',
            borderBottom: '1px solid #2D2D34',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14 }}>📝</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#FFF' }}>
                {selectedFilePath}
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(fileContent);
                message.success('代码已成功复制到剪贴板！');
              }}
              style={{
                background: '#26262B',
                color: '#E6E6E6',
                border: '1px solid #32323A',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>📋</span>
              <span>复制代码</span>
            </button>
          </div>

          {/* Editor Content Area */}
          <div style={{ flex: 1, overflow: 'auto', padding: 24, background: '#0E0E10' }}>
            {fileLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                <span style={{ fontSize: 32, animation: 'spin 1.5s linear infinite' }}>⏳</span>
                <span style={{ fontSize: 13, color: '#888' }}>正在读取 Flutter 原生源码...</span>
              </div>
            ) : (
              <pre style={{
                margin: 0,
                fontFamily: 'JetBrains Mono, Fira Code, Courier New, monospace',
                fontSize: 13,
                lineHeight: 1.6,
                color: '#A9B2C3',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                <code>
                  {fileContent || '请选择左侧的文件开始查看 Flutter Dart 代码。'}
                </code>
              </pre>
            )}
          </div>
        </div>
      </div>
    )}

    {/* TAB 3: MULTI-PLATFORM COMPILE SPECIFICATION */}
    {workspaceTab === 'compile_spec' && (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%', height: 'calc(100vh - 60px)', background: '#121214' }}>
        {/* Left side documentation column */}
        <div style={{
          width: '50%',
          borderRight: '1px solid #2D2D34',
          padding: '32px',
          overflowY: 'auto',
          lineHeight: 1.6
        }}>
          {/* Platform Tab Controller */}
          <div style={{
            display: 'flex',
            background: '#1A1A1E',
            borderRadius: 10,
            padding: 4,
            border: '1px solid #2D2D34',
            marginBottom: 24,
            maxWidth: 380
          }}>
            {[
              { id: 'ios', label: 'Apple iOS', emoji: '🍏' },
              { id: 'android', label: 'Android', emoji: '🤖' },
              { id: 'harmony', label: '鸿蒙 HarmonyOS', emoji: '🚀' }
            ].map((plat) => {
              const isActive = compilePlatform === plat.id;
              return (
                <button
                  key={plat.id}
                  onClick={() => {
                    setCompilePlatform(plat.id as any);
                    setCompileLogs([]);
                  }}
                  style={{
                    flex: 1,
                    background: isActive ? '#FFB23F' : 'transparent',
                    color: isActive ? '#121214' : '#E6E6E6',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 11,
                    fontWeight: 900,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}
                >
                  <span>{plat.emoji}</span>
                  <span>{plat.label}</span>
                </button>
              );
            })}
          </div>

          {compilePlatform === 'ios' && (
            <div>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#FFB23F', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'block', marginBottom: 6 }}>
                iOS 17.0+ Production-Ready Specs
              </span>
              <h2 style={{ margin: '0 0 16px 0', fontSize: 24, fontWeight: 900, color: '#FFF' }}>
                小爪 App iOS 技术框架与打包规范
              </h2>
              <p style={{ fontSize: 14, color: '#A0A0A5', marginBottom: 24 }}>
                本项目采用最新的 Flutter SDK 跨平台引擎，对 iOS 端进行了深度优化。设计风格完美适配暖色治愈风（Warm Healing UI），具备原生流畅度与出色的内存控制表现。
              </p>

              <div style={{ background: '#1A1A1E', borderRadius: 12, padding: 20, border: '1px solid #2D2D34', marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#FFB23F', fontWeight: 800 }}>⚙️ iOS 核心架构设计</h4>
                <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: '#C0C0C5', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <li><strong>状态引擎同步：</strong>基于 Provider 进行组件级状态驱动，支持对宠物档案、体重曲线等数据的离线缓存，网络恢复时自动向 Express 后端发起同步增量提交。</li>
                  <li><strong>UI 平滑过渡：</strong>对 iOS 视网膜 Retina 显示屏做专属适配，使用 CupertinoPageRoute 实现丝滑的原生抽屉与过渡物理阻尼回弹特效。</li>
                  <li><strong>本地安全存储：</strong>使用 Flutter iOS KeyChain 插件安全隔离用户 JWT，采用 SQLite 作为本地轻量数据库存储离线病历与每日提醒。</li>
                </ul>
              </div>

              <div style={{ background: '#1A1A1E', borderRadius: 12, padding: 20, border: '1px solid #2D2D34', marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#FFB23F', fontWeight: 800 }}>📦 Apple Store 上架步骤与打包指令</h4>
                <ol style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: '#C0C0C5', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <li>进入工程目录：<code>cd mobile</code></li>
                  <li>安装 CocoaPods 框架依赖：<code>pod install --repo-update</code></li>
                  <li>执行静态代码检查：<code>flutter analyze</code></li>
                  <li>生成打包 Archive 归档：<code>flutter build ipa --release --export-options-plist=ios/ExportOptions.plist</code></li>
                  <li>通过 Transporter 上传至 App Store Connect，配置 TestFlight 进行灰度测试发布。</li>
                </ol>
              </div>
            </div>
          )}

          {compilePlatform === 'android' && (
            <div>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#FFB23F', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'block', marginBottom: 6 }}>
                Android 10.0+ (API 29+) Production-Ready Specs
              </span>
              <h2 style={{ margin: '0 0 16px 0', fontSize: 24, fontWeight: 900, color: '#FFF' }}>
                小爪 App Android 技术框架与打包规范
              </h2>
              <p style={{ fontSize: 14, color: '#A0A0A5', marginBottom: 24 }}>
                小爪 App 基于 Flutter SDK 的 AOT 高性能编译器，完美适配 Android (SDK 21 - 34+) 平台。全代码包体积轻量，提供高度响应的 60/120Hz 刷新率支持，满足各种主流机型流畅运行。
              </p>

              <div style={{ background: '#1A1A1E', borderRadius: 12, padding: 20, border: '1px solid #2D2D34', marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#FFB23F', fontWeight: 800 }}>⚙️ Android 核心架构设计</h4>
                <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: '#C0C0C5', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <li><strong>高效渲染树：</strong>基于 Material 3 暖色风格规范，使用 Flutter Skia/Impeller 硬件加速渲染技术，完美适配各种异形屏、折叠屏及刘海屏。</li>
                  <li><strong>后台任务与服务：</strong>利用 Android AlarmManager 与 WorkManager 桥接层，即使应用进入后台，宠物提醒与药量闹钟也会由原生系统广播触发，稳定可靠。</li>
                  <li><strong>安全权限模型：</strong>遵循 Android 10-14 颗粒度安全规则，对相册读写、系统相机及本地存储进行动态权限请求，极力保护用户隐私安全。</li>
                </ul>
              </div>

              <div style={{ background: '#1A1A1E', borderRadius: 12, padding: 20, border: '1px solid #2D2D34', marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#FFB23F', fontWeight: 800 }}>📦 Android 渠道包发布与打包指令</h4>
                <ol style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: '#C0C0C5', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <li>进入工程目录：<code>cd mobile</code></li>
                  <li>安装依赖包：<code>flutter pub get</code></li>
                  <li>执行静态代码检查：<code>flutter analyze</code></li>
                  <li>生成打包 Release APK：<code>flutter build apk --release</code> (或 <code>flutter build appbundle --release</code> 生成 Google Play AAB 包)</li>
                  <li>通过各国内应用商店控制台（或 Google Play Console）上传已签名的安装包并关联应用分发审核。</li>
                </ol>
              </div>
            </div>
          )}

          {compilePlatform === 'harmony' && (
            <div>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#FFB23F', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'block', marginBottom: 6 }}>
                HarmonyOS NEXT / OpenHarmony Production Specs
              </span>
              <h2 style={{ margin: '0 0 16px 0', fontSize: 24, fontWeight: 900, color: '#FFF' }}>
                小爪 App 鸿蒙星河版技术框架
              </h2>
              <p style={{ fontSize: 14, color: '#A0A0A5', marginBottom: 24 }}>
                小爪 Flutter 代码库支持一键构建为 HarmonyOS NEXT 纯血鸿蒙应用程序。通过 Flutter 开源社区及华为官方深度适配的 HarmonyOS SDK，实现 100% 鸿蒙原生的高性能流畅表现，全面助力国产自主可控生态。
              </p>

              <div style={{ background: '#1A1A1E', borderRadius: 12, padding: 20, border: '1px solid #2D2D34', marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#FFB23F', fontWeight: 800 }}>⚙️ 鸿蒙原生适配架构设计</h4>
                <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: '#C0C0C5', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <li><strong>鸿蒙混合桥接：</strong>使用华为开放能力（HarmonyOS Common Ability）重构 Platform Channels，无缝调用鸿蒙原生的相机、图库与安全沙箱存储。</li>
                  <li><strong>ArkTS/ArkUI 原生联动：</strong>Flutter 引擎底座采用原生 C++ 渲染直接输出，提供媲美 ArkTS 状态绑定的高帧率无缝视觉。</li>
                  <li><strong>桌面万能卡片：</strong>深度对接鸿蒙服务卡片（Service Widgets），用户可将毛孩子今日数据直接放置于桌面，由卡片机制实时渲染驱动。</li>
                </ul>
              </div>

              <div style={{ background: '#1A1A1E', borderRadius: 12, padding: 20, border: '1px solid #2D2D34', marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#FFB23F', fontWeight: 800 }}>📦 HarmonyOS 编译与打包发布</h4>
                <ol style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: '#C0C0C5', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <li>配置鸿蒙 Flutter SDK 环境并在 <code>pubspec.yaml</code> 开启 ohos 平台支持</li>
                  <li>执行 ohos 项目初始化：<code>flutter create --platforms ohos .</code></li>
                  <li>通过 ohpm 获取依赖包：<code>ohpm install</code></li>
                  <li>编译生成鸿蒙 Hap 包：<code>flutter build hap --release</code></li>
                  <li>使用 DevEco Studio 导入 <code>ohos</code> 目录进行最后的签名归档，并上传至华为开发者联盟平台发布审核。</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Right side mock compiler logs terminal */}
        <div style={{
          width: '50%',
          background: '#08080A',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 900, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>
                  Interactive Build Simulation
                </span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#FFF' }}>
                  {compilePlatform === 'ios' && 'iOS 端 Xcode 仿真编译检查'}
                  {compilePlatform === 'android' && 'Android 端 Gradle 仿真编译检查'}
                  {compilePlatform === 'harmony' && 'HarmonyOS 端 DevEco 仿真编译检查'}
                </h3>
              </div>

              <button
                disabled={isCompiling}
                onClick={startMockCompile}
                style={{
                  background: isCompiling ? '#26262B' : '#FFB23F',
                  color: isCompiling ? '#888' : '#121214',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: isCompiling ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(255, 178, 63, 0.2)'
                }}
              >
                <span>
                  {isCompiling ? '⏳ 编译检查中...' : `▶️ 开始 ${compilePlatform.toUpperCase()} 编译检查`}
                </span>
              </button>
            </div>

            {/* Simulated Terminal body */}
            <div style={{
              background: '#000',
              borderRadius: 12,
              border: '1px solid #1E1E24',
              height: 420,
              padding: 20,
              fontFamily: 'JetBrains Mono, Courier New, monospace',
              fontSize: 12,
              color: '#34D399',
              overflowY: 'auto',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}>
              {compileLogs.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6E6E73' }}>
                  <span>
                    {compilePlatform === 'ios' && '💻 iOS Compiler Core Idle.'}
                    {compilePlatform === 'android' && '💻 Android Gradle Daemon Idle.'}
                    {compilePlatform === 'harmony' && '💻 HarmonyOS DevEco Compiler Idle.'}
                  </span>
                  <span style={{ marginTop: 8, fontSize: 11, textAlign: 'center' }}>
                    点击上方按钮，开始模拟构建并进行 {compilePlatform.toUpperCase()} 端的包体合规性自测。
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {compileLogs.map((log, index) => (
                    <div key={index} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {log}
                    </div>
                  ))}
                  {isCompiling && (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <span style={{ width: 6, height: 12, background: '#34D399', display: 'inline-block', animation: 'pulse 0.8s infinite' }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1A1A22', paddingTop: 16, fontSize: 11, color: '#555', display: 'flex', justifyContent: 'space-between' }}>
            <span>
              {compilePlatform === 'ios' && 'Deployment SDK Target: iOS 17.0+'}
              {compilePlatform === 'android' && 'Deployment SDK Target: Android 10.0+ (API 29+)'}
              {compilePlatform === 'harmony' && 'Deployment SDK Target: HarmonyOS NEXT / HarmonyOS 4.0+'}
            </span>
            <span>Compiler Output: Compliant</span>
          </div>
        </div>
      </div>
    )}
      </div>
    </div>
  );
}

export default function MobileApp() {
  return (
    <App>
      <MobileAppContent />
    </App>
  );
}
