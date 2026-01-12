import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'Learn NestJS' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Study modules and DI', required: false })
  @IsOptional()
  description?: string;
}
