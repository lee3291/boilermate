import { IsString, IsOptional, IsBoolean } from 'class-validator';


export class CreateAnnouncementDto {
 @IsString()
 title: string;


 @IsString()
 message: string;


 @IsOptional()
 @IsString()
 authorId?: string;
}


export class UpdateAnnouncementDto {
 @IsOptional()
 @IsString()
 title?: string;


 @IsOptional()
 @IsString()
 message?: string;


 @IsOptional()
 @IsBoolean()
 isActive?: boolean;
}
