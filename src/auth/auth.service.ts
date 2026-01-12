import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signup(name: string, email: string, password: string) {
    try {
      // Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user (UserService handles duplicate check)
      const user = await this.userService.create(name, email, hashedPassword);

      this.logger.log(`User registered successfully: ${user.email}`);

      // Generate JWT token
      const access_token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });

      return {
        access_token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      // Re-throw known errors (ConflictException from UserService)
      if (error.status === 409) {
        throw error;
      }

      // Log bcrypt or other errors
      this.logger.error(`Signup failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Failed to create account. Please try again later.',
      );
    }
  }

  async login(email: string, password: string) {
    try {
      // Find user by email
      const user = await this.userService.findByEmail(email);

      if (!user) {
        this.logger.warn(`Login attempt for non-existent user: ${email}`);
        // Use generic message to prevent user enumeration
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password using timing-safe comparison
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        this.logger.warn(`Failed login attempt for user: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`User logged in successfully: ${user.email}`);

      // Generate JWT token
      const access_token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });

      return {
        access_token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      // Re-throw UnauthorizedException
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Log unexpected errors
      this.logger.error(`Login failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Login failed. Please try again later.',
      );
    }
  }
}
