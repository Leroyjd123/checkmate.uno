import { IsString, Length } from 'class-validator';

export class MakeMoveDto {
  @IsString()
  @Length(2, 2)
  from: string;

  @IsString()
  @Length(2, 2)
  to: string;
}
