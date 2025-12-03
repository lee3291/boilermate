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

type RoommateApplicationStatus =
    | 'PENDING'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'WITHDRAWN';

const APPLICATION_STATUSES: RoommateApplicationStatus[] = [
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN',
];

type CreateListingBody = {
    title: string;
    user: string;
    description: string;
    roommates: number;
    price: number;
    location: string;
    moveInStart?: string;
    moveInEnd?: string;
    mediaUrls: string[];
    status?: ListingStatus;
    moveInDateOutdatedAlert?: boolean;
    reportedOutdatedAlert?: boolean;
};

type SaveListingBody = { username: string };

type CreateRoommateApplicationBody = {
    applicantId: string; // User.id
    message?: string;
    preferenceSnapshot?: unknown;
};

type UpdateRoommateApplicationStatusBody = {
    status: RoommateApplicationStatus;
};

function assertCreateBody(body: any): asserts body is CreateListingBody {
    const errors: Record<string, string> = {};
    if (typeof body?.title !== 'string' || body.title.trim().length === 0)
        errors.title = 'title is required';
    else if (body.title.trim().length > 120)
        errors.title = 'title must be ≤ 120 chars';
    if (
        typeof body?.roommates !== 'number' ||
            !Number.isInteger(body.roommates) ||
            body.roommates < 1
    )
        errors.roommates = 'roommates must be an integer ≥ 1';
    if (typeof body?.user !== 'string' || body.user.trim().length === 0)
        errors.user = 'user is required';
    else if (body.user.trim().length > 120)
        errors.user = 'user must be ≤ 120 chars';
    if (
        typeof body?.description !== 'string' ||
            body.description.trim().length === 0
    )
        errors.description = 'description is required';
    else if (body.description.trim().length > 10_000)
        errors.description = 'description must be ≤ 10000 chars';
    if (
        typeof body?.price !== 'number' ||
            !Number.isInteger(body.price) ||
            body.price < 0
    )
        errors.price = 'price must be an integer ≥ 0';
    if (
        typeof body?.location !== 'string' ||
            body.location.trim().length === 0
    )
        errors.location = 'location is required';
    else if (body.location.trim().length > 140)
        errors.location = 'location must be ≤ 140 chars';
    if (body?.moveInStart !== undefined) {
        if (typeof body.moveInStart !== 'string')
            errors.moveInStart = 'moveInStart must be a string (YYYY-MM-DD)';
    }
    if (body?.moveInEnd !== undefined) {
        if (typeof body.moveInEnd !== 'string')
            errors.moveInEnd = 'moveInEnd must be a string (YYYY-MM-DD)';
    }
    if (!Array.isArray(body?.mediaUrls))
        errors.mediaUrls = 'mediaUrls must be an array of URL strings';
    else if (body.mediaUrls.length > 20)
        errors.mediaUrls = 'mediaUrls max length is 20';
    if (body?.status !== undefined && !STATUSES.includes(body.status))
        errors.status = `status must be one of ${STATUSES.join(', ')}`;
    if (
        body?.moveInDateOutdatedAlert !== undefined &&
            typeof body.moveInDateOutdatedAlert !== 'boolean'
    )
        errors.moveInDateOutdatedAlert =
            'moveInDateOutdatedAlert must be a boolean';
    if (
        body?.reportedOutdatedAlert !== undefined &&
            typeof body.reportedOutdatedAlert !== 'boolean'
    )
        errors.reportedOutdatedAlert =
            'reportedOutdatedAlert must be a boolean';
    if (Object.keys(errors).length)
        throw new BadRequestException({ message: 'Validation failed', errors });
}

function assertSaveBody(body: any): asserts body is SaveListingBody {
    const errors: Record<string, string> = {};
    if (
        typeof body?.username !== 'string' ||
            body.username.trim().length === 0
    )
        errors.username = 'username is required';
    else if (body.username.trim().length > 120)
        errors.username = 'username must be ≤ 120 chars';
    if (Object.keys(errors).length)
        throw new BadRequestException({ message: 'Validation failed', errors });
}

function assertCreateRoommateApplicationBody(
    body: any,
): asserts body is CreateRoommateApplicationBody {
    const errors: Record<string, string> = {};

    if (typeof body?.applicantId !== 'string' || !body.applicantId.trim()) {
        errors.applicantId = 'applicantId is required';
    }

    if (body?.message !== undefined && typeof body.message !== 'string') {
        errors.message = 'message must be a string';
    }

    if (Object.keys(errors).length) {
        throw new BadRequestException({ message: 'Validation failed', errors });
    }
}

function assertUpdateRoommateApplicationStatusBody(
    body: any,
): asserts body is UpdateRoommateApplicationStatusBody {
    const errors: Record<string, string> = {};

    if (typeof body?.status !== 'string') {
        errors.status = 'status is required';
    } else if (!APPLICATION_STATUSES.includes(body.status as any)) {
        errors.status = `status must be one of ${APPLICATION_STATUSES.join(
            ', ',
        )}`;
    }

    if (Object.keys(errors).length) {
        throw new BadRequestException({ message: 'Validation failed', errors });
    }
}

@Controller(['listing', 'listings'])
export class ListingsController {
    constructor(private readonly listingsService: ListingsService) {}

    @Get('active')
    getActive() {
        return this.listingsService.findActive();
    }

    @Post()
    async createStrict(@Body() rawBody: any) {
        assertCreateBody(rawBody);
        const body: CreateListingBody = {
            title: rawBody.title.trim(),
            user: rawBody.user.trim(),
            description: rawBody.description.trim(),
            price: rawBody.price,
            roommates: rawBody.roommates,
            location: rawBody.location.trim(),
            moveInStart: rawBody.moveInStart?.trim() || undefined,
            moveInEnd: rawBody.moveInEnd?.trim() || undefined,
            mediaUrls: rawBody.mediaUrls,
            status: rawBody.status,
            moveInDateOutdatedAlert: rawBody.moveInDateOutdatedAlert,
            reportedOutdatedAlert: rawBody.reportedOutdatedAlert,
        };
        return this.listingsService.create(body);
    }

    @Post(':id/save')
    async saveListing(@Param('id') listingId: string, @Body() rawBody: any) {
        assertSaveBody(rawBody);
        const username = rawBody.username.trim();
        return this.listingsService.saveListing({ listingId, username });
    }

    @Delete(':id/save')
    async unsaveListing(@Param('id') listingId: string, @Body() rawBody: any) {
        assertSaveBody(rawBody);
        const username = rawBody.username.trim();
        return this.listingsService.unsaveListing({ listingId, username });
    }

    @Get(':id/saves/count')
    countSaves(@Param('id') listingId: string) {
        return this.listingsService.countSaves(listingId);
    }

    @Get(':id/saves')
    savedBy(
        @Param('id') listingId: string,
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '20',
    ) {
        const p = Math.max(parseInt(String(page), 10) || 1, 1);
        const s = Math.min(Math.max(parseInt(String(pageSize), 10) || 20, 1), 100);
        return this.listingsService.listSavedBy({
            listingId,
            page: p,
            pageSize: s,
        });
    }

    @Post(':id/report')
    async reportListing(
        @Param('id') listingId: string,
        @Body() rawBody: any,
    ) {
        assertSaveBody(rawBody);
        const username = rawBody.username.trim();
        return this.listingsService.reportListing({ listingId, username });
    }

    @Delete(':id/report')
    async unreportListing(
        @Param('id') listingId: string,
        @Body() rawBody: any,
    ) {
        assertSaveBody(rawBody);
        const username = rawBody.username.trim();
        return this.listingsService.unreportListing({ listingId, username });
    }

    @Get(':id/report')
    async isReported(
        @Param('id') listingId: string,
        @Query('username') username?: string,
    ) {
        if (!username || typeof username !== 'string' || !username.trim()) {
            throw new BadRequestException('username query param is required');
        }
        return this.listingsService.isReported({
            listingId,
            username: username.trim(),
        });
    }

    @Get(':id/reports/count')
    countReports(@Param('id') listingId: string) {
        return this.listingsService.countReports(listingId);
    }

    @Get(':id/reports')
    reportedBy(
        @Param('id') listingId: string,
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '20',
    ) {
        const p = Math.max(parseInt(String(page), 10) || 1, 1);
        const s = Math.min(Math.max(parseInt(String(pageSize), 10) || 20, 1), 100);
        return this.listingsService.listReportedBy({
            listingId,
            page: p,
            pageSize: s,
        });
    }

    // -------- Roommate Applications (new) --------

    @Post(':id/roommate-applications')
    async createRoommateApplication(
        @Param('id') listingId: string,
        @Body() rawBody: any,
    ) {
        assertCreateRoommateApplicationBody(rawBody);

        const message =
            typeof rawBody.message === 'string' ? rawBody.message.trim() : undefined;

        return this.listingsService.createRoommateApplication({
            listingId,
            applicantId: rawBody.applicantId.trim(),
            message,
            preferenceSnapshot: rawBody.preferenceSnapshot,
        });
    }

    @Get(':id/roommate-applications')
    async listRoommateApplicationsForListing(
        @Param('id') listingId: string,
        @Query('status') status?: string,
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '20',
    ) {
        const p = Math.max(parseInt(String(page), 10) || 1, 1);
        const s = Math.min(Math.max(parseInt(String(pageSize), 10) || 20, 1), 100);

        const normalizedStatus =
            typeof status === 'string' ? status.trim().toUpperCase() : undefined;

        const statusEnum = (APPLICATION_STATUSES as string[]).includes(
            normalizedStatus as any,
        )
            ? (normalizedStatus as RoommateApplicationStatus)
            : undefined;

        return this.listingsService.listRoommateApplicationsByListing({
            listingId,
            status: statusEnum,
            page: p,
            pageSize: s,
        });
    }

    @Patch('roommate-applications/:applicationId/status')
    async updateRoommateApplicationStatus(
        @Param('applicationId') applicationId: string,
        @Body() rawBody: any,
    ) {
        assertUpdateRoommateApplicationStatusBody(rawBody);

        return this.listingsService.updateRoommateApplicationStatus({
            applicationId,
            status: rawBody.status,
        });
    }

    @Post('roommate-applications/:applicationId/withdraw')
    async withdrawRoommateApplication(
        @Param('applicationId') applicationId: string,
    ) {
        return this.listingsService.updateRoommateApplicationStatus({
            applicationId,
            status: 'WITHDRAWN',
        });
    }

    @Get('users/:applicantId/roommate-applications')
    async listRoommateApplicationsByApplicant(
        @Param('applicantId') applicantId: string,
        @Query('status') status?: string,
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '20',
    ) {
        const p = Math.max(parseInt(String(page), 10) || 1, 1);
        const s = Math.min(Math.max(parseInt(String(pageSize), 10) || 20, 1), 100);

        const normalizedStatus =
            typeof status === 'string' ? status.trim().toUpperCase() : undefined;

        const statusEnum = (APPLICATION_STATUSES as string[]).includes(
            normalizedStatus as any,
        )
            ? (normalizedStatus as RoommateApplicationStatus)
            : undefined;

        return this.listingsService.listRoommateApplicationsByApplicant({
            applicantId,
            status: statusEnum,
            page: p,
            pageSize: s,
        });
    }

    // --------------------------------------------

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

    @Get('users/:username/listings')
    getUserListings(
        @Param('username') username: string,
        @Query('include') include?: string,
    ) {
        const parsed = (include ?? '')
            .split(',')
            .map((s) => s.trim().toUpperCase())
            .filter((s): s is ListingStatus =>
                (STATUSES as string[]).includes(s),
            );
        return this.listingsService.findByUser(
            username,
            parsed.length ? parsed : undefined,
        );
    }

    @Post(':id/views')
    recordView(@Param('id') listingId: string, @Body() body: any) {
        const username =
            typeof body?.username === 'string' ? body.username.trim() : undefined;
        return this.listingsService.recordView({ listingId, username });
    }

    @Get(':id/views/counts')
    getViewCounts(@Param('id') listingId: string) {
        return this.listingsService.getViewCounts(listingId);
    }

    @Get(':id/views/count')
    getViewCount(@Param('id') listingId: string) {
        return this.listingsService.getViewCount(listingId);
    }

    @Get(':id/views/unique-count')
    getUniqueViewCount(@Param('id') listingId: string) {
        return this.listingsService.getUniqueViewCount(listingId);
    }

    @Post('create')
    legacyCreate(@Body() body: any) {
        return this.listingsService.create(body);
    }

    @Get()
    findAll() {
        return this.listingsService.findAll();
    }

    @Get(':id')
    legacyFindOne(@Param('id') id: string) {
        return this.listingsService.findOne(id);
    }

    @Patch(':id')
    legacyUpdate(@Param('id') id: string, @Body() dto: any) {
        return this.listingsService.update(id, dto);
    }

    @Delete(':id')
    legacyRemove(@Param('id') id: string) {
        return this.listingsService.remove(id);
    }
}

