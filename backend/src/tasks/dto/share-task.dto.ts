import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class ShareTaskDto {
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  userIds!: string[];
}
