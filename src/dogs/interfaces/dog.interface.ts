/**
 * Interface representing a Dog entity
 * Similar to the Cat interface from NestJS documentation
 */
export interface DogDetail {
  /**
   * Unique identifier for the dog
   */
  id: string;

  /**
   * Name of the dog
   */
  name: string;

  /**
   * Breed of the dog
   */
  breed: string;

  /**
   * Age of the dog in years
   */
  age: number;

  /**
   * Whether the dog is a good boy/girl (always true!)
   */
  isGoodBoy: boolean;

  /**
   * When the dog was added to our system
   */
  createdAt: Date;

  /**
   * When the dog was last updated
   */
  updatedAt: Date;
}
