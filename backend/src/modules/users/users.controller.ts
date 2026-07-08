import { Controller, Get, Put, Delete, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Put('me')
  updateMe(@CurrentUser('id') userId: string, @Body() body: { nickname?: string; avatarUrl?: string }) {
    return this.usersService.updateMe(userId, body);
  }

  @Delete('me')
  deleteMe(@CurrentUser('id') userId: string) {
    return this.usersService.deleteMe(userId);
  }
}
