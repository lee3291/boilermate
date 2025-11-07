import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto';


@Controller('announcements')
export class AnnouncementsController {
 constructor(private readonly service: AnnouncementsService) {}


 @Get()
 async getAll() {
   return this.service.getAnnouncements();
 }


 @Post()
 async create(@Body() dto: CreateAnnouncementDto) {
   return this.service.createAnnouncement(dto);
 }


 @Put(':id')
 async update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
   return this.service.updateAnnouncement(id, dto);
 }


 @Delete(':id')
 async delete(@Param('id') id: string) {
   return this.service.deleteAnnouncement(id);
 }
}
