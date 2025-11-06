import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RequestCodeDto } from './dto/request-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { SignInDto } from './dto/signin.dto';
import { User } from './decorators/user.decorator';
import {
  RequestReactivationCodeDto,
  ReactivateAccountDto,
} from './dto/reactivation.dto';
import { ReactivationGuard } from './guards/reactivation.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-code')
  async requestCode(@Body() dto: RequestCodeDto) {
    return this.authService.requestCode(dto);
  }

  @Post('verify-code')
  async verifyCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyCode(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('signin')
  async signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Post('reactivate/request-code')
  @UseGuards(ReactivationGuard)
  async requestReactivationCode(
    @User() user: { email: string },
    @Body() _dto: RequestReactivationCodeDto,
  ) {
    return this.authService.requestReactivationCode(user.email);
  }

  @Post('reactivate')
  @UseGuards(ReactivationGuard)
  async reactivate(
    @User() user: { sub: string; email: string },
    @Body() dto: ReactivateAccountDto,
  ) {
    return this.authService.reactivateAccount(user.sub, user.email, dto.code);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@User() user: { userId: string; email: string }) {
    // Thanks to the JwtStrategy, the user object is attached to the request.
    // The @User decorator simply extracts it for us.
    return user;
  }
}
