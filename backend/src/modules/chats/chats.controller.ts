import { Body, Controller, Delete, Get, Param, Post, Put, HttpCode, Logger, Query } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { GroupChatsService } from './group-chats.service';
import {
  SendMessageDto,
  EditMessageDto,
  DeleteMessageDto,
  GetHistoryDto,
  sendMessageResponseDto,
  getHistoryResponseDto,
  GetChatsDto,
  getChatsResponseDto,
  CreateGroupChatDto,
  GetInvitationsDto,
  AcceptInvitationDto,
  DeclineInvitationDto,
  InviteParticipantDto,
  RemoveParticipantDto,
  LeaveGroupChatDto,
  DeleteGroupChatDto,
  GroupChatResponseDto,
  InvitationResponseDto,
  SearchUsersResponseDto,
  MessageApprovalDto,
  PollInGroupDto,
  PollOptionDto,
} from './dto';
import { BlockUserDto,
  UnblockUserDto,
  BlockedUserResultDto,
  SearchUnblockedUserResultDto } from './dto/block.dto';

/**
 * Chat endpoints
 */
@Controller('chats')
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly groupChatsService: GroupChatsService
  ) {}

  @Get()
  @HttpCode(200)
  async getChats(@Query() dto: GetChatsDto) {
    //TODO: HAVE TO MODIFY THIS FUNCTION TO ACCOUNT FOR GROUP CHAT
    const result = await this.chatsService.getChats(dto as any);
    return getChatsResponseDto.fromChats(result.chats);
  }

  // Send message - either to existing chat or by recipientId
  @Post('messages')
  @HttpCode(201)
  async sendMessage(@Body() dto: SendMessageDto) {
    // temporary flow: senderId must be provided in the body
    // service expects the payload object that includes senderId
    const result = await this.chatsService.sendMessage(dto as any);
    return sendMessageResponseDto.fromResult(result.message, result.chat, result.chatCreated);
  }

  // Get chat history for a chat id
  @Get(':chatId/messages')
  @HttpCode(200)
  async getHistory(@Param('chatId') chatId: string, @Query() dto: GetHistoryDto) {
    const result = await this.chatsService.getHistory(chatId, dto as any);
    return getHistoryResponseDto.fromHistory(result.messages)
  }

  // Edit message
  @Put('messages/:messageId')
  @HttpCode(204)
  async editMessage(@Param('messageId') messageId: string, @Body() dto: EditMessageDto) {
    await this.chatsService.editMessage(messageId, dto);
  }

  // Delete message (for you or everyone)
  @Delete('messages/:messageId')
  @HttpCode(204)
  async deleteMessage(@Param('messageId') messageId: string, @Query() dto: DeleteMessageDto) {
    await this.chatsService.deleteMessage(messageId, dto);
  }

  //! Group Chat Specific functionality under here
  
  /**
   * Create a new group chat
   */
  @Post('groups')
  @HttpCode(201)
  async createGroupChat(@Body() dto: CreateGroupChatDto) {
    const result = await this.groupChatsService.createGroupChat(dto as any);
    return GroupChatResponseDto.fromGroupChat(result.groupChat);
  }

  /**
   * Create a 1-1 chat
   */
  @Post('normal-chat')
  @HttpCode(201)
  async createNormalChat(@Body() dto: CreateGroupChatDto) {
    const result = await this.chatsService.createNormalChat(dto as any);
    return GroupChatResponseDto.fromGroupChat(result.groupChat);
  }

  /**
   * Get all pending invitations for the user
   */
  @Get('invitations')
  @HttpCode(200)
  async getInvitations(@Query() dto: GetInvitationsDto) {
    const result = await this.groupChatsService.getInvitations(dto as any);
    return InvitationResponseDto.fromInvitations(result.invitations);
  }

  /**
   * Accept a pending invitation
   */
  @Post('invitations/:invitationId/accept')
  @HttpCode(204)
  async acceptInvitation(
    @Param('invitationId') invitationId: string,
    @Body() dto: AcceptInvitationDto
  ) {
    await this.groupChatsService.acceptInvitation(invitationId, dto as any);
  }

  /**
   * Decline a pending invitation
   */
  @Post('invitations/:invitationId/decline')
  @HttpCode(204)
  async declineInvitation(
    @Param('invitationId') invitationId: string,
    @Body() dto: DeclineInvitationDto
  ) {
    await this.groupChatsService.declineInvitation(invitationId, dto as any);
  }

  /**
   * Check if it is 1-1 or group chat
   */
  @Get(':chatId/type')
  @HttpCode(201)
  async getChatType(@Param('chatId') chatId: string) {
    return this.chatsService.checkChatType(chatId);
  }

  /**
   * Check if the 1-1 chat already exist given senderId and recipentId
   */
  @Get('check-normal-chat')
  @HttpCode(201)
  async checkExistingNormalChat(@Query('userId') userId: string, @Query('receiverId') receiverId: string,
  ) {
    return this.chatsService.findExistingNormalChat(userId, receiverId);
  }

  /**
   * Invite a new user to an existing group (admin only)
   */
  @Post(':chatId/participants')
  @HttpCode(204)
  async inviteParticipant(
    @Param('chatId') chatId: string,
    @Body() dto: InviteParticipantDto
  ) {
    await this.groupChatsService.inviteParticipant(chatId, dto as any);
  }

  /**
   * Remove/kick a user from a group (admin only)
   */
  @Delete(':chatId/participants/:userId')
  @HttpCode(204)
  async removeParticipant(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
    @Body() dto: RemoveParticipantDto
  ) {
    await this.groupChatsService.removeParticipant(chatId, userId, dto as any);
  }

  /**
   * Leave a group chat (any member can leave)
   * If the leaving user is the creator, ownership transfers to the first remaining member
   */
  @Post(':chatId/leave')
  @HttpCode(204)
  async leaveGroupChat(
    @Param('chatId') chatId: string,
    @Body() dto: LeaveGroupChatDto
  ) {
    await this.groupChatsService.leaveGroupChat(chatId, dto as any);
  }

  /**
   * Delete the entire group chat (creator only)
   */
  @Delete(':chatId')
  @HttpCode(204)
  async deleteGroupChat(
    @Param('chatId') chatId: string,
    @Body() dto: DeleteGroupChatDto
  ) {
    await this.groupChatsService.deleteGroupChat(chatId, dto as any);
  }

  /**
   * Search users for creating a 1-1 chat
   * Query param: searchQuery (search query string for email)
   */
  @Get('users/search-normal-chat')
  @HttpCode(200)
  async searchUsersForNormalChatCreation(@Query('creatorId') creatorId: string, @Query('searchQuery') searchQuery: string) {
    const result = await this.chatsService.searchUsersForNormalChatCreation(creatorId, searchQuery);
    return SearchUsersResponseDto.fromResult(result);
  }
  /**
   * Search users for creating a new group chat
   * Query param: searchQuery (search query string for email)
   */
  @Get('users/search')
  @HttpCode(200)
  async searchUsersForGroupCreation(@Query('creatorId') creatorId: string, @Query('searchQuery') searchQuery: string) {
    const result = await this.groupChatsService.searchUsersForGroupCreation(creatorId, searchQuery);
    return SearchUsersResponseDto.fromResult(result);
  }

  /**
   * Search users to add to an existing group chat
   * Excludes users already in the group
   * Query param: searchQuery (search query string for email)
   */
  @Get(':chatId/users/search')
  @HttpCode(200)
  async searchUsersForAddingToGroup(
      @Param('chatId') chatId: string,
      @Query('creatorId') creatorId: string,
    @Query('searchQuery') searchQuery: string
  ) {
    const result = await this.groupChatsService.searchUsersForAddingToGroup(chatId, creatorId, searchQuery);
    return SearchUsersResponseDto.fromResult(result);
  }

  /*
   * Approve msgs
   */
  @Post('messages/:messageId/approve')
  @HttpCode(200)
  async approveMessage(
      @Param('messageId') messageId: string,
      @Body() dto: MessageApprovalDto
  ) {
    return this.chatsService.approveMessage(messageId, dto.userId);
  }
  /*
   * Get row msg approval
   */
  @Get('messages/:messageId/approve-status')
  @HttpCode(200)
  async approveMessageStatus(@Param('messageId') messageId: string, @Body() dto: MessageApprovalDto
  ) {
    return this.chatsService.approveMessageStatus(messageId, dto.userId);
  }

  /*
   * Given userId, recieve a list of user that got blocked by userId
   */
  @Get(':userId/blocked')
  async getBlockedByUserId(@Param('userId') userId: string): Promise<{ users: { id: string; email: string }[] }> {
    const users = await this.chatsService.getBlockedByUserId({ userId }); // should return full user objects
    return { users }; // now matches the type { users: { id, email }[] }
  }

  /*
   * Given userId, recieve a list of user who block userId
   */
  @Get(':userId/blocked-by')
  async getUsersWhoBlockedMeIds(@Param('userId') userId: string): Promise<any> {
    const userIds = await this.chatsService.getUsersWhoBlockedMeIds({ userId });
    return { userIds }; // list
  }

  /*
   * Given userId, recieve a list of user that userId can block
   */
  @Get(':userId/can-block')
  async getUserIdsCanBlock(
    @Param('userId') userId: string,
    @Query('searchQuery') searchQuery?: string,
  ): Promise<{ users: { id: string; email: string }[] }> {
    const users = await this.chatsService.getUserIdsCanBlock({ userId, searchQuery });
    return { users };
  }
  /*
   * Block
   */
  @Post(':userId/blocked') // userId is the person who block other
  async blockUser(@Param('userId') userId: string, @Body() dto: BlockUserDto): Promise<void> {
    await this.chatsService.blockUser({ blockerId: userId, blockedId: dto.blockedId });
  }

  /*
   * Unblock
   */

  @Delete(':userId/unblock') // userId is the person who unblock other
  async unblockUser(@Param('userId') userId: string, @Body() dto: UnblockUserDto): Promise<void> {
    await this.chatsService.unblockUser({ blockerId: userId, blockedId: dto.blockedId });
  }

  /*
   * Returns true if user1 has blocked user2 OR user2 has blocked user1.
   */
  @Get('is-block-between')
  async checkBlocked(@Query('user1') user1: string, @Query('user2') user2: string): Promise<{ blocked: boolean }> {
    const blocked = await this.chatsService.isBlockedBetween(user1, user2);
    return { blocked };
  }
  //Related to poll
  /*
   * Create new poll in the current chat
   */
  @Post(':chatId/polls')
  async createPoll(
      @Param('chatId') chatId: string,
      @Body('question') question: string,
      @Body('options') options: string[]
  ): Promise<PollInGroupDto> {
    return this.groupChatsService.createPoll(chatId, question, options);
  }
  /*
   * Get all poll from current chat (include options)
   */
  @Get(':chatId/polls')
  async getAllPolls(@Param('chatId') chatId: string): Promise<PollInGroupDto[]> {
    return this.groupChatsService.getPolls(chatId);
  }
  /*
   * Add more options to current poll
   */
  @Post('poll/:pollId/add-option')
  async addOption(
      @Param('pollId') pollId: string,
      @Body() body: { text: string }
  ) {
    return this.groupChatsService.addOption(pollId, body.text);
  }
}
