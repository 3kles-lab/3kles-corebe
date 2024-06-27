import { GenericApp, GenericRouter, GenericService, GenericController, HttpApi, IHttpOptions, ServiceParams } from './index';
import { JSONParser } from './utils/index.utils';

const parameters: ServiceParams = {
	listSelections: {
		path: 'selections',
		method: 'GET',
		middlewares: [
			(req, res, next) => {
				console.log('hello');
				next();
			}
		],
		option: {
			hostname: "localhost",
			port: 4000,
			path: "/MNS150MI/GetUserData",
			method: "GET",
			rejectUnauthorized: false
		}
	},
	getSelection: {
		path: 'selections/:id',
		method: 'GET',
		option: {
			hostname: "localhost",
			port: 12100,
			path: "/selections/:id",
			method: "GET",
			rejectUnauthorized: false
		}
	}
};

const middlewares = 'api';
const app: GenericApp = new GenericApp(middlewares);
const httpjsonapi: HttpApi = new HttpApi();
httpjsonapi.setResponseParser(new JSONParser());
httpjsonapi.setErrorParser(new JSONParser());
const service: GenericService = new GenericService(httpjsonapi, parameters);
const controller: GenericController = new GenericController(service);
const router: GenericRouter = new GenericRouter(controller);
app.setMainRouter(router);
app.startApp(40001);

const routes = [];
app.getRouter().router.stack.forEach((m) => {
	if (m.route) {
		// routes.push(Object.keys(m.route.methods) + " -> " + middlewares + m.route.path);
	}
});

console.log(JSON.stringify(routes, null, 4));
module.exports = app.getApp(); // For Mocha Testing
