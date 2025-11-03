import { Body, Controller, Delete, Get, Param, Post, Patch, HttpCode, Logger } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import {
  GetUserProfilePreferencesDto,
  SetUserProfilePreferenceDto,
  UpdateUserProfilePreferenceDto,
  DeleteUserProfilePreferenceDto,
  GetRoommatePreferencesDto,
  SetRoommatePreferenceDto,
  UpdateRoommatePreferenceDto,
  DeleteRoommatePreferenceDto,
  GetPreferencesResponseDto,
  GetUserProfilePreferencesResponseDto,
  GetRoommatePreferencesResponseDto,
  UserProfilePreferenceDto,
  RoommatePreferenceDto
} from './dto';

/**
 * Preferences endpoints
 * - GET /preferences - Get all available preferences (master list)
 * - GET /preferences/profile/:userId - Get user profile preferences (I am...)
 * - POST /preferences/profile - Set/Update user profile preference
 * - PATCH /preferences/profile/:userId/:preferenceId - Update importance/visibility only
 * - DELETE /preferences/profile/:userId/:preferenceId - Delete user profile preference
 * - GET /preferences/roommate/:userId - Get roommate preferences (I want...)
 * - POST /preferences/roommate - Set/Update roommate preference
 * - PATCH /preferences/roommate/:userId/:preferenceId - Update importance/visibility only
 * - DELETE /preferences/roommate/:userId/:preferenceId - Delete roommate preference
 */
@Controller('preferences')
export class PreferencesController {
  private readonly logger = new Logger(PreferencesController.name);

  constructor(private readonly preferencesService: PreferencesService) {}

  /**
   * Get all available preferences (master list)
   */
  @Get()
  @HttpCode(200)
  async getPreferences() {
    const result = await this.preferencesService.getPreferences();
    return GetPreferencesResponseDto.fromPreferences(result.preferences);
  }

  /**
   * Get user profile preferences (I am...)
   */
  @Get('profile/:userId')
  @HttpCode(200)
  async getUserProfilePreferences(@Param('userId') userId: string) {
    const dto: GetUserProfilePreferencesDto = { userId };
    const preferences = await this.preferencesService.getUserProfilePreferences(dto);
    return GetUserProfilePreferencesResponseDto.fromUserProfilePreferences(preferences);
  }

  /**
   * Set/Update user profile preference (I am...)
   */
  @Post('profile')
  @HttpCode(201)
  async setUserProfilePreference(@Body() dto: SetUserProfilePreferenceDto) {
    const preference = await this.preferencesService.setUserProfilePreference(dto);
    return UserProfilePreferenceDto.fromUserProfilePreference(preference);
  }

  /**
   * Update user profile preference importance/visibility (I am...)
   */
  @Patch('profile/:userId/:preferenceId')
  @HttpCode(200)
  async updateUserProfilePreference(
    @Param('userId') userId: string,
    @Param('preferenceId') preferenceId: string,
    @Body() body: UpdateUserProfilePreferenceDto
  ) {
    const dto = { userId, preferenceId, ...body };
    const preference = await this.preferencesService.updateUserProfilePreference(dto);
    return UserProfilePreferenceDto.fromUserProfilePreference(preference);
  }

  /**
   * Delete user profile preference (I am...)
   */
  @Delete('profile/:userId/:preferenceId')
  @HttpCode(204)
  async deleteUserProfilePreference(
    @Param('userId') userId: string,
    @Param('preferenceId') preferenceId: string
  ) {
    const dto: DeleteUserProfilePreferenceDto = { userId, preferenceId };
    await this.preferencesService.deleteUserProfilePreference(dto);
  }

  /**
   * Get roommate preferences (I want...)
   */
  @Get('roommate/:userId')
  @HttpCode(200)
  async getRoommatePreferences(@Param('userId') userId: string) {
    const dto: GetRoommatePreferencesDto = { userId };
    const preferences = await this.preferencesService.getRoommatePreferences(dto);
    return GetRoommatePreferencesResponseDto.fromRoommatePreferences(preferences);
  }

  /**
   * Set/Update roommate preference (I want...)
   */
  @Post('roommate')
  @HttpCode(201)
  async setRoommatePreference(@Body() dto: SetRoommatePreferenceDto) {
    const preference = await this.preferencesService.setRoommatePreference(dto);
    return RoommatePreferenceDto.fromRoommatePreference(preference);
  }

  /**
   * Update roommate preference importance/visibility (I want...)
   */
  @Patch('roommate/:userId/:preferenceId')
  @HttpCode(200)
  async updateRoommatePreference(
    @Param('userId') userId: string,
    @Param('preferenceId') preferenceId: string,
    @Body() body: UpdateRoommatePreferenceDto
  ) {
    const dto = { userId, preferenceId, ...body };
    const preference = await this.preferencesService.updateRoommatePreference(dto);
    return RoommatePreferenceDto.fromRoommatePreference(preference);
  }

  /**
   * Delete roommate preference (I want...)
   */
  @Delete('roommate/:userId/:preferenceId')
  @HttpCode(204)
  async deleteRoommatePreference(
    @Param('userId') userId: string,
    @Param('preferenceId') preferenceId: string
  ) {
    const dto: DeleteRoommatePreferenceDto = { userId, preferenceId };
    await this.preferencesService.deleteRoommatePreference(dto);
  }
}
