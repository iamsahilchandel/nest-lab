import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TodoStatus } from '../todo-status.enum';

export class UpdateTodoStatusDto {
  @ApiProperty({
    enum: TodoStatus,
    example: TodoStatus.STARTED,
  })
  @IsEnum(TodoStatus)
  status: TodoStatus;
}
