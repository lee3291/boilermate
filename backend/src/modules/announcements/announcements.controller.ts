import {
Controller,
Get,
Post,
Body,
Param,
Put,
Delete,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';



@Controller('announcements')
export class AnnouncementsController {
announcementsService: any;
constructor(private readonly service: AnnouncementsService) {}


@Get()
getAll() {
return this.service.findAll();
}


@Post()
create(@Body() dto: CreateAnnouncementDto) {
return this.service.create(dto);
}


@Put(':id')
update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
return this.service.update(id, dto);
}


@Delete(':id')
delete(@Param('id') id: string) {
return this.service.delete(id);
}


@Post(':id/like')
like(@Param('id') id: string) {
return this.service.like(id);
}

@Post('email/top-liked')
async sendTopLiked() {
  return this.service.sendTopLikedToAllUsers();
}



}
