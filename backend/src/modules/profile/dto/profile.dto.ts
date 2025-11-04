/**
 * Profile DTOs
 */

//* Get Profile Details DTO
export class GetProfileDetailsDto {
  userId: string;
  viewerId?: string; // Optional: for privacy filtering
}

//* Search Users Query DTO
export class SearchUsersDto {
  userId: string;
  page?: number;
  limit?: number;
  preferenceIds?: string[]; // Filter by lifestyle preferences
  importanceOperator?: 'equal' | 'less_or_equal' | 'greater_or_equal';
  importanceValue?: number; // 1-5
}

//* Add Favorite DTO
export class AddFavoriteDto {
  userId: string; // Current user ID (who is favoriting)
  favoritedUserId: string; // User being favorited
}

//* Remove Favorite DTO
export class RemoveFavoriteDto {
  userId: string; // Current user ID (who is unfavoriting)
  favoritedUserId: string; // User being unfavorited
}

//* Get Favorites Query DTO
export class GetFavoritesDto {
  userId: string; // Current user ID
  page?: number; // Pagination page (default 1)
  limit?: number; // Items per page (default 20)
}
