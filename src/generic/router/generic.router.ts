import { AbstractGenericRouter } from './index.generic.router';
import { IGenericController } from '../controller/index.generic.controller';

// Class to create a router from a GenericController
export class GenericRouter extends AbstractGenericRouter {

	constructor(controller?: IGenericController) {
		super();
		if (controller) {
			this.addController(controller);
		}
	}

	public addController(controller: IGenericController, checker?: any): void {
		if (controller) {
			for (const key of Object.keys(controller.getParameters())) {
				if (controller.getParameters()[key].method) {
					switch (controller.getParameters()[key].method) {
						case 'GET':
							this.router.route('/' + key).get(controller.execute(key));
							break;
						case 'POST':
							this.router.route('/' + key).post(controller.execute(key));
							break;
						case 'PUT':
							this.router.route('/' + key).put(controller.execute(key));
							break;
						case 'DELETE':
							this.router.route('/' + key).delete(controller.execute(key));
							break;
						case 'PATCH':
							this.router.route('/' + key).patch(controller.execute(key));
							break;
						case 'SEARCH':
							this.router.route('/' + key).search(controller.execute(key));
							break;
					}
				} else {
					this.router.route('/' + key).get(controller.execute(key));
				}
			}
		}
	}

}
