import { IsString, IsUUID, IsNumber, IsArray} from 'class-validator';

export class CreateListingDto {
    @IsUUID()
    userID: string;

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsNumber()
    pricing: number;

    @IsNumber()
    numberBed: number;

    @IsNumber()
    numberBath: number;

    media: string[];
}

