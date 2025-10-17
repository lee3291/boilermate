import {
    BadRequestException,
    Body,
    Controller,
    Post,
    Get,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import {
    CreateListingBody,
    CreateListingDetails,
    CreateListingResult,
    ListingStatus,
    SaveListingBody,
    SaveListingResult,
    UnsaveListingResult,
    SaveCountResult,
    SavedByResult,
    SavedListingsResult,
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

    if (typeof body?.moveInStart !== 'string' || body.moveInStart.trim().length === 0) {
        errors.moveInStart = 'moveInStart is required';
    } else if (body.moveInStart.trim().length > 140) {
        errors.moveInStart = 'moveInStart must be ≤ 140 chars';
    }

    if (typeof body?.moveInEnd !== 'string' || body.moveInEnd.trim().length === 0) {
        errors.moveInEnd = 'moveInEnd is required';
    } else if (body.moveInEnd.trim().length > 140) {
        errors.moveInEnd = 'moveInEnd must be ≤ 140 chars';
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

function assertSaveBody(body: any): asserts body is SaveListingBody {
    const errors: Record<string, string> = {};
    if (typeof body?.username !== 'string' || body.username.trim().length === 0) {
        errors.username = 'username is required';
    } else if (body.username.trim().length > 120) {
        errors.username = 'username must be ≤ 120 chars';
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
    async create(@Body() rawBody: any): Promise<CreateListingResult> {
        // 1) validate minimal fields
        assertCreateBody(rawBody);

        // 2) normalize (inject auth here if needed)
        const body: CreateListingBody = {
            title: rawBody.title.trim(),
            user: rawBody.user.trim(),
            description: rawBody.description.trim(),
            price: rawBody.price,
            location: rawBody.location.trim(),
            moveInStart: rawBody.moveInStart?.trim() || undefined,
            moveInEnd: rawBody.moveInEnd?.trim() || undefined,
            mediaUrls: rawBody.mediaUrls,
            status: rawBody.status,
        };

        const input: CreateListingDetails = { ...body };

        // 3) delegate to service
        return this.listingsService.create(input);
    }

    // ====== SAVES API ======

    /** Save a listing for a username — POST /listings/:id/save */
    @Post(':id/save')
    async saveListing(
        @Param('id') listingId: string,
        @Body() rawBody: any,
    ): Promise<SaveListingResult> {
        assertSaveBody(rawBody);
        const username = rawBody.username.trim();
        return this.listingsService.saveListing({ listingId, username });
    }

    /** Unsave a listing for a username — DELETE /listings/:id/save */
    @Delete(':id/save')
    async unsaveListing(
        @Param('id') listingId: string,
        @Body() rawBody: any,
    ): Promise<UnsaveListingResult> {
        assertSaveBody(rawBody);
        const username = rawBody.username.trim();
        return this.listingsService.unsaveListing({ listingId, username });
    }

    /** Count saves for a listing — GET /listings/:id/saves/count */
    @Get(':id/saves/count')
    async countSaves(@Param('id') listingId: string): Promise<SaveCountResult> {
        return this.listingsService.countSaves(listingId);
    }

    /** List usernames who saved a listing — GET /listings/:id/saves?page=&pageSize= */
    @Get(':id/saves')
    async savedBy(
        @Param('id') listingId: string,
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '20',
    ): Promise<SavedByResult> {
        const p = Math.max(parseInt(String(page), 10) || 1, 1);
        const s = Math.min(Math.max(parseInt(String(pageSize), 10) || 20, 1), 100);
        return this.listingsService.listSavedBy({ listingId, page: p, pageSize: s });
    }

    /** Listings saved by a user — GET /listings/users/:username/saved?page=&pageSize= */
    @Get('users/:username/saved')
    async listingsSavedByUser(
        @Param('username') username: string,
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '20',
    ): Promise<SavedListingsResult> {
        const p = Math.max(parseInt(String(page), 10) || 1, 1);
        const s = Math.min(Math.max(parseInt(String(pageSize), 10) || 20, 1), 100);
        return this.listingsService.listingsSavedByUser({
            username: username.trim(),
            page: p,
            pageSize: s,
        });
    }
}

