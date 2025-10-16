import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
    CreateListingDetails,
    CreateListingResult,
    ListingResponse,
    SaveListingResult,
    UnsaveListingResult,
    SaveCountResult,
    SavedByResult,
    SavedListingsResult,
} from './interfaces';

// Prisma error codes
const P2002 = 'P2002'; // unique constraint failed
const P2025 = 'P2025'; // record not found

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
        const created = await this.prisma.listing.create({
            data: {
                title: input.title,
                user: input.user,
                description: input.description,
                price: input.price,
                location: input.location,
                mediaUrls: input.mediaUrls,
                moveInStart: input.moveInStart ?? null,
                moveInEnd: input.moveInEnd ?? null,
                ...(input.status ? { status: input.status } : {}),
            },
        });

        const toYMD = (d: Date | null): string | null =>
            d ? d.toISOString().slice(0, 10) : null;

        const listing: ListingResponse = {
            id: created.id,
            title: created.title,
            user: created.user,
            description: created.description,
            price: created.price,
            location: created.location,
            moveInStart: toYMD(created.moveInStart),
            moveInEnd: toYMD(created.moveInEnd),
            mediaUrls: created.mediaUrls,
            status: created.status as ListingResponse['status'],
            viewCount: created.viewCount,
            createdAt: created.createdAt.toISOString(),
            updatedAt: created.updatedAt.toISOString(),
        };

        return { listing };
    }

    // ====================== SAVES ======================

    /** Save a listing for a username. Idempotent. */
    async saveListing(args: {
        listingId: string;
        username: string;
    }): Promise<SaveListingResult> {
        // Make sure listing exists to provide a clean 400
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
                // Already saved; return current state
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
                    createdAt: row?.createdAt?.toISOString() ?? new Date().toISOString(),
                };
            }
            throw err;
        }
    }

    /** Unsave a listing for a username. Idempotent. */
    async unsaveListing(args: {
        listingId: string;
        username: string;
    }): Promise<UnsaveListingResult> {
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
            // Treat "not found" as success for idempotency
            if (err?.code !== P2025) throw err;
        }
        return {
            listingId: args.listingId,
            username: args.username,
            isSaved: false,
        };
    }

    /** Count total saves for a listing */
    async countSaves(listingId: string): Promise<SaveCountResult> {
        const count = await this.prisma.saved.count({ where: { listingId } });
        return { listingId, count };
    }

    /** List usernames who saved a listing (paginated) */
    async listSavedBy(args: {
        listingId: string;
        page: number;
        pageSize: number;
    }): Promise<SavedByResult> {
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
    }): Promise<SavedListingsResult> {
        const { username, page, pageSize } = args;

        // Join through Saved to preserve "most recent save" ordering
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

        const toYMD = (d: Date | null): string | null =>
            d ? d.toISOString().slice(0, 10) : null;

        const listings: ListingResponse[] = saves
            .map((s) => s.listing)
            .filter(Boolean)
            .map((l) => ({
                id: l.id,
                title: l.title,
                user: l.user,
                description: l.description,
                price: l.price,
                location: l.location,
                mediaUrls: l.mediaUrls,
                status: l.status as ListingResponse['status'],
                viewCount: l.viewCount,
                moveInStart: toYMD(l.moveInStart),
                moveInEnd: toYMD(l.moveInEnd),
                createdAt: l.createdAt.toISOString(),
                updatedAt: l.updatedAt.toISOString(),
            }));

        return {
            username,
            listings,
            page,
            pageSize,
            total,
        };
    }
}

