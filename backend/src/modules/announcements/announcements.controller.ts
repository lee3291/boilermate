import { Controller, Get, Post, Put, Delete, Body, Param , UseGuards} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto';
import { AdminGuard } from '@common/guards/admin.guard';
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  // GET /announcements
  @Get()
  getAll() {
    return this.service.getAnnouncements();
  }

  // POST /announcements
  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateAnnouncementDto) {
    return this.service.createAnnouncement(dto);
  }

  // PUT /announcements/:id
  @UseGuards(AdminGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.service.updateAnnouncement(id, dto);
  }

  // DELETE /announcements/:id
  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.deleteAnnouncement(id);
  }
}
