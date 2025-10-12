import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';

@Controller('listing')
export class ListingController {
    constructor(private readonly listingService: ListingService) {}
    // Update to database
    @Post('create')
    create(@Body() dto: CreateListingDto) {
        return this.listingService.create(dto);
    }
    // Find listing by id
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.listingService.findOne(id);
    }
    // Find all can be use to see every listings in dashboard
    @Get()
    findAll() {
        return this.listingService.findAll();
    }
    // Update information based on listing id
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
        return this.listingService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.listingService.remove(id);
    }
}
