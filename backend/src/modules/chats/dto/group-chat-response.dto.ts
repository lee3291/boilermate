import { plainToInstance, Exclude, Expose, Type } from 'class-transformer';
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

  // Embed polls inside group chat
  @Expose()
  @Type(() => PollInGroupDto)
  polls: PollInGroupDto[] = [];

  static fromGroupChat(groupChat: any): GroupChatResponseDto {
    const polls = groupChat.polls?.map((p: any) => PollInGroupDto.fromPoll(p)) || [];
    return plainToInstance(GroupChatResponseDto, { ...groupChat, polls }, { excludeExtraneousValues: true });
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
    return plainToInstance(InvitationResponseDto, invitation, { excludeExtraneousValues: true });
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
    return plainToInstance(SearchUserDto, user, { excludeExtraneousValues: true });
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

// Poll option inside group chat
@Exclude()
export class PollOptionDto {
  @Expose()
  id: string;

  @Expose()
  text: string;

  @Expose()
  votes: number;

  static fromOption(option: any): PollOptionDto {
    return plainToInstance(PollOptionDto, option, { excludeExtraneousValues: true });
  }
}

// Poll inside group chat
@Exclude()
export class PollInGroupDto {
  @Expose()
  id: string;

  @Expose()
  question: string;

  //@Expose()
  //createdAt: Date;

  @Expose()
  @Type(() => PollOptionDto)
  options: PollOptionDto[];

  static fromPoll(poll: any): PollInGroupDto {
    const options = poll.options?.map((opt: any) => PollOptionDto.fromOption(opt)) || [];
    return plainToInstance(PollInGroupDto, { ...poll, options }, { excludeExtraneousValues: true });
  }
}
