import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Prisma } from '@prisma/client';

type LegacyCreateListingDto = {
    title: string;
    user?: string;
    description?: string;
    roommates?: number;
    pricing?: number;
    price?: number;
    location?: string;
    mediaUrls?: string[];
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    moveInStart?: Date | string | null;
    moveInEnd?: Date | string | null;
    moveInDateOutdatedAlert?: boolean;
    reportedOutdatedAlert?: boolean;
};

type CreateListingDetails = {
    title: string;
    user?: string;
    description?: string;
    roommates?: number;
    price?: number;
    location?: string;
    mediaUrls?: string[];
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    moveInStart?: Date | string | null;
    moveInEnd?: Date | string | null;
    moveInDateOutdatedAlert?: boolean;
    reportedOutdatedAlert?: boolean;
};

type ListingResponse = {
    id: string;
    title: string;
    user: string;
    description: string | null;
    price: number | null;
    roommates: number | null;
    pricing: number | null;
    location: string | null;
    mediaUrls: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    viewCount: number;
    moveInStart: string | null;
    moveInEnd: string | null;
    moveInDateOutdatedAlert: boolean;
    reportedOutdatedAlert: boolean;
    createdAt: string;
    updatedAt: string;
};

const P2002 = 'P2002';
const P2025 = 'P2025';

@Injectable()
export class ListingsService {
    constructor(private readonly prisma: PrismaService) {}

    private toYMD(d: Date | null): string | null {
        return d ? d.toISOString().slice(0, 10) : null;
    }

    private toListingResponse(l: any): ListingResponse {
        return {
            id: l.id,
            title: l.title,
            user: l.user,
            description: l.description,
            price: typeof l.price === 'number' ? l.price : null,
            roommates: typeof l.roommates === 'number' ? l.roommates : null,
            pricing: typeof l.pricing === 'number' ? l.pricing : null,
            location: l.location,
            mediaUrls: Array.isArray(l.mediaUrls) ? l.mediaUrls : [],
            status: l.status,
            viewCount: l.viewCount ?? 0,
            moveInStart: this.toYMD(l.moveInStart ?? null),
            moveInEnd: this.toYMD(l.moveInEnd ?? null),
            moveInDateOutdatedAlert: !!l.moveInDateOutdatedAlert,
            reportedOutdatedAlert: !!l.reportedOutdatedAlert,
            createdAt:
                l.createdAt?.toISOString?.() ?? new Date(l.createdAt).toISOString(),
            updatedAt:
                l.updatedAt?.toISOString?.() ?? new Date(l.updatedAt).toISOString(),
        };
    }

    private normalizeCreateInput(
        input: LegacyCreateListingDto | CreateListingDetails,
    ) {
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
            Number.isInteger((input as any).roommates) &&
                (input as any).roommates >= 1
                ? (input as any).roommates
                : undefined;

        return {
            title: (input as any).title,
            user: (input as any).user ?? 'Anonymous',
            description: (input as any).description ?? null,
            price,
            pricing,
            roommates,
            location: (input as any).location ?? null,
            mediaUrls: (input as any).mediaUrls ?? [],
            status: (input as any).status ?? 'ACTIVE',
            moveInStart: parseMaybeDate((input as any).moveInStart) ?? null,
            moveInEnd: parseMaybeDate((input as any).moveInEnd) ?? null,
            moveInDateOutdatedAlert:
                typeof (input as any).moveInDateOutdatedAlert === 'boolean'
                    ? (input as any).moveInDateOutdatedAlert
                    : false,
            reportedOutdatedAlert:
                typeof (input as any).reportedOutdatedAlert === 'boolean'
                    ? (input as any).reportedOutdatedAlert
                    : false,
            viewCount: 0,
            moveInDateOutdatedAlert:
                typeof (input as any).moveInDateOutdatedAlert === 'boolean'
                    ? (input as any).moveInDateOutdatedAlert
                    : false,
            reportedOutdatedAlert:
                typeof (input as any).reportedOutdatedAlert === 'boolean'
                    ? (input as any).reportedOutdatedAlert
                    : false,
        };
    }

    async findActive() {
        // Fallback: join User by Purdue username (before @) if user_reference is null
        const listings = await this.prisma.listing.findMany({
            where: {
                status: 'ACTIVE',
            },
            orderBy: { createdAt: 'desc' },
        });
        // Get all active user emails and extract username
        const activeUsers = await this.prisma.user.findMany({
            where: { status: 'ACTIVE' },
            select: { email: true },
        });
        const activeUsernames = new Set(
            activeUsers.map((u) => u.email.split('@')[0]),
        );
        return listings.filter((l) => activeUsernames.has(l.user));
    }

    async findAll(status?: string) {
        const where: Prisma.ListingWhereInput = {};
        if (status) where.status = status as any;
        const rows = await this.prisma.listing.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((l) => this.toListingResponse(l));
    }

    async findOne(listingID: string) {
        const row = await this.prisma.listing.findUnique({
            where: { id: listingID },
        });
        if (!row) throw new NotFoundException('Listing not found');
        return this.toListingResponse(row);
    }

    async create(
        input: CreateListingDetails | LegacyCreateListingDto,
    ): Promise<{ listing: ListingResponse }> {
        const data = this.normalizeCreateInput(input);
        const created = await this.prisma.listing.create({ data });
        return { listing: this.toListingResponse(created) };
    }

    async saveListing(args: { listingId: string; username: string }) {
        const exists = await this.prisma.listing.findUnique({
            where: { id: args.listingId },
            select: { id: true },
        });
        if (!exists) {
            throw new BadRequestException(`Listing ${args.listingId} does not exist`);
        }

        try {
            const row = await this.prisma.saved.create({
                data: {
                    listingId: args.listingId,
                    username: args.username,
                },
            });
            return {
                listingId: args.listingId,
                username: args.username,
                isSaved: true,
                createdAt: row?.createdAt?.toISOString() ?? new Date().toISOString(),
            };
        } catch (err: any) {
            if (err?.code === P2002) {
                const existing = await this.prisma.saved.findUnique({
                    where: {
                        username_listingId: {
                            username: args.username,
                            listingId: args.listingId,
                        },
                    },
                });
                if (existing) {
                    return {
                        listingId: args.listingId,
                        username: args.username,
                        isSaved: true,
                        createdAt:
                            existing?.createdAt?.toISOString() ??
                            new Date().toISOString(),
                    };
                }
            }
            throw err;
        }
    }

    async unsaveListing(args: { listingId: string; username: string }) {
        try {
            await this.prisma.saved.delete({
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
                isSaved: false,
            };
        } catch (err: any) {
            if (err?.code === P2025) {
                return {
                    listingId: args.listingId,
                    username: args.username,
                    isSaved: false,
                };
            }
            throw err;
        }
    }

    async getSaveCount(listingId: string) {
        const count = await this.prisma.saved.count({ where: { listingId } });
        return { listingId, count };
    }

    async getSavedBy(listingId: string, page = 1, pageSize = 20) {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 1;
        if (pageSize > 100) pageSize = 100;

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

    async getSavedListings(username: string, page = 1, pageSize = 20) {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 1;
        if (pageSize > 100) pageSize = 100;

        const [total, rows] = await this.prisma.$transaction([
            this.prisma.saved.count({ where: { username } }),
            this.prisma.saved.findMany({
                where: { username },
                include: { listing: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);

        return {
            username,
            listings: rows.map((r) => this.toListingResponse(r.listing)),
            page,
            pageSize,
            total,
        };
    }

    async getViewCounts(listingID: string) {
        const views = await this.prisma.listingView.count({
            where: { listingId: listingID },
        });

        const uniqueViews = await this.prisma.listingView.groupBy({
            by: ['username'],
            where: { listingId: listingID },
        });

        return {
            listingId: listingID,
            views,
            uniqueViews: uniqueViews.length,
        };
    }

    async getViewCount(listingID: string) {
        const views = await this.prisma.listingView.count({
            where: { listingId: listingID },
        });

        return {
            listingId: listingID,
            views,
        };
    }

    async getUniqueViewCount(listingID: string) {
        const uniqueViews = await this.prisma.listingView.groupBy({
            by: ['username'],
            where: { listingId: listingID },
        });

        return {
            listingId: listingID,
            uniqueViews: uniqueViews.length,
        };
    }

    async incrementView(listingID: string, username: string | null) {
        const increment = this.prisma.listing.update({
            where: { id: listingID },
            data: { viewCount: { increment: 1 } },
        });

        const viewLog = this.prisma.listingView.create({
            data: {
                listingId: listingID,
                username: username ?? 'anonymous',
            },
        });

        await this.prisma.$transaction([increment, viewLog]);
    }

    async update(
        listingID: string,
        dto: Partial<LegacyCreateListingDto>,
    ) {
        const patch: any = {};
        if ('title' in dto) patch.title = dto.title;
        if ('user' in dto) patch.user = dto.user;
        if ('description' in dto) patch.description = dto.description ?? null;
        if ('location' in dto) patch.location = dto.location ?? null;
        if ('status' in dto) patch.status = dto.status;
        if (typeof dto.price === 'number') patch.price = dto.price;
        if (typeof (dto as any).pricing === 'number')
            patch.pricing = (dto as any).pricing;
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
        if ('moveInDateOutdatedAlert' in dto)
            patch.moveInDateOutdatedAlert = dto.moveInDateOutdatedAlert;
        if ('reportedOutdatedAlert' in dto)
            patch.reportedOutdatedAlert = dto.reportedOutdatedAlert;

        const updated = await this.prisma.listing.update({
            where: { id: listingID },
            data: patch,
        });
        return this.toListingResponse(updated);
    }

    async remove(listingID: string) {
        const deleted = await this.prisma.listing.delete({
            where: { id: listingID },
        });
        return this.toListingResponse(deleted);
    }

    async findByUser(
        username: string,
        include?: ('ACTIVE' | 'INACTIVE' | 'ARCHIVED')[],
    ) {
        const statuses =
            include && include.length
                ? include
                : (['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const);

        const rows = await this.prisma.listing.findMany({
            where: {
                user: username,
                status: { in: statuses as any },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Only select columns that you KNOW exist in the current DB
        const user = await this.prisma.user.findFirst({
            where: { email: { startsWith: username + '@' }, status: 'ACTIVE' },
            select: { id: true }, // or email/status/etc, but NOT legalName
        });

        if (!user) return [];
        return rows.map((l) => this.toListingResponse(l));
    }

    async findAll() {
        // Fallback: join User by Purdue username (before @) if user_reference is null
        const listings = await this.prisma.listing.findMany({
            where: {
                status: 'ACTIVE',
            },
            select: {
                title: true,
                location: true,
                price: true,
                user: true,
            },
        });
        const activeUsers = await this.prisma.user.findMany({
            where: { status: 'ACTIVE' },
            select: { email: true },
        });
        const activeUsernames = new Set(
            activeUsers.map((u) => u.email.split('@')[0]),
        );
        return listings.filter((l) => activeUsernames.has(l.user));
    }
}

