/**
 * Interface representing a Dog entity
 * Similar to the Cat interface from NestJS documentation
 */
export interface DogDetail {
  id: string;
  name: string;
  breed: string;
  age: number;
  isGoodBoy: boolean;
  createdAt: Date;
  updatedAt: Date;
}
