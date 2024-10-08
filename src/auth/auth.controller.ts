import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LoginAuthDto } from './dto/create-auth.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //LOGIN
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginAuthDto: LoginAuthDto): Promise<any> {
    try {
      const user = await this.authService.validateUser(loginAuthDto);
      return user;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(
        'Invalid credentials or email not verified',
      );
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('send-email')
  async sendPasswordResetEmail(@Body('token') token: string) {
    await this.authService.sendPasswordResetEmail(token);
    return { message: 'Email send successfully' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password reset successfully' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    await this.authService.sendResetPasswordEmail(email);
    return { message: 'If this email exists in our database, a reset password link has been sent.' };
  }

  //OTP
  @UseGuards(JwtAuthGuard)
  @Post('request-otp')
  async requestOtp(@Req() req) {
    const userName = req.user.userName;
    await this.authService.sendOtp(userName);
    return { message: 'OTP sent successfully' };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('verify-otp')
  async verifyOtp(@Body() { email, otp }: { email: string; otp: string }) {
    await this.authService.verifyOtp(email, otp);
    return { message: 'OTP verified successfully' };
  }
}
