import { IsString, IsUUID, IsNumber} from 'class-validator';

export class CreateListingDto {
    @IsUUID()
    userID: string;

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsNumber()
    pricing: number;

    @IsString()
    location: string;

    media: string[];
}

