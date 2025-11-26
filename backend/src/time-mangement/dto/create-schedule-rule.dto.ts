import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateScheduleRuleDto {
  @ApiProperty({ example: '4 on / 3 off pattern' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '4on-3off' })
  @IsString()
  @IsNotEmpty()
  pattern: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
