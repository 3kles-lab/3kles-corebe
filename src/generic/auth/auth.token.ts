import { NextFunction, Request, Response } from 'express-validation';
import * as jwt from 'jsonwebtoken';
import { AbstractAuthToken } from "./abstract.auth.token";

export class AuthToken extends AbstractAuthToken {

	public async authenticate(req: Request, res: Response, next: NextFunction): Promise<any> {
		const payload = { user: req.headers.user };
		const token = jwt.sign(payload, this.secretKey, { expiresIn: this.expiredTime });
		res.set('token', token);
		return res.status(200).json({ token });
	}

	public async checkAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (req.headers.token) {
			jwt.verify(req.headers.token, this.secretKey, (err, decodedToken) => {
				if (err) {
					res.status(403).send({ success: false, message: "Invalid token" });
				} else {
					const payload = { user: decodedToken.user };
					const token = jwt.sign(payload, this.secretKey, { expiresIn: this.expiredTime });
					res.set('token', token);
					next();
				}
			});
		} else {
			res.status(403).send({ success: false, message: "No token." });
		}
	}
}
