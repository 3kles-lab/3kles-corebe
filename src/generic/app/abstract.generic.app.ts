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
			dotenv.config({ path: '.env.prod' });
		} else if (process.env.NODE_ENV === 'developement') {
			dotenv.config({ path: '.env.dev' });
		} else {
			dotenv.config({ path: '.env' });
		}
	}

	public abstract initAppVariable(): void;

	public abstract initModule(): void;

	public abstract initRoute(): void;

	public abstract initHealthCheck(): void;

	public abstract initError(): void;

	public startApp(port?: number): void {
		let appPort: number = Number(process.env.PORT);
		if (port) {
			appPort = port;
		}
		if (appPort) {
			this.app.listen(appPort || 3000, () => {
				console.log('Service Generic listening on port ' + port);
			});
		}
	}

	public getApp(): express.Application {
		return this.app;
	}

}
