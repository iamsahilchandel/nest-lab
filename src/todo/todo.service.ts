import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './todo.entity';
import { User } from '../user/user.entity';
import { TodoStatus } from './todo-status.enum';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodoService {
  private readonly logger = new Logger(TodoService.name);

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateTodoDto): Promise<Todo> {
    const user = await this.userRepository.findOneBy({ id: dto.userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const todo = this.todoRepository.create({
      title: dto.title,
      description: dto.description,
      status: TodoStatus.PENDING,
      user,
    });

    return this.todoRepository.save(todo);
  }

  findByUser(userId: number, page = 1, limit = 10) {
    return this.todoRepository.findAndCount({
      where: { user: { id: userId } },
      take: limit,
      skip: (page - 1) * limit,
      order: { id: 'DESC' },
    });
  }

  async updateStatus(id: number, status: TodoStatus) {
    const todo = await this.todoRepository.findOneBy({ id });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    todo.status = status;
    return this.todoRepository.save(todo);
  }
}
