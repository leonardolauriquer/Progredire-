import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Futuros módulos: AuthModule, UsersModule, AiModule, etc.
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}