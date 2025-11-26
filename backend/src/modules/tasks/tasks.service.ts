import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../../core/database/prisma.service';
import { Listing, ListingStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOutdatedListingReminders() {
    this.logger.log(
      'Running scheduled task to find listings for reminder emails...',
    );

    const twentySevenDaysAgo = new Date();
    twentySevenDaysAgo.setDate(twentySevenDaysAgo.getDate() - 27);

    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

    const listingsToRemind = await this.prisma.listing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        updatedAt: {
          lt: twentySevenDaysAgo,
          gte: twentyEightDaysAgo,
        },
      },
      include: {
        user_reference: true,
      },
    });

    this.logger.log(`Found ${listingsToRemind.length} listings to remind.`);

    for (const listing of listingsToRemind) {
      if (listing.user_reference) {
        try {
          await this.mailService.sendReminderToUpdateListingEmail(
            listing.user_reference,
            listing,
          );
          this.logger.log(
            `Reminder email sent to ${listing.user_reference.email} for listing ${listing.id}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send reminder email to ${listing.user_reference.email} for listing ${listing.id}`,
            error,
          );
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'archive_outdated_listings',
  })
  async handleArchivingOutdatedListings() {
    this.logger.log('Running scheduled task to archive outdated listings...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const listingsToArchive = await this.prisma.listing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        updatedAt: {
          lt: thirtyDaysAgo,
        },
      },
      include: {
        user_reference: true,
      },
    });

    if (listingsToArchive.length > 0) {
      const idsToArchive = listingsToArchive.map(
        (listing: Listing) => listing.id,
      );

      await this.prisma.listing.updateMany({
        where: {
          id: {
            in: idsToArchive,
          },
        },
        data: {
          status: ListingStatus.ARCHIVED,
        },
      });

      this.logger.log(`Archived ${idsToArchive.length} outdated listings.`);

      for (const listing of listingsToArchive) {
        if (listing.user_reference) {
          try {
            await this.mailService.sendOutdatedListingEmail(
              listing.user_reference,
              listing,
            );
            this.logger.log(
              `Outdated listing email sent to ${listing.user_reference.email} for listing ${listing.id}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to send outdated listing email to ${listing.user_reference.email} for listing ${listing.id}`,
              error,
            );
          }
        }
      }
    } else {
      this.logger.log('No outdated listings to archive today.');
    }
  }
}
