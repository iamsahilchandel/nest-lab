import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(name: string, email: string) {
    this.logger.log(`Creating user ${email}`);
    const user = this.userRepository.create({ name, email });
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find({
      relations: ['todos'],
    });
  }

  findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['todos'],
    });
  }
}
