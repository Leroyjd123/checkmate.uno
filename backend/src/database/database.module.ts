import { Module } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PostgresService, PrismaService],
  exports: [PostgresService, PrismaService],
})
export class DatabaseModule {}
