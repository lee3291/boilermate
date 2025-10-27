/**
 * Request DTOs for Preferences
 */

//* Get User Profile Preferences
export class GetUserProfilePreferencesDto {
  userId: string;
}

//* Set/Update User Profile Preference
export class SetUserProfilePreferenceDto {
  userId: string;
  preferenceId: string;
  importance: number; // 1-5
  visibility: string; // PUBLIC or PRIVATE
}

//* Delete User Profile Preference
export class DeleteUserProfilePreferenceDto {
  userId: string;
  preferenceId: string;
}

//* Get Roommate Preferences
export class GetRoommatePreferencesDto {
  userId: string;
}

//* Set/Update Roommate Preference
export class SetRoommatePreferenceDto {
  userId: string;
  preferenceId: string;
  importance: number; // 1-5
  visibility: string; // PUBLIC or PRIVATE
}

//* Delete Roommate Preference
export class DeleteRoommatePreferenceDto {
  userId: string;
  preferenceId: string;
}
