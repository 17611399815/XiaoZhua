import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { WeightRecordsService } from './weight-records.service';
import { CreateWeightRecordDto, UpdateWeightRecordDto } from './weight-records.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Authenticated user payload extracted from the JWT / session.
 */
interface AuthenticatedUser {
  userId: string;
}

@Controller('pets/:petId/weight-records')
export class WeightRecordsController {
  constructor(private readonly weightRecordsService: WeightRecordsService) {}

  /**
   * GET /pets/:petId/weight-records
   * List all weight records for a pet.
   */
  @Get()
  findAll(
    @Param('petId') petId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.weightRecordsService.findAll(petId, user.userId);
  }

  /**
   * POST /pets/:petId/weight-records
   * Create a new weight record for a pet.
   */
  @Post()
  create(
    @Param('petId') petId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWeightRecordDto,
  ) {
    return this.weightRecordsService.create(petId, user.userId, dto);
  }

  /**
   * PUT /pets/:petId/weight-records/:id
   * Update an existing weight record.
   */
  @Put(':id')
  update(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateWeightRecordDto,
  ) {
    // petId is available in the route but ownership is verified inside the
    // service via the weightRecord → pet → userId relationship.
    return this.weightRecordsService.update(id, user.userId, dto);
  }

  /**
   * DELETE /pets/:petId/weight-records/:id
   * Delete a weight record.
   */
  @Delete(':id')
  remove(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.weightRecordsService.remove(id, user.userId);
  }
}
