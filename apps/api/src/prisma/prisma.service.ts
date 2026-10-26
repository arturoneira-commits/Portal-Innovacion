import { Injectable, OnModuleInit } from '@nestjs/common';
import { db } from './db';

@Injectable()
export class PrismaService implements OnModuleInit {
  readonly db = db;

  async onModuleInit() {
    await this.db.connect();
  }
}
