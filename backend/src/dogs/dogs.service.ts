import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDogDto } from './dto/create-dog.dto';
import { UpdateDogDto } from './dto/update-dog.dto';
import { DogDetail } from './interfaces/dog.interface';

@Injectable()
export class DogsService {
  // Inject the PrismaService to interact with the database
  constructor(private prisma: PrismaService) {}

  // Create a new dog
  async create(createDogDto: CreateDogDto): Promise<DogDetail> {
    // Use Prisma client to create a new dog record
    return this.prisma.dog.create({
      data: createDogDto,
    });
  }

  // Get all dogs
  async findAll(): Promise<DogDetail[]> {
    // Retrieve all dogs from the database
    return this.prisma.dog.findMany();
  }

  // Get a specific dog by ID
  async findOne(id: string): Promise<DogDetail | null> {
    // Find a dog by its unique identifier
    return this.prisma.dog.findUnique({
      where: { id },
    });
  }

  // Update a dog's information
  async update(id: string, updateDogDto: UpdateDogDto): Promise<DogDetail> {
    // Update an existing dog record
    return this.prisma.dog.update({
      where: { id },
      data: updateDogDto,
    });
  }

  // Delete a dog from the database
  async remove(id: string): Promise<DogDetail> {
    // Remove a dog by its ID
    return this.prisma.dog.delete({
      where: { id },
    });
  }

  // Delete all dogs (be careful with this one!)
  async removeAll(): Promise<{ count: number }> {
    // Delete all records from the dog table
    return this.prisma.dog.deleteMany();
  }
}
