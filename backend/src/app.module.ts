import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PetsModule } from './modules/pets/pets.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { NotesModule } from './modules/notes/notes.module';
import { WeightRecordsModule } from './modules/weight-records/weight-records.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { StockItemsModule } from './modules/stock-items/stock-items.module';
import { AlbumModule } from './modules/album/album.module';
import { ShopModule } from './modules/shop/shop.module';
import { UploadModule } from './modules/upload/upload.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    PetsModule,
    RemindersModule,
    ExpensesModule,
    RecipesModule,
    NotesModule,
    WeightRecordsModule,
    MedicalRecordsModule,
    StockItemsModule,
    AlbumModule,
    ShopModule,
    UploadModule,
    AdminModule,
    AiModule,
  ],
})
export class AppModule {}
