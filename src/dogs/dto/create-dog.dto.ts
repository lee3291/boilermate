// Data Transfer Object for creating a new dog
// DTOs define the shape of data that will be sent over the network
export class CreateDogDto {
  // Name of the dog - required field
  name: string;

  // Breed of the dog - required field
  breed: string;

  // Age of the dog in years - required field
  age: number;

  // Optional field - defaults to true in the database
  isGoodBoy?: boolean;
}
