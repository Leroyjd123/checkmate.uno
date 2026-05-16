import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GamesGateway } from './games.gateway';
import { DatabaseModule } from '../database/database.module';
import { ChessModule } from '../chess/chess.module';

@Module({
  imports: [DatabaseModule, ChessModule],
  controllers: [GamesController],
  providers: [GamesService, GamesGateway],
})
export class GamesModule {}
