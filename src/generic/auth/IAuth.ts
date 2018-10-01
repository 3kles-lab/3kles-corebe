import { NextFunction, Request, Response } from 'express-validation';
interface IAuth {
	authenticate(req: Request, res: Response, next: NextFunction): Promise<any>;
	checkAuth(req: Request, res: Response, next: NextFunction): void;
	revokeAuth(req: Request, res: Response, next: NextFunction): void;
}
export { IAuth };
