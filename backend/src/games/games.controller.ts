import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { MakeMoveDto } from './dto/make-move.dto';
import { UseCardDto } from './dto/use-card.dto';

@Controller('api/games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Post()
  async createGame(
    @Body() createGameDto: CreateGameDto,
    @Request() req: any,
  ) {
    // For online mode, auth is required
    if (createGameDto.mode === 'online' && !req.user) {
      throw new BadRequestException('Authentication required for online mode');
    }

    try {
      return await this.gamesService.createGame(createGameDto, req.user?.userId);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  async joinRoom(
    @Body() joinRoomDto: JoinRoomDto,
    @Request() req: any,
  ) {
    try {
      return await this.gamesService.joinRoom(joinRoomDto.room_code, req.user.userId);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async getGame(
    @Param('id') gameId: string,
    @Request() req: any,
  ) {
    try {
      const game = await this.gamesService.getGame(gameId, req.user?.userId);
      if (!game) {
        throw new NotFoundException('Game not found');
      }
      return game;
    } catch (error: any) {
      if (error.message === 'Game not found') {
        throw new NotFoundException('Game not found');
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/move')
  @UseGuards(JwtAuthGuard)
  async executeMove(
    @Param('id') gameId: string,
    @Body() makeMoveDto: MakeMoveDto,
    @Request() req: any,
  ) {
    try {
      return await this.gamesService.executeMove(
        gameId,
        req.user.userId,
        makeMoveDto.from,
        makeMoveDto.to,
      );
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/use-card')
  @UseGuards(JwtAuthGuard)
  async useCard(
    @Param('id') gameId: string,
    @Body() useCardDto: UseCardDto,
    @Request() req: any,
  ) {
    try {
      return await this.gamesService.useCard(gameId, req.user.userId, useCardDto.card_id);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
