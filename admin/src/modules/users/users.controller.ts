import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './users.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Get the current authenticated user's profile, including their pets.
   */
  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息（含宠物列表）' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  /**
   * PUT /users/me
   * Update the current user's nickname and/or avatar.
   */
  @Put('me')
  @ApiOperation({ summary: '更新当前用户昵称/头像' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  /**
   * DELETE /users/me
   * Delete the current user's account and all related data (cascade).
   */
  @Delete('me')
  @ApiOperation({ summary: '注销账户（级联删除所有关联数据）' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@CurrentUser('id') userId: string) {
    await this.usersService.deleteAccount(userId);
  }
}
