import { IGenericController } from '../controller/index.generic.controller';
import { AbstractSecureRouter } from './abstract.secure.router';
import { GenericHandler } from '../index.generic';

// Class to create a router from a GenericController
export class SecureRouter extends AbstractSecureRouter {

	public addController(controller: IGenericController, checker?: any): void {
		if (controller) {
			const handler = controller.getOption()?.handler?.handler || new GenericHandler().handler;
			const serviceParams = controller.getServiceParams();

			if(serviceParams){
				for (const key of Object.keys(serviceParams)) {
					const middlewares = serviceParams[key].middlewares || [];
					let route = (serviceParams[key].path) ? serviceParams[key].path : key;
					route = (route.startsWith("/") ? "" : "/") + route;
					if (serviceParams[key].method) {
						switch (serviceParams[key].method) {
							case 'GET':
								this.router.route(route).get(...middlewares, controller.execute(key), handler);
								break;
							case 'POST':
								this.router.route(route).post(...middlewares, controller.execute(key), handler);
								break;
							case 'PUT':
								this.router.route(route).put(...middlewares, controller.execute(key), handler);
								break;
							case 'DELETE':
								this.router.route(route).delete(...middlewares, controller.execute(key), handler);
								break;
							case 'PATCH':
								this.router.route(route).patch(...middlewares, controller.execute(key), handler);
								break;
							case 'SEARCH':
								this.router.route(route).search(...middlewares, controller.execute(key), handler);
								break;
						}
					} else {
						this.router.route('/' + route).get(...middlewares, controller.execute(key), handler);
					}
				}
			}
			
		}
	}

}
