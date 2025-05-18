import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { resolve } from 'path';
async function bootstrap() {
  const port: number | string =4000;
  const app = await NestFactory.create(AppModule);

  app.enableCors()

  app.use('/order/webhook', express.raw({ type: 'application/json' }));

app.use('/uploads', express.static(resolve(__dirname, '..', 'uploads')));
  await app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}

bootstrap();
