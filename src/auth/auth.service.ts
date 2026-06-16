import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    profile: any;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({
    email,
    password,
    firstName,
    lastName,
    age,
    country,
    preferredLanguage,
  }: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException("Email already in use");
    }

    const user = await this.usersService.createUser(
      email,
      password,
      firstName,
      lastName,
      age,
      country,
      preferredLanguage,
    );
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
      },
    };
  }

  async login({ email, password }: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
      },
    };
  }
}
