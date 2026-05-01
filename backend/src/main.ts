import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for local frontend dev (port 3001)
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  // ✅ Serve static files from /uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // ✅ Serve React frontend build (for Railway single URL)
  const frontendPath = join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(frontendPath));

  // ✅ Use raw Express instance for catch‑all route
  const server = app.getHttpAdapter().getInstance();
  server.get('*', (req: Request, res: Response) => {
    res.sendFile(join(frontendPath, 'index.html'));
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
