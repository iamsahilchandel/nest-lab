import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Sahil' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'sahil@test.com' })
  @IsEmail()
  email: string;
}
