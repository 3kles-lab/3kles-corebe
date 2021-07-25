import * as blacklist from 'express-jwt-blacklist';
import * as express from 'express';
import { IAuth } from "./IAuth";

export abstract class AbstractAuthToken implements IAuth {

	protected parameters: any;
	protected secretKey: string;
	protected expiredTime: string | number;

	constructor(params?: any) {
		if (params) {
			this.parameters = params;
		}
		this.secretKey = process.env.JWT_SECRET || 'secret';
		this.expiredTime = process.env.JWT_EXPIREDTIME || 60;
		this.authenticate = this.authenticate.bind(this);
		this.checkAuth = this.checkAuth.bind(this);
		this.revokeAuth = this.revokeAuth.bind(this);
	}

	public abstract async authenticate(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any>;
	public abstract async checkAuth(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void>;

	public revokeAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
		blacklist.revoke(req.user);
	}

}
