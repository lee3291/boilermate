import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DogsService } from './dogs.service';
import { CreateDogDto } from './dto/create-dog.dto';
import { UpdateDogDto } from './dto/update-dog-dto';
import { DogDetail } from './interfaces/dog.interface';

@Controller('dogs') // This prefix means all routes will start with /dogs
export class DogsController {
  // Inject the DogsService to handle business logic
  constructor(private readonly dogsService: DogsService) {}

  @Post()
  async create(
    @Body() createDogDto: CreateDogDto,
  ): Promise<{ message: string; data: DogDetail }> {
    try {
      // Create a new dog using the service
      const dog = await this.dogsService.create(createDogDto);
      return {
        message: 'Dog created successfully',
        data: dog,
      };
    } catch (error) {
      throw new HttpException('Could not create dog', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(): Promise<{ message: string; data: DogDetail[] }> {
    try {
      // Get all dogs using the service
      const dogs = await this.dogsService.findAll();
      return {
        message: 'Dogs retrieved successfully',
        data: dogs,
      };
    } catch (error) {
      throw new HttpException(
        'Could not retrieve dogs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<{ message: string; data: DogDetail }> {
    try {
      // Get a specific dog by ID
      const dog = await this.dogsService.findOne(id);
      if (!dog) {
        throw new HttpException('Dog not found', HttpStatus.NOT_FOUND);
      }
      return {
        message: 'Dog retrieved successfully',
        data: dog,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Could not retrieve dog',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDogDto: UpdateDogDto,
  ): Promise<{ message: string; data: DogDetail }> {
    try {
      // Update a specific dog's information
      const dog = await this.dogsService.update(id, updateDogDto);
      return {
        message: 'Dog updated successfully',
        data: dog,
      };
    } catch (error) {
      throw new HttpException('Could not update dog', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      // Remove a specific dog
      await this.dogsService.remove(id);
      return {
        message: 'Dog deleted successfully',
      };
    } catch (error) {
      throw new HttpException('Could not delete dog', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete()
  async removeAll() {
    try {
      // Remove all dogs (be careful!)
      await this.dogsService.removeAll();
      return {
        message: 'All dogs have been deleted',
      };
    } catch (error) {
      throw new HttpException(
        'Could not delete dogs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
