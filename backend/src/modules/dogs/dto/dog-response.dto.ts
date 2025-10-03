import { Expose, Type } from 'class-transformer';

export class GetDogResponseDto {
  @Expose()
  id: string

  @Expose()
  name: string;

  @Expose()
  breed: string;

  @Expose()
  age: string

  @Expose()
  isGoodBoy: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class GetDogsResponseDto {
  @Expose()
  @Type(() => GetDogResponseDto)
  dogs: GetDogResponseDto[]
}