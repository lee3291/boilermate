import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  // GET /announcements
  @Get()
  getAll() {
    return this.service.getAnnouncements();
  }

  // POST /announcements
  @Post()
  create(@Body() dto: CreateAnnouncementDto) {
    return this.service.createAnnouncement(dto);
  }

  // PUT /announcements/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.service.updateAnnouncement(id, dto);
  }

  // DELETE /announcements/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.deleteAnnouncement(id);
  }
}
