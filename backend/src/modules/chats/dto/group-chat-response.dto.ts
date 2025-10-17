import { plainToInstance, Exclude, Expose } from 'class-transformer';

@Exclude()
export class GroupChatResponseDto {
  @Expose()
  id: string;

  @Expose()
  isGroup: boolean;

  @Expose()
  name: string;

  @Expose()
  groupIcon: string | null;

  @Expose()
  creatorId: string;

  @Expose()
  latestMessageAt: Date;

  static fromGroupChat(groupChat: any): GroupChatResponseDto {
    return plainToInstance(GroupChatResponseDto, groupChat, { 
      excludeExtraneousValues: true 
    });
  }
}

@Exclude()
export class InvitationResponseDto {
  @Expose()
  id: string;

  @Expose()
  chatId: string;

  @Expose()
  userId: string;

  @Expose()
  status: string;

  @Expose()
  chat: any; // Can include chat details if needed

  static fromInvitation(invitation: any): InvitationResponseDto {
    return plainToInstance(InvitationResponseDto, invitation, { 
      excludeExtraneousValues: true 
    });
  }

  static fromInvitations(invitations: any[]): InvitationResponseDto[] {
    return invitations.map(inv => this.fromInvitation(inv));
  }
}
