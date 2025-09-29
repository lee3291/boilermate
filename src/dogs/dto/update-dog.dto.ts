// Data Transfer Object for updating an existing dog
// Extends Partial<CreateDogDto> to make all fields optional
export class UpdateDogDto {
  // Name of the dog - optional for updates
  name?: string;

  // Breed of the dog - optional for updates
  breed?: string;

  // Age of the dog - optional for updates
  age?: number;

  // Whether the dog is a good boy/girl - optional
  isGoodBoy?: boolean;
}
