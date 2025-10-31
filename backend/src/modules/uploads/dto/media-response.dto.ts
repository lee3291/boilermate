import { plainToInstance, Exclude, Expose } from "class-transformer";
import { imageRequestResult } from '../interfaces/'

@Exclude()
export class requestUrlResponseDto {
  @Expose()
  preSignedUrl: string;

  @Expose()
  key: string;

  static fromInterface(rawRequestUrl: imageRequestResult): requestUrlResponseDto {
    return plainToInstance(requestUrlResponseDto, rawRequestUrl, { excludeExtraneousValues: true });
  }
}