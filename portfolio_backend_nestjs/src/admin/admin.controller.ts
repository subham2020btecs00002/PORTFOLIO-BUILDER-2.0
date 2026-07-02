import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getAdminStats();
  }

  @Get('users')
  async getUsers(@Query('search') search?: string) {
    return this.adminService.getUsersWithPortfolios(search);
  }

  @Put('users/:userId/role')
  async updateUserRole(
    @CurrentUser() admin: { id: string },
    @Param('userId') userId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.adminService.updateUserRole(admin.id, userId, dto.role);
  }

  @Delete('users/:userId')
  async deleteUser(
    @CurrentUser() admin: { id: string },
    @Param('userId') userId: string,
  ) {
    return this.adminService.deleteUser(admin.id, userId);
  }

  @Delete('users/:userId/portfolio')
  async deletePortfolio(
    @Param('userId') userId: string,
  ) {
    return this.adminService.deleteUserPortfolio(userId);
  }
}
