import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 查询宠物下的所有消费记录（验证宠物属于当前用户）
   */
  async findAll(petId: string, userId: string) {
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, userId },
    });
    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    const expenses = await this.prisma.expense.findMany({
      where: { petId, userId },
      orderBy: { expenseDate: 'desc' },
    });

    return expenses.map(this.formatExpense);
  }

  /**
   * 查询单条消费记录（验证所有权）
   */
  async findOne(id: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException('消费记录不存在');
    }
    if (expense.userId !== userId) {
      throw new ForbiddenException('无权访问该记录');
    }

    return this.formatExpense(expense);
  }

  /**
   * 创建消费记录（验证宠物属于当前用户）
   */
  async create(petId: string, userId: string, dto: CreateExpenseDto) {
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, userId },
    });
    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    const expense = await this.prisma.expense.create({
      data: {
        petId,
        userId,
        category: dto.category,
        amount: dto.amount,
        note: dto.note,
        expenseDate: new Date(dto.expenseDate),
      },
    });

    return this.formatExpense(expense);
  }

  /**
   * 更新消费记录（验证所有权）
   */
  async update(id: string, userId: string, dto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException('消费记录不存在');
    }
    if (expense.userId !== userId) {
      throw new ForbiddenException('无权修改该记录');
    }

    const updated = await this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.expenseDate !== undefined && { expenseDate: new Date(dto.expenseDate) }),
      },
    });

    return this.formatExpense(updated);
  }

  /**
   * 删除消费记录（验证所有权）
   */
  async remove(id: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException('消费记录不存在');
    }
    if (expense.userId !== userId) {
      throw new ForbiddenException('无权删除该记录');
    }

    await this.prisma.expense.delete({ where: { id } });

    return { message: '已删除' };
  }

  /**
   * 获取消费汇总：总金额 + 按分类统计
   */
  async getSummary(petId: string, userId: string) {
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, userId },
    });
    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    const expenses = await this.prisma.expense.findMany({
      where: { petId, userId },
    });

    const total = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const byCategory: Record<string, number> = {};
    for (const e of expenses) {
      const cat = e.category;
      byCategory[cat] = (byCategory[cat] || 0) + Number(e.amount);
    }

    return {
      total: Math.round(total * 100) / 100,
      count: expenses.length,
      byCategory,
    };
  }

  // ───────────────────── 内部方法 ─────────────────────

  /**
   * 格式化消费记录，将 Decimal 转为 number
   */
  private formatExpense(expense: any) {
    return {
      ...expense,
      amount: Number(expense.amount),
    };
  }
}
