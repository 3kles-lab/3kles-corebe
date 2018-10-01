import { AbstractGenericRouter } from './index.generic.router';
import { IGenericController } from '../controller/index.generic.controller';
import { IAuth } from '../auth/IAuth';
import { AbstractSecureRouter } from './abstract.secure.router';

// Class to create a router from a GenericController
export class SecureRouter extends AbstractSecureRouter {

	public addController(controller: IGenericController, checker?: any): void {
		if (controller) {
			for (const key of Object.keys(controller.getParameters())) {
				if (controller.getParameters()[key].method) {
					if (controller.getParameters()[key].method === 'GET') {
						this.router.route('/' + key).post(controller.execute(key));
					}
				}
			}
		}
	}

}
