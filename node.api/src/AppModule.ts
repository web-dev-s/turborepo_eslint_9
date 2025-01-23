import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppModule as AppSimpleModule } from './app.module';
import { LoggerMiddleware } from './Middleware/Logger/Logger.middleware';
@Module({
    imports: [
        // #region App
        AppSimpleModule
        // #endregion App

        // #region Cloud
        
        // #endregion Cloud

        // Global Module
       
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // consumer.apply(LoggerMiddleware).forRoutes('api');
        consumer.apply(LoggerMiddleware).forRoutes({ path: '/api/*', method: RequestMethod.ALL });
        // consumer.apply(LoggerMiddleware).forRoutes(IssueController);
    }
}
