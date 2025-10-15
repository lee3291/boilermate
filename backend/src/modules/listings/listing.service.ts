import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient} from '@prisma/client';
import {Listing} from './interfaces/listing.interface';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';

@Injectable()
export class ListingService {
    private prisma = new PrismaClient();

    /**
     * Create a new listing.
     * Backend automatically sets status to ACTIVE and viewCount to 0.
     */
    async create(dto: CreateListingDto): Promise<Listing> {
        // @ts-ignore
        return this.prisma.listing.create({
            data: {
                ...dto,
                status: 'ACTIVE',
                viewCount: 0,  // initialize view count
            },
        });
    }

    /**
     * Get all listings, ordered by creation date descending
     */
    async findAll(): Promise<Listing[]> {
        return this.prisma.listing.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Get a single listing by ID
     */
    async findOne(listingID: string): Promise<Listing> {
        const listing = await this.prisma.listing.findUnique({
            where: { listingID },
        });

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        return listing;
    }
    /**
     * Update a listing by ID
     */
    async update(listingID: string, dto: UpdateListingDto): Promise<Listing> {
        await this.findOne(listingID); // ensure it exists
        return this.prisma.listing.update({
            where: { listingID },
            data: dto,
        });
    }

    /**
     * Remove a listing by ID
     */
    async remove(listingID: string): Promise<Listing> {
        await this.findOne(listingID); // ensure it exists
        return this.prisma.listing.delete({
            where: { listingID },
        });
    }
}
