import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ token: string }> {
    const { name, email, password } = registerDto;
    
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const payload = { user: { id: user.id } };
    const token = this.jwtService.sign(payload);
    return { token };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user || !user.password) {
      throw new BadRequestException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = { user: { id: user.id } };
    const token = this.jwtService.sign(payload);
    return { token };
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
