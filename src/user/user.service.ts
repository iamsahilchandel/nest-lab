import {
  Injectable,
  Logger,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(name: string, email: string, password?: string): Promise<User> {
    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        this.logger.warn(
          `Attempt to create duplicate user: ${normalizedEmail}`,
        );
        throw new ConflictException('User with this email already exists');
      }

      this.logger.log(`Creating user ${normalizedEmail}`);
      const user = this.userRepository.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
      });

      return await this.userRepository.save(user);
    } catch (error) {
      // Re-throw known errors
      if (error instanceof ConflictException) {
        throw error;
      }

      // Handle database constraint errors
      if (error instanceof QueryFailedError) {
        // Check for unique constraint violation (MySQL error code 1062, PostgreSQL 23505)
        if (
          error.message.includes('Duplicate entry') ||
          error.message.includes('unique constraint')
        ) {
          this.logger.warn(`Database constraint violation for email: ${email}`);
          throw new ConflictException('User with this email already exists');
        }
      }

      // Log unexpected errors
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Failed to create user. Please try again later.',
      );
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        relations: ['todos'],
      });
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['todos'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to fetch user ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      return await this.userRepository.findOne({
        where: { email: normalizedEmail },
        select: ['id', 'name', 'email', 'password'],
      });
    } catch (error) {
      this.logger.error(
        `Failed to find user by email: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to find user');
    }
  }
}
