import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始播种数据库...');

  // Create default admin
  const hashedPassword = await bcryptjs.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'super_admin',
    },
  });
  console.log('✅ 管理员账号: admin / admin123');

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { phone: '13800138000' },
    update: {},
    create: {
      phone: '13800138000',
      nickname: '小爪用户',
      role: 'user',
    },
  });
  console.log('✅ 演示用户: 13800138000');

  // Create demo pet
  const demoPet = await prisma.pet.create({
    data: {
      userId: demoUser.id,
      name: '小爪',
      gender: '男孩',
      type: '狗狗',
      breed: '柴犬',
      birthday: '2023年5月20日',
      meetDate: new Date('2025-02-25'),
      weight: 14.5,
      isNeutered: true,
      emoji: '🐶',
      isCurrent: true,
    },
  });
  console.log('✅ 演示宠物: 小爪 (柴犬)');

  // Seed demo products
  const products = [
    { name: '天然狗粮 5kg', description: '进口无谷配方，全犬期适用', emoji: '🦴', category: 'food', price: 258.00, stock: 100 },
    { name: '三文鱼猫粮', description: '高蛋白美毛配方', emoji: '🐟', category: 'food', price: 198.00, stock: 80 },
    { name: '耐咬橡胶球', description: '互动磨牙玩具，适合中大型犬', emoji: '🎾', category: 'toy', price: 39.00, stock: 200 },
    { name: '宠物沐浴露', description: '温和不刺激，pH平衡配方', emoji: '🧴', category: 'supplies', price: 68.00, stock: 150 },
    { name: '体内驱虫药', description: '每三个月一次，安全有效', emoji: '💊', category: 'medicine', price: 45.00, stock: 300 },
    { name: '毛绒公仔', description: '陪伴安抚玩具，柔软亲肤', emoji: '🧸', category: 'toy', price: 29.00, stock: 120 },
    { name: '宠物小衣服', description: '纯棉透气，多色可选', emoji: '👔', category: 'clothing', price: 55.00, stock: 90 },
    { name: '鸡肉零食棒', description: '训练奖励专用，低脂高蛋白', emoji: '🍖', category: 'snack', price: 25.00, stock: 250 },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`✅ ${products.length} 个演示商品已创建`);

  // Seed demo reminders
  const now = new Date();
  await prisma.reminder.createMany({
    data: [
      {
        petId: demoPet.id, userId: demoUser.id,
        title: '年度疫苗', type: 'vaccine',
        description: '狂犬疫苗加强针',
        remindDate: new Date(now.getTime() + 3 * 86400000),
        remindTime: '09:00',
      },
      {
        petId: demoPet.id, userId: demoUser.id,
        title: '每月驱虫', type: 'deworm',
        remindDate: new Date(now.getTime() + 7 * 86400000),
        remindTime: '08:30',
      },
    ],
  });
  console.log('✅ 演示提醒已创建');

  // Seed demo expenses
  await prisma.expense.createMany({
    data: [
      { petId: demoPet.id, userId: demoUser.id, category: 'food', amount: 258.00, note: '进口天然粮', expenseDate: new Date(now.getTime() - 5 * 86400000) },
      { petId: demoPet.id, userId: demoUser.id, category: 'medical', amount: 680.00, note: '年度体检', expenseDate: new Date(now.getTime() - 14 * 86400000) },
      { petId: demoPet.id, userId: demoUser.id, category: 'bath', amount: 150.00, note: '美容洗护', expenseDate: new Date(now.getTime() - 20 * 86400000) },
    ],
  });
  console.log('✅ 演示账单已创建');

  // Seed demo weight records
  await prisma.weightRecord.createMany({
    data: [
      { petId: demoPet.id, userId: demoUser.id, weight: 12.5, recordDate: new Date(now.getTime() - 90 * 86400000) },
      { petId: demoPet.id, userId: demoUser.id, weight: 13.2, recordDate: new Date(now.getTime() - 60 * 86400000) },
      { petId: demoPet.id, userId: demoUser.id, weight: 14.0, recordDate: new Date(now.getTime() - 30 * 86400000) },
      { petId: demoPet.id, userId: demoUser.id, weight: 14.5, recordDate: now },
    ],
  });
  console.log('✅ 演示体重记录已创建');

  console.log('\n🎉 数据库播种完成!');
}

main()
  .catch((e) => {
    console.error('播种失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
