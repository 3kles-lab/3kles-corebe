import { GenericApp, GenericRouter, GenericService, GenericController, HttpApi, IHttpOptions } from './index';
import { JSONParser } from './utils/index.utils';

const parameters = {
	getproject: {
		hostname: "gitlab.3kles.local",
		port: 80,
		path: "/api/v4/issues?private_token=3KzstUKxhuSbV_CKY7Fy",
		method: "GET",
		rejectUnauthorized: false
	} as IHttpOptions
};

const app: GenericApp = new GenericApp('api');
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
		routes.push(Object.keys(m.route.methods) + " -> " + m.route.path);
	}
});

console.log(JSON.stringify(routes, null, 4));
module.exports = app.getApp(); // For Mocha Testing
