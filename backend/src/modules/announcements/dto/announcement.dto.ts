export class CreateAnnouncementDto {
title: string;
message: string;
scheduledAt?: string;
isScheduled?: boolean;
}


export class UpdateAnnouncementDto {
title?: string;
message?: string;
scheduledAt?: string;
isScheduled?: boolean;
isActive?: boolean;
}
