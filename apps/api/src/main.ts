import 'temporal-polyfill/full/global';
import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule, ObserveInstrument } from './app.module';
import { DatabaseExceptionFilter } from './common/database-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new DatabaseExceptionFilter(httpAdapter));
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
