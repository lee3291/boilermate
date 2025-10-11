import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';

@Controller('listings')
export class ListingController {
    constructor(private readonly listingService: ListingService) {}

    @Post()
    create(@Body() dto: CreateListingDto) {
        return this.listingService.create(dto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.listingService.findOne(id);
    }
    // findAll() can be use to see every listings in dashboard
    @Get()
    findAll() {
        return this.listingService.findAll();
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
        return this.listingService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.listingService.remove(id);
    }
}
