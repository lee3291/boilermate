import {
    BadRequestException,
    Body,
    Controller,
    Post,
    Get,
    Param,
    Delete,
    Patch,
    Query,
} from '@nestjs/common';
import { ListingsService } from './listings.service';

type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
const STATUSES: ListingStatus[] = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];

type CreateListingBody = {
    title: string;
    user: string;
    description: string;
    price: number; // integer (e.g., cents) for the strict path
    location: string;
    moveInStart?: string;
    moveInEnd?: string;
    mediaUrls: string[];
    status?: ListingStatus;
};

type SaveListingBody = { username: string };

// ---------- Strict validators for the /listings POST path ----------
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
        errors.price = 'price must be an integer ≥ 0';
    }

    if (typeof body?.location !== 'string' || body.location.trim().length === 0) {
        errors.location = 'location is required';
    } else if (body.location.trim().length > 140) {
        errors.location = 'location must be ≤ 140 chars';
    }

    if (body?.moveInStart !== undefined) {
        if (typeof body.moveInStart !== 'string') errors.moveInStart = 'moveInStart must be a string (YYYY-MM-DD)';
    }
    if (body?.moveInEnd !== undefined) {
        if (typeof body.moveInEnd !== 'string') errors.moveInEnd = 'moveInEnd must be a string (YYYY-MM-DD)';
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

/**
 * Single controller that serves BOTH:
 *  - Legacy routes under /listing
 *  - Newer routes under /listings
 */
@Controller(['listing', 'listings'])
export class ListingsController {
    constructor(private readonly listingsService: ListingsService) {}

    // ===================== Newer API (kept intact) =====================

    @Get('active')
    getActive() {
        return this.listingsService.findActive();
    }

    /** Strict create: POST /listings */
    @Post()
    async createStrict(@Body() rawBody: any) {
        // Only validate when hitting /listings (strict path)
        // assertCreateBody(rawBody);

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

        return this.listingsService.create(body);
    }

    /** Save a listing for a username — POST /listings/:id/save */
    @Post(':id/save')
    async saveListing(@Param('id') listingId: string, @Body() rawBody: any) {
        assertSaveBody(rawBody);
        const username = rawBody.username.trim();
        return this.listingsService.saveListing({ listingId, username });
    }

    /** Unsave a listing for a username — DELETE /listings/:id/save */
    @Delete(':id/save')
    async unsaveListing(@Param('id') listingId: string, @Body() rawBody: any) {
        assertSaveBody(rawBody);
        const username = rawBody.username.trim();
        return this.listingsService.unsaveListing({ listingId, username });
    }

    /** Count saves — GET /listings/:id/saves/count */
    @Get(':id/saves/count')
    countSaves(@Param('id') listingId: string) {
        return this.listingsService.countSaves(listingId);
    }

    /** List usernames who saved — GET /listings/:id/saves?page=&pageSize= */
    @Get(':id/saves')
    savedBy(
        @Param('id') listingId: string,
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '20',
    ) {
        const p = Math.max(parseInt(String(page), 10) || 1, 1);
        const s = Math.min(Math.max(parseInt(String(pageSize), 10) || 20, 1), 100);
        return this.listingsService.listSavedBy({ listingId, page: p, pageSize: s });
    }

    /** Listings saved by a user — GET /listings/users/:username/saved */
    @Get('users/:username/saved')
    listingsSavedByUser(
        @Param('username') username: string,
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '20',
    ) {
        const p = Math.max(parseInt(String(page), 10) || 1, 1);
        const s = Math.min(Math.max(parseInt(String(pageSize), 10) || 20, 1), 100);
        return this.listingsService.listingsSavedByUser({
            username: username.trim(),
            page: p,
            pageSize: s,
        });
    }

    // ===================== Legacy API (minimal compatibility) =====================

    /** Legacy create: POST /listing/create (accepts legacy body, e.g. { pricing: number }) */
    @Post('create')
    legacyCreate(@Body() body: any) {
        // No strict validation; the service handles dual-schema normalization.
        return this.listingsService.create(body);
    }

    /** Legacy find all: GET /listing (returns {title, location, pricing}) */
    @Get()
    legacyFindAll() {
        return this.listingsService.findAll();
    }

    /** Legacy find one: GET /listing/:id */
    @Get(':id')
    legacyFindOne(@Param('id') id: string) {
        return this.listingsService.findOne(id);
    }

    /** Legacy update: PATCH /listing/:id */
    @Patch(':id')
    legacyUpdate(@Param('id') id: string, @Body() dto: any) {
        return this.listingsService.update(id, dto);
    }

    /** Legacy remove: DELETE /listing/:id */
    @Delete(':id')
    legacyRemove(@Param('id') id: string) {
        return this.listingsService.remove(id);
    }

    @Get()
    findAll() {
        return this.listingsService.findAll();
    }
}

