import * as express from 'express';

interface IAuth {
	authenticate(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any>;
	checkAuth(req: express.Request, res: express.Response, next: express.NextFunction): void;
	revokeAuth(req: express.Request, res: express.Response, next: express.NextFunction): void;
	refreshToken(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any>;
}
export { IAuth };
