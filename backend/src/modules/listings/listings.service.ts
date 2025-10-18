import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

type LegacyCreateListingDto = {
    // FIRST SERVICE DTO (loosely typed; we normalize below)
    title: string;
    user?: string;
    description?: string;
    roommates?: number;
    pricing?: number; // legacy float
    price?: number;   // new int
    location?: string;
    mediaUrls?: string[];
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    moveInStart?: Date | string | null;
    moveInEnd?: Date | string | null;
};

type CreateListingDetails = {
    // SECOND SERVICE input
    title: string;
    user?: string;
    description?: string;
    roommates?: number;
    price?: number;   // preferred (int)
    location?: string;
    mediaUrls?: string[];
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    moveInStart?: Date | string | null;
    moveInEnd?: Date | string | null;
};

type ListingResponse = {
    id: string;
    title: string;
    user: string;
    description: string | null;
    // expose BOTH for compatibility (frontends can pick whichever they use)
    price: number | null;
    roommates: number | null;
    pricing: number | null;
    location: string | null;
    mediaUrls: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    viewCount: number;
    moveInStart: string | null; // YYYY-MM-DD or null
    moveInEnd: string | null;   // YYYY-MM-DD or null
    createdAt: string;
    updatedAt: string;
};

// Prisma error codes
const P2002 = 'P2002'; // unique constraint failed
const P2025 = 'P2025'; // record not found

@Injectable()
export class ListingsService {
    constructor(private readonly prisma: PrismaService) {}

    // -------------------------
    // Helpers
    // -------------------------

    private toYMD(d: Date | null): string | null {
        return d ? d.toISOString().slice(0, 10) : null;
    }

    private toListingResponse(l: any): ListingResponse {
        return {
            id: l.id,
            title: l.title,
            user: l.user,
            description: l.description,
            // expose both price & pricing for dual-schema compatibility
            price: typeof l.price === 'number' ? l.price : null,
            roommates: typeof l.roommates === 'number' ? l.roommates : null,
            pricing: typeof l.pricing === 'number' ? l.pricing : null,
            location: l.location,
            mediaUrls: Array.isArray(l.mediaUrls) ? l.mediaUrls : [],
            status: l.status,
            viewCount: l.viewCount ?? 0,
            moveInStart: this.toYMD(l.moveInStart ?? null),
            moveInEnd: this.toYMD(l.moveInEnd ?? null),
            createdAt: l.createdAt?.toISOString?.() ?? new Date(l.createdAt).toISOString(),
            updatedAt: l.updatedAt?.toISOString?.() ?? new Date(l.updatedAt).toISOString(),
        };
    }

    /** Accepts either FIRST-SERVICE dto or SECOND-SERVICE details and normalizes to prisma data. */
    private normalizeCreateInput(
        input: LegacyCreateListingDto | CreateListingDetails,
    ) {
        // Allow either `price` (int) or legacy `pricing` (float).
        // We persist BOTH columns if provided; otherwise set the other to null.
        const price =
            typeof (input as any).price === 'number'
                ? (input as any).price
                : typeof (input as any).pricing === 'number'
                ? Math.round((input as any).pricing)
                : null;

        const pricing =
            typeof (input as any).pricing === 'number'
                ? (input as any).pricing
                : typeof (input as any).price === 'number'
                ? (input as any).price
                : null;

        const parseMaybeDate = (v: any) =>
            v == null ? null : typeof v === 'string' ? new Date(v) : (v as Date);

        const roommates =
            Number.isInteger((input as any).roommates) && (input as any).roommates >= 1
                ? (input as any).roommates
                : undefined;

        return {
            title: (input as any).title,
            user: (input as any).user ?? 'Anonymous',
            description: (input as any).description ?? null,
            price,      // int (nullable)
            pricing,    // float (nullable)
            roommates,
            location: (input as any).location ?? null,
            mediaUrls: (input as any).mediaUrls ?? [],
            status: (input as any).status ?? 'ACTIVE',
            moveInStart: parseMaybeDate((input as any).moveInStart) ?? null,
            moveInEnd: parseMaybeDate((input as any).moveInEnd) ?? null,
            // Backend-controlled defaults for legacy behavior:
            viewCount: 0,
        };
    }

    // =========================================================
    // "SECOND SERVICE" API (kept intact)
    // =========================================================

    async findActive() {
        const rows = await this.prisma.listing.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((l) => this.toListingResponse(l));
    }

    /** Compatible create: accepts either style of input */
    async create(
        input: CreateListingDetails | LegacyCreateListingDto,
    ): Promise<{ listing: ListingResponse }> {
        const data = this.normalizeCreateInput(input);

        const created = await this.prisma.listing.create({ data });
        return { listing: this.toListingResponse(created) };
    }

    /** Save a listing for a username. Idempotent. */
    async saveListing(args: {
        listingId: string;
        username: string;
    }): Promise<{
        listingId: string;
        username: string;
        isSaved: boolean;
        createdAt: string;
    }> {
        const exists = await this.prisma.listing.findUnique({
            where: { id: args.listingId },
            select: { id: true },
        });
        if (!exists) {
            throw new BadRequestException(`Listing ${args.listingId} does not exist`);
        }

        try {
            const row = await this.prisma.saved.create({
                data: { listingId: args.listingId, username: args.username },
            });

            return {
                listingId: row.listingId,
                username: row.username,
                isSaved: true,
                createdAt: row.createdAt.toISOString(),
            };
        } catch (err: any) {
            if (err?.code === P2002) {
                const row = await this.prisma.saved.findUnique({
                    where: {
                        username_listingId: {
                            username: args.username,
                            listingId: args.listingId,
                        },
                    },
                });
                return {
                    listingId: args.listingId,
                    username: args.username,
                    isSaved: true,
                    createdAt:
                        row?.createdAt?.toISOString() ?? new Date().toISOString(),
                };
            }
            throw err;
        }
    }

    /** Unsave a listing for a username. Idempotent. */
    async unsaveListing(args: {
        listingId: string;
        username: string;
    }): Promise<{ listingId: string; username: string; isSaved: false }> {
        try {
            await this.prisma.saved.delete({
                where: {
                    username_listingId: {
                        username: args.username,
                        listingId: args.listingId,
                    },
                },
            });
        } catch (err: any) {
            if (err?.code !== P2025) throw err; // ignore not found
        }
        return { listingId: args.listingId, username: args.username, isSaved: false };
    }

    /** Count total saves for a listing */
    async countSaves(listingId: string): Promise<{ listingId: string; count: number }> {
        const count = await this.prisma.saved.count({ where: { listingId } });
        return { listingId, count };
    }

    /** List usernames who saved a listing (paginated) */
    async listSavedBy(args: {
        listingId: string;
        page: number;
        pageSize: number;
    }): Promise<{ listingId: string; usernames: string[]; page: number; pageSize: number; total: number }> {
        const { listingId, page, pageSize } = args;
        const [total, rows] = await this.prisma.$transaction([
            this.prisma.saved.count({ where: { listingId } }),
            this.prisma.saved.findMany({
                where: { listingId },
                select: { username: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);

        return {
            listingId,
            usernames: rows.map((r) => r.username),
            page,
            pageSize,
            total,
        };
    }

    /** List full listings saved by a username (paginated) */
    async listingsSavedByUser(args: {
        username: string;
        page: number;
        pageSize: number;
    }): Promise<{
        username: string;
        listings: ListingResponse[];
        page: number;
        pageSize: number;
        total: number;
    }> {
        const { username, page, pageSize } = args;
        const [total, saves] = await this.prisma.$transaction([
            this.prisma.saved.count({ where: { username } }),
            this.prisma.saved.findMany({
                where: { username },
                include: { listing: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);

        const listings: ListingResponse[] = saves
            .map((s) => s.listing)
            .filter(Boolean)
            .map((l) => this.toListingResponse(l));

        return { username, listings, page, pageSize, total };
    }


    /** Legacy: findOne by "listingID" (maps to `id`) */
    async findOne(listingID: string): Promise<ListingResponse> {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingID },
        });
        if (!listing) throw new NotFoundException('Listing not found');
        return this.toListingResponse(listing);
    }

    /** Legacy: update by "listingID" (maps to `id`) */
    async update(
        listingID: string,
        dto: Partial<LegacyCreateListingDto>,
    ): Promise<ListingResponse> {
        // normalize partial updates; only map known fields
        const patch: any = {};
        if ('title' in dto) patch.title = dto.title;
        if ('user' in dto) patch.user = dto.user;
        if ('description' in dto) patch.description = dto.description ?? null;
        if ('location' in dto) patch.location = dto.location ?? null;
        if ('status' in dto) patch.status = dto.status;

        // keep dual column semantics
        if (typeof dto.price === 'number') {
            patch.price = dto.price;
            // keep pricing in sync if you'd like (optional, minimal approach: only set provided)
        }
        if (typeof (dto as any).pricing === 'number') {
            patch.pricing = (dto as any).pricing;
        }

        if ('mediaUrls' in dto) patch.mediaUrls = dto.mediaUrls ?? [];
        if ('moveInStart' in dto)
            patch.moveInStart =
                dto.moveInStart == null
                    ? null
                    : typeof dto.moveInStart === 'string'
                    ? new Date(dto.moveInStart)
                    : (dto.moveInStart as Date);
        if ('moveInEnd' in dto)
            patch.moveInEnd =
                dto.moveInEnd == null
                    ? null
                    : typeof dto.moveInEnd === 'string'
                    ? new Date(dto.moveInEnd)
                    : (dto.moveInEnd as Date);

        const updated = await this.prisma.listing.update({
            where: { id: listingID },
            data: patch,
        });
        return this.toListingResponse(updated);
    }

    /** Legacy: remove by "listingID" (maps to `id`) */
    async remove(listingID: string): Promise<ListingResponse> {
        const deleted = await this.prisma.listing.delete({
            where: { id: listingID },
        });
        return this.toListingResponse(deleted);
    }
     /**
     * Get all listings
     */
    async findAll() {
        //Extract 3 attributes to show in the gg map
        const listings = await this.prisma.listing.findMany({
            select: {
                title: true,
                location: true,
                price: true,
            },
        });
        return listings;
    }
}

