import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodFilter } from './filters/zod-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Pauta Cidadã')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/api/docs', app, documentFactory, {
    customSiteTitle: 'Pauta Cidadã',
  });

  // Habilitando cors
  app.enableCors();

  // Habilitand filtros do Zod
  app.useGlobalFilters(new ZodFilter());

  // Habilitar o prefixo /api
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
