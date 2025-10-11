import { IsString, IsNumber, IsUUID, IsArray} from 'class-validator';

export class UpdateListingDto {
    @IsUUID()
    userID: string;

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsNumber()
    pricing: number;

    @IsArray()
    @IsString({ each: true })
    media: string[];
}
