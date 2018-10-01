import * as dotenv from 'dotenv';
import * as express from 'express';
import { IGenericApp } from './IGenericApp';

// Class to create an Express Server from CRUD router and optional port
export abstract class AbstractGenericApp implements IGenericApp {

	protected app: express.Application;

	constructor() {
		this.app = express();
		// DETECT MODE
		if (process.env.NODE_ENV === 'production') {
			dotenv.load({ path: '.env.prod' });
		} else if (process.env.NODE_ENV === 'developement') {
			dotenv.load({ path: '.env.dev' });
		} else {
			dotenv.load({ path: '.env' });
		}
	}

	public abstract initAppVariable(): void;

	public abstract initModule(): void;

	public abstract initRoute(): void;

	public abstract initError(): void;

	public startApp(port: number): void {
		this.app.listen(port, () => {
			console.log('Service Generic listening on port ' + port);
		});
	}

	public getApp(): express.Application {
		return this.app;
	}

	protected addRoute(router: express.Router, middleware?: any): void {
		if (middleware) {
			this.app.use('/' + middleware, router);
		} else {
			this.app.use('/', router);
			const routes = [];
			router.stack.forEach((m: any) => {
				if (m.route) {
					routes.push(Object.keys(m.route.methods) + " -> " + m.route.path);
				}
			});
			console.log('Route for ', middleware, ' :', JSON.stringify(routes, null, 4));
		}
	}

}
