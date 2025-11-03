import { IsString } from 'class-validator';

// For blocking a user
export class BlockUserDto {
    @IsString()
    blockerId: string;

    @IsString()
    blockedId: string;
}

// For unblocking a user
export class UnblockUserDto {
    @IsString()
    blockerId: string;

    @IsString()
    blockedId: string;
}

export class BlockedUserResultDto {
    userIds: string[]; // list of blocked users (or users who blocked you)
}

export class SearchUnblockedUserResultDto {
    userIds: string[]; // list of users that can be blocked
}