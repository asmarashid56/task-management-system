import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    console.log('Register endpoint received body:', dto);

    if (!dto.username || !dto.email || !dto.password) {
      throw new BadRequestException('username, email, and password are required');
    }

    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    console.log('Login endpoint received body:', dto);

    if (!dto.email || !dto.password) {
      throw new BadRequestException('email and password are required');
    }

    return this.authService.login(dto);
  }
}
