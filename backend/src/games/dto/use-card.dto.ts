import { IsString, IsOptional } from 'class-validator';

export class UseCardDto {
  @IsString()
  card_id: string;

  @IsOptional()
  target_data?: {
    piece_square?: string;
    from?: string;
    to?: string;
  };
}
