import { IsString, IsNumber, IsUUID} from 'class-validator';

export class UpdateListingDto {
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
}
