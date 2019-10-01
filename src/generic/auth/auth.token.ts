import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { AbstractAuthToken } from "./abstract.auth.token";

export class AuthToken extends AbstractAuthToken {

	public async authenticate(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
		const payload = { user: req.headers.user };
		const token = jwt.sign(payload, this.secretKey, { expiresIn: this.expiredTime });
		res.set('token', token);
		return res.status(200).json({ token });
	}

	public async checkAuth(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
		if (req.headers.token) {
			const token = req.headers.token[0];
			jwt.verify(token, this.secretKey, (err, decodedToken) => {
				if (err) {
					res.status(403).send({ success: false, message: "Invalid token" });
				} else {
					const payload = { user: (decodedToken as any).user };
					const tk = jwt.sign(payload, this.secretKey, { expiresIn: this.expiredTime });
					res.set('token', tk);
					next();
				}
			});
		} else {
			res.status(403).send({ success: false, message: "No token." });
		}
	}
}
