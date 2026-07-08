import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './expenses.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('消费记账')
@ApiBearerAuth()
@Controller('pets/:petId/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: '获取宠物所有消费记录' })
  async findAll(
    @Param('petId') petId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.expensesService.findAll(petId, user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: '获取消费汇总（总金额 + 分类统计）' })
  async getSummary(
    @Param('petId') petId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.expensesService.getSummary(petId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单条消费记录' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.expensesService.findOne(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建消费记录' })
  async create(
    @Param('petId') petId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(petId, user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新消费记录' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除消费记录' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.expensesService.remove(id, user.id);
  }
}
