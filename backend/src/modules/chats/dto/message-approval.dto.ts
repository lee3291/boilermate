import { IsUUID} from 'class-validator';

export class MessageApprovalDto {
    @IsUUID()
    userId: string;
}