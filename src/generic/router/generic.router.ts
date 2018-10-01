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
					if (controller.getParameters()[key].method === 'GET') {
						this.router.route('/' + key).post(controller.execute(key));
					}
				}
			}
		}
	}

}
