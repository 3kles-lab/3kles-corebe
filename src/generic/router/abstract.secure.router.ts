import { AbstractGenericRouter } from './index.generic.router';
import { IGenericController } from '../controller/index.generic.controller';
import { IAuth } from '../auth/IAuth';

// Class to create a router from a GenericController
export abstract class AbstractSecureRouter extends AbstractGenericRouter {

	private auth: IAuth;

	constructor(auth: IAuth, controller?: IGenericController) {
		super();
		this.auth = auth;
		this.router.route('/authenticate').post(this.auth.authenticate);
		this.router.route('/checktoken').post(this.auth.checkAuth);
		this.router.route('/revoketoken').post(this.auth.revokeAuth);
		this.router.use(auth.checkAuth);
		if (controller) {
			this.addController(controller);
		}
	}
}
