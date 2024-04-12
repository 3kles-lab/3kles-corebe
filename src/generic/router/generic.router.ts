import { AbstractGenericRouter } from './index.generic.router';
import { IGenericController } from '../controller/index.generic.controller';
import { GenericHandler } from '../handler/generic.handler';
import { RouterOptions } from 'express';

// Class to create a router from a GenericController
export class GenericRouter extends AbstractGenericRouter {

	constructor(controller?: IGenericController, options?: RouterOptions) {
		super(options);
		if (controller) {
			this.addController(controller);
		}
	}

	public addController(controller: IGenericController, checker?: any): void {
		if (controller) {
			const handler = controller.getOption()?.handler?.handler || new GenericHandler().handler;

			for (const key of Object.keys(controller.getParameters())) {
				const middlewares = controller.getParameters()[key].middlewares || [];
				let route = (controller.getParameters()[key].path) ? controller.getParameters()[key].path : key;
				route = (route.startsWith("/") ? "" : "/") + route;
				if (controller.getParameters()[key].method) {
					switch (controller.getParameters()[key].method) {
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
