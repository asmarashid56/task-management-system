import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      console.log('DTO received in register:', dto);

      if (!dto.password) {
        throw new BadRequestException('Password is required');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = new this.userModel({ ...dto, password: hashedPassword });
      return await user.save();
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // ✅ Ensure sub is a string, not an ObjectId
    const payload = { sub: user._id.toString(), username: user.username, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
