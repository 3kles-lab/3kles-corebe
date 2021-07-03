import { AbstractGenericRouter } from './index.generic.router';
import { IGenericController } from '../controller/index.generic.controller';
import { IAuth } from '../auth/IAuth';
import { AbstractSecureRouter } from './abstract.secure.router';

// Class to create a router from a GenericController
export class SecureRouter extends AbstractSecureRouter {

	public addController(controller: IGenericController, checker?: any): void {
		if (controller) {
			for (const key of Object.keys(controller.getParameters())) {
				const route = (controller.getParameters()[key].path) ? controller.getParameters()[key].path : key;
				if (controller.getParameters()[key].method) {
					switch (controller.getParameters()[key].method) {
						case 'GET':
							this.router.route('/' + route).get(controller.execute(key));
							break;
						case 'POST':
							this.router.route('/' + route).post(controller.execute(key));
							break;
						case 'PUT':
							this.router.route('/' + route).put(controller.execute(key));
							break;
						case 'DELETE':
							this.router.route('/' + route).delete(controller.execute(key));
							break;
						case 'PATCH':
							this.router.route('/' + route).patch(controller.execute(key));
							break;
						case 'SEARCH':
							this.router.route('/' + route).search(controller.execute(key));
							break;
					}
				} else {
					this.router.route('/' + route).get(controller.execute(key));
				}
			}
		}
	}

}
