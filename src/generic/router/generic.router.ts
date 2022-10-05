import { AbstractGenericRouter } from './index.generic.router';
import { IGenericController } from '../controller/index.generic.controller';
import { GenericHandler } from '../handler/generic.handler';

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
			const handler = controller.getOption()?.handler?.handler || new GenericHandler().handler;

			for (const key of Object.keys(controller.getParameters())) {
				const route = (controller.getParameters()[key].path) ? controller.getParameters()[key].path : key;
				if (controller.getParameters()[key].method) {
					switch (controller.getParameters()[key].method) {
						case 'GET':
							this.router.route('/' + route).get(controller.execute(key), handler);
							break;
						case 'POST':
							this.router.route('/' + route).post(controller.execute(key), handler);
							break;
						case 'PUT':
							this.router.route('/' + route).put(controller.execute(key), handler);
							break;
						case 'DELETE':
							this.router.route('/' + route).delete(controller.execute(key), handler);
							break;
						case 'PATCH':
							this.router.route('/' + route).patch(controller.execute(key), handler);
							break;
						case 'SEARCH':
							this.router.route('/' + route).search(controller.execute(key), handler);
							break;
					}
				} else {
					this.router.route('/' + route).get(controller.execute(key), handler);
				}
			}
		}
	}
}
