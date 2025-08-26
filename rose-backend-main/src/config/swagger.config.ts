import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { writeFileSync } from 'fs';

export function SwaggerConfigInit(app: INestApplication): void {
  const document = new DocumentBuilder()
    .setTitle('Rose Hotel API')
    .setDescription('API for resturants reservation and menu')
    .setVersion('1.0.0')
    .addBearerAuth(swaggerAuthConfig(), 'Authorization')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, document);
  SwaggerModule.setup(`/swagger`, app, swaggerDocument);
  SwaggerModule.setup('api', app, swaggerDocument);

  // Write swagger.json to project root
  writeFileSync('./swagger.json', JSON.stringify(swaggerDocument, null, 2));
}

function swaggerAuthConfig(): SecuritySchemeObject {
  return {
    type: 'http',
    bearerFormat: 'JWT',
    in: 'header',
    scheme: 'bearer',
  };
}
