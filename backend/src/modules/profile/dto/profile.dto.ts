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
