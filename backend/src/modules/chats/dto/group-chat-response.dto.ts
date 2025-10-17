import { plainToInstance, Exclude, Expose } from 'class-transformer';
import { UserDetails } from '../interfaces/group-chat.interface';

@Exclude()
export class UserDto { // this should be fetched from the user instead bruhhh
  @Expose()
  id: string;


  static fromInterface(user: UserDetails): UserDto {
    return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
  }
}


//TODO: THIS IS TECHNICALLY CHAT RESPONSE SO MAY NEED TO GROUP TOGETHER ???
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

/**
 * Response DTO for user search queries
 * Used for both creating groups and adding members
 */
@Exclude()
export class SearchUserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  // TODO: Add username, firstName, lastName when available

  static fromUser(user: any): SearchUserDto {
    return plainToInstance(SearchUserDto, user, { 
      excludeExtraneousValues: true 
    });
  }

  static fromUsers(users: any[]): SearchUserDto[] {
    return users.map(user => this.fromUser(user));
  }
}

@Exclude()
export class SearchUsersResponseDto {
  @Expose()
  users: SearchUserDto[];

  static fromResult(result: { users: any[] }): SearchUsersResponseDto {
    const dto = new SearchUsersResponseDto();
    dto.users = SearchUserDto.fromUsers(result.users);
    return dto;
  }
}
