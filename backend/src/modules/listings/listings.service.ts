import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Prisma } from '@prisma/client';
import { MailService } from '../mail/mail.service';

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
  createdAt: string;
  updatedAt: string;
};

const P2002 = 'P2002';
const P2025 = 'P2025';

@Injectable()
export class ListingsService {
  private readonly logger = new Logger(ListingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

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
      viewCount: 0,
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
    // Only return listings whose user (username) is active
    return listings
      .filter((l) => activeUsernames.has(l.user))
      .map((l) => this.toListingResponse(l));
  }

  async create(
    input: CreateListingDetails | LegacyCreateListingDto,
  ): Promise<{ listing: ListingResponse }> {
    const data = this.normalizeCreateInput(input);
    const created = await this.prisma.listing.create({ data });

    // ---- Start of Notification Logic for Followers ----
    // After creating a listing, notify the author's followers.
    // This is wrapped in a try/catch so that a failure in the notification
    // process does not prevent the listing from being created.
    try {
      // 1. Find the author of the listing to get their followers.
      const author = await this.prisma.user.findFirst({
        where: { email: { startsWith: data.user + '@' } },
        select: { id: true, legalName: true },
      });

      if (author) {
        const follows = await this.prisma.follow.findMany({
          where: { followingId: author.id },
          include: {
            follower: {
              select: { email: true },
            },
          },
        });

        if (follows.length > 0) {
          // 2. Collect the email addresses of all followers.
          const followerEmails = follows.map((follow) => follow.follower.email);
          const authorName = author.legalName || data.user;
          const listingUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/listings/${created.id}`;
          const subject = `New Listing from ${authorName}!`;

          // 4. Send the email to all followers.
          followerEmails.forEach((email) => {
            this.mailService.sendTemplatedEmail(
              email,
              subject,
              'new-listing-notification',
              {
                authorName,
                listingTitle: created.title,
                listingUrl,
              },
            );
          });

          this.logger.log(
            `Queued new listing notification for ${followerEmails.length} followers of user ${data.user}.`,
          );
        }
      }
    } catch (error) {
      this.logger.warn(
        `Failed to queue new listing notification for listing ${created.id}: ${error.message}`,
      );
    }
    // ---- End of Notification Logic ----

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
          createdAt: row?.createdAt?.toISOString() ?? new Date().toISOString(),
        };
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
    } catch (err: any) {
      if (err?.code !== P2025) throw err;
    }
    return {
      listingId: args.listingId,
      username: args.username,
      isSaved: false as const,
    };
  }

  async countSaves(listingId: string) {
    const count = await this.prisma.saved.count({ where: { listingId } });
    return { listingId, count };
  }

  async listSavedBy(args: {
    listingId: string;
    page: number;
    pageSize: number;
  }) {
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

  async listingsSavedByUser(args: {
    username: string;
    page: number;
    pageSize: number;
  }) {
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

    // Get all active user emails and extract usernames
    const activeUsers = await this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { email: true },
    });
    const activeUsernames = new Set(
      activeUsers.map((u) => u.email.split('@')[0]),
    );

    const listings: ListingResponse[] = saves
      .map((s) => s.listing)
      .filter((l) => l && l.status === 'ACTIVE' && activeUsernames.has(l.user))
      .map((l) => this.toListingResponse(l));

    return { username, listings, page, pageSize, total };
  }

  async recordView(args: { listingId: string; username?: string }) {
    const { listingId, username } = args;
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    const increment = this.prisma.listing.update({
      where: { id: listingId },
      data: { viewCount: { increment: 1 } },
      select: { id: true, viewCount: true },
    });

    const ops: Prisma.PrismaPromise<any>[] = [increment];

    if (username && username.trim().length > 0) {
      ops.push(
        this.prisma.listingView.upsert({
          where: {
            username_listingId: {
              username: username.trim(),
              listingId,
            },
          },
          update: {},
          create: { username: username.trim(), listingId },
        }),
      );
    }

    const [after] = await this.prisma.$transaction(ops);
    return { listingId: after.id, viewCount: after.viewCount };
  }

  async getViewCounts(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, viewCount: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    const uniqueCount = await this.prisma.listingView.count({
      where: { listingId },
    });
    return { listingId, viewCount: listing.viewCount, uniqueCount };
  }

  async getViewCount(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, viewCount: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return { listingId, count: listing.viewCount };
  }

  async getUniqueViewCount(listingId: string) {
    const exists = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Listing not found');

    const count = await this.prisma.listingView.count({ where: { listingId } });
    return { listingId, count };
  }

  async findOne(listingID: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingID },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return this.toListingResponse(listing);
  }

  async update(listingID: string, dto: Partial<LegacyCreateListingDto>) {
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
