import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Intune Backend API')
  .setDescription('Chat App API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();