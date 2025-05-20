import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { ConfigModule } from '@nestjs/config';
import { join, resolve } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel } from './DB/model/User.model';
import { TokenService } from './common/service/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryService } from './DB/repository/User.repository.service';
import { UserController } from './modules/user/user.controller';
import { UserService } from './modules/user/user.service';
import { CategoryModule } from './modules/category/category.module.js';
import { GlobalAuthenticationModule } from './common/modules/global.auth.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.dev'),
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI as string),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }), // <== مهم جدًا
      debug: true,
      playground: true, // لو بتحب تشتغل من المتصفح
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          store: createKeyv('redis://localhost:6379'),
        };
      },
    }),
    GlobalAuthenticationModule,
    AuthenticationModule,
    UserModel,
    ProductModule,
    CategoryModule,
    CartModule,
    OrderModule,
    GatewayModule,
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    TokenService,
    JwtService,
    UserRepositoryService,
    UserService,
  ],
})
export class AppModule {}
