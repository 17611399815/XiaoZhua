import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './medical-records.dto';

@ApiTags('医疗记录')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets/:petId/medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  /**
   * 获取某宠物的所有就诊记录
   */
  @Get()
  @ApiOperation({ summary: '获取宠物的所有就诊记录' })
  async findAll(
    @Param('petId') petId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.medicalRecordsService.findAll(petId, user.id);
  }

  /**
   * 创建新的就诊记录
   */
  @Post()
  @ApiOperation({ summary: '创建就诊记录' })
  async create(
    @Param('petId') petId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.create(petId, user.id, dto);
  }

  /**
   * 更新就诊记录
   */
  @Put(':id')
  @ApiOperation({ summary: '更新就诊记录' })
  async update(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.update(id, user.id, dto);
  }

  /**
   * 删除就诊记录
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除就诊记录' })
  async remove(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.medicalRecordsService.remove(id, user.id);
  }
}
