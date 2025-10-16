import { BadRequestException, Body, Controller, Post, Req, Get } from '@nestjs/common';
import { ListingsService } from './listings.service';
import {
    CreateListingBody,
    CreateListingDetails,
    CreateListingResult,
    ListingStatus,
} from './interfaces';

const STATUSES: ListingStatus[] = ['ACTIVE', 'ARCHIVED', 'RESOLVED'];

function assertCreateBody(body: any): asserts body is CreateListingBody {
    const errors: Record<string, string> = {};

    if (typeof body?.title !== 'string' || body.title.trim().length === 0) {
        errors.title = 'title is required';
    } else if (body.title.trim().length > 120) {
        errors.title = 'title must be ≤ 120 chars';
    }

    if (typeof body?.user !== 'string' || body.user.trim().length === 0) {
        errors.user = 'user is required';
    } else if (body.user.trim().length > 120) {
        errors.user = 'user must be ≤ 120 chars';
    }

    if (typeof body?.description !== 'string' || body.description.trim().length === 0) {
        errors.description = 'description is required';
    } else if (body.description.trim().length > 10_000) {
        errors.description = 'description must be ≤ 10000 chars';
    }

    if (typeof body?.price !== 'number' || !Number.isInteger(body.price) || body.price < 0) {
        errors.price = 'price must be an integer ≥ 0 (in cents)';
    }

    if (typeof body?.location !== 'string' || body.location.trim().length === 0) {
        errors.location = 'location is required';
    } else if (body.location.trim().length > 140) {
        errors.location = 'location must be ≤ 140 chars';
    }

    if (!Array.isArray(body?.mediaUrls)) {
        errors.mediaUrls = 'mediaUrls must be an array of URL strings';
    } else if (body.mediaUrls.length > 20) {
        errors.mediaUrls = 'mediaUrls max length is 20';
    }

    if (body?.status !== undefined && !STATUSES.includes(body.status)) {
        errors.status = `status must be one of ${STATUSES.join(', ')}`;
    }

    if (Object.keys(errors).length) {
        throw new BadRequestException({ message: 'Validation failed', errors });
    }
}

@Controller('listings')
export class ListingsController {
    constructor(private readonly listingsService: ListingsService) {}

    @Get('active')
    getActive() {
        return this.listingsService.findActive();
    }

    @Post()
    async create(
        @Body() rawBody: any,
        // @Req() req: any,
    ): Promise<CreateListingResult> {
        // 1) validate minimal fields
        assertCreateBody(rawBody);

        // 2) normalize and inject auth (creatorId)
        const body: CreateListingBody = {
            title: rawBody.title.trim(),
            user: rawBody.user.trim(),
            description: rawBody.description.trim(),
            price: rawBody.price,
            location: rawBody.location.trim(),
            mediaUrls: rawBody.mediaUrls,
            status: rawBody.status, // optional (DB defaults to ACTIVE)
        };

        const input: CreateListingDetails = {
            ...body,
        //     creatorId: req.user?.id, // ensure your auth guard sets req.user
        };

        // if (!input.creatorId) {
        //     throw new BadRequestException('creatorId missing from auth context');
        // }

        // 3) delegate to service
        return this.listingsService.create(input);
    }
}

