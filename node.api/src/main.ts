import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import { join } from 'path';
import { AppService } from '././app.service';
import { AppModule } from './app.module';

interface HmrModule {
  hot?: {
    accept(): void;
    dispose(callback: () => Promise<void>): void;
  };
}
declare const module: HmrModule;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidUnknownValues: false,
    }),
  );
  //  app.useGlobalFilters(new ExceptionsLoggerFilter());
  app.use(json({ limit: '500MB' }));
  app.useStaticAssets(join(__dirname, '..', 'store/uploads/client'), {
    index: false,
    prefix: '/public',
  });

  const appService = app.get(AppService);

  const options = new DocumentBuilder()
    .setTitle('Node.API')
    .setDescription('Node.API')
    .setVersion(process.env.APP_SERVER_VERSION || '---')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter USER_JWT token',
        in: 'header',
      },
      appService.get<string>('APP_SERVER_AUTH_BEARER_PATH_SWAGGER_UI'),
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  //  const swaggerCDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.7.2';
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      displayRequestDuration: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha', // 'method',
      persistAuthorization: true,
    },
    // customCssUrl: [`${swaggerCDN}/swagger-ui.css`],
    // customJs: [
    //   `${swaggerCDN}/swagger-ui-bundle.js`,
    //   `${swaggerCDN}/swagger-ui-standalone-preset.js`,
    // ],
  });

  await app.listen(
    appService.get<number>('APP_SERVER_PORT'),
    appService.get<string>('APP_SERVER_BASE_URL'),
    async () => {
      const serverUrl = await app.getUrl();

      console.log(
        'APP_SERVER_PORT',
        appService.get<number>('APP_SERVER_PORT'),
        ' APP_SERVER_BASE_URL ',
        appService.get<string>('APP_SERVER_BASE_URL'),
      );

      console.log(
        `\n\n[NODE.API App Running] version [${appService.get<string>('APP_SERVER_VERSION')}] is running on ${serverUrl.replace('[::1]', 'localhost')}\n-- from ${__dirname} --\n\n`,
      );
    },
  );

  // Webpack Hot-Module Replacement
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
