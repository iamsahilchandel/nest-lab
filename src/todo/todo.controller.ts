import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { TodoStatus } from './todo-status.enum';
import { CreateTodoDto } from './dto/create-todo.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@ApiTags('Todos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  createTodo(@Body() dto: CreateTodoDto) {
    return this.todoService.create(dto);
  }

  @Get('user/:userId')
  getUserTodos(
    @Param('userId') userId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.todoService.findByUser(+userId, +page, +limit);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: number, @Body('status') status: TodoStatus) {
    return this.todoService.updateStatus(id, status);
  }
}
