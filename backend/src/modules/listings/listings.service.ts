import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
    CreateListingDetails,
    CreateListingResult,
    ListingResponse,
} from './interfaces';

@Injectable()
export class ListingsService {
    constructor(private readonly prisma: PrismaService) {}
    async findActive() {
        return this.prisma.listing.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(input: CreateListingDetails): Promise<CreateListingResult> {
        // if (!input.creatorId) {
        //     throw new BadRequestException('creatorId is required');
        // }

        // Let Prisma/DB apply defaults (status=ACTIVE, viewCount=0, timestamps)
        const created = await this.prisma.listing.create({
            data: {
                // creatorId: input.creatorId,
                title: input.title,
                description: input.description,
                price: input.price,
                location: input.location,
                mediaUrls: input.mediaUrls,
                ...(input.status ? { status: input.status } : {}), // omit to use DB default
            },
        });

        const listing: ListingResponse = {
            id: created.id,
            // creatorId: created.creatorId,
            title: created.title,
            description: created.description,
            price: created.price,
            location: created.location,
            mediaUrls: created.mediaUrls,
            status: created.status as ListingResponse['status'],
            viewCount: created.viewCount,
            createdAt: created.createdAt.toISOString(),
            updatedAt: created.updatedAt.toISOString(),
        };

        return { listing };
    }
}

