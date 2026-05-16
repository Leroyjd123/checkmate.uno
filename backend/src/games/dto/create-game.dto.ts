import { IsEnum } from 'class-validator';
import type { GameMode } from '../../common/types';

export class CreateGameDto {
  @IsEnum(['local', 'computer', 'online'])
  mode: GameMode;
}
