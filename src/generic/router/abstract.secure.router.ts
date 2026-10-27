import { AbstractGenericRouter } from './index.generic.router';
import { IGenericController } from '../controller/index.generic.controller';
import { IAuth } from '../auth/IAuth';
import { GenericRouterOptions } from './body-parser';

// Class to create a router from a GenericController
export abstract class AbstractSecureRouter extends AbstractGenericRouter {

	private auth: IAuth;

	constructor(auth: IAuth, controller?: IGenericController, options?: GenericRouterOptions) {
		super(options);
		this.auth = auth;
		this.router.route('/authenticate').post(this.bodyParser, this.auth.authenticate);
		this.router.route('/checktoken').post(this.bodyParser, this.auth.checkAuth);
		this.router.route('/revoketoken').post(this.bodyParser, this.auth.revokeAuth);
		this.router.route('/refreshtoken').get(this.bodyParser, this.auth.refreshToken);
		this.router.use(auth.checkAuth);
		if (controller) {
			this.addController(controller);
		}
	}
}
