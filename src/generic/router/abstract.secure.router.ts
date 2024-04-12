import { AbstractGenericRouter } from './index.generic.router';
import { IGenericController } from '../controller/index.generic.controller';
import { IAuth } from '../auth/IAuth';
import { RouterOptions } from 'express';

// Class to create a router from a GenericController
export abstract class AbstractSecureRouter extends AbstractGenericRouter {

	private auth: IAuth;

	constructor(auth: IAuth, controller?: IGenericController, options?: RouterOptions) {
		super(options);
		this.auth = auth;
		this.router.route('/authenticate').post(this.auth.authenticate);
		this.router.route('/checktoken').post(this.auth.checkAuth);
		this.router.route('/revoketoken').post(this.auth.revokeAuth);
		this.router.route('/refreshtoken').get(this.auth.refreshToken);
		this.router.use(auth.checkAuth);
		if (controller) {
			this.addController(controller);
		}
	}
}
