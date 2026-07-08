import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { CreateReminderDto, UpdateReminderDto } from './reminders.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('reminders')
@Controller('pets/:petId/reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  @ApiOperation({ summary: '获取某宠物的所有提醒' })
  @ApiResponse({ status: 200, description: '成功返回提醒列表' })
  async findAll(
    @Param('petId') petId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.remindersService.findAll(petId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个提醒详情' })
  @ApiResponse({ status: 200, description: '成功返回提醒详情' })
  @ApiResponse({ status: 404, description: '提醒不存在' })
  async findOne(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.remindersService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: '创建新提醒' })
  @ApiResponse({ status: 201, description: '成功创建提醒' })
  async create(
    @Param('petId') petId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateReminderDto,
  ) {
    return this.remindersService.create(petId, user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新提醒' })
  @ApiResponse({ status: 200, description: '成功更新提醒' })
  @ApiResponse({ status: 404, description: '提醒不存在' })
  async update(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateReminderDto,
  ) {
    return this.remindersService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除提醒' })
  @ApiResponse({ status: 204, description: '成功删除提醒' })
  @ApiResponse({ status: 404, description: '提醒不存在' })
  async remove(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.remindersService.remove(id, user.id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: '切换提醒的完成状态' })
  @ApiResponse({ status: 200, description: '成功切换完成状态' })
  @ApiResponse({ status: 404, description: '提醒不存在' })
  async toggleComplete(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.remindersService.toggleComplete(id, user.id);
  }
}
