import * as blacklist from 'express-jwt-blacklist';
import * as express from 'express';
import { IAuth } from "./IAuth";

export interface IRefreshTokenModel {
	usid: string;
	token: string;
	// refreshToken: string;
	isActive: boolean;
	expiresAt: number;
	createdByIp?: string;
}
export abstract class AbstractAuthToken implements IAuth {

	protected parameters: any;
	protected secretKey: string;
	protected expiredTime: string | number;
	protected listToken: IRefreshTokenModel[] = [];

	constructor(params?: any) {
		if (params) {
			this.parameters = params;
		}
		this.secretKey = process.env.JWT_SECRET || 'secret';
		this.expiredTime = process.env.JWT_EXPIREDTIME || 60;
		this.authenticate = this.authenticate.bind(this);
		this.checkAuth = this.checkAuth.bind(this);
		this.revokeAuth = this.revokeAuth.bind(this);
		this.refreshToken = this.refreshToken.bind(this);
	}

	public abstract authenticate(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any>;
	public abstract checkAuth(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void>;

	public revokeAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
		// blacklist.revoke(req.user);
	}

	public abstract refreshToken(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void>;

}
