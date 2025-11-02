import { IsUUID, IsBoolean } from 'class-validator';

export class MessageApprovalDto {
    @IsUUID()
    userId: string;
}
