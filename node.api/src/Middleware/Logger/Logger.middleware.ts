 
import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
 
    ) {}

    use(req: Request, res: Response, next: () => void) {
        try {
            const requester = this.getUser(req.headers.authorization);
            const userType = !!requester?.type ? `[${requester?.type}]` : '';
            const userGroup = !!requester?.group ? `(${requester?.group})` : '';
            const userEmail = !!requester?.email ? `${requester?.email}` : '';

         //   this.inboundRecordService.logAndAuditMiddlewareCallRecordAsync(req, res, userEmail, userType, userGroup).finally(() => next());
        } catch (error) {
            console.error('res error:', res);
            console.log(error);
            next();
        }
    }
    getUser(authorization?: string) {
        try {
            const authHeader = authorization || '';
            const accessToken = authHeader?.length > 'Bearer '.length ? authHeader?.slice('Bearer '.length) : '';
            return this.jwtService.decode(accessToken);
        } catch (error) {
            console.error(error);
        }
    }
}
