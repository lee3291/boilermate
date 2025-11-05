import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { PassportModule } from '@nestjs/passport';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), UploadsModule],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}
