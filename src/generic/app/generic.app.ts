import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import * as compression from 'compression';
import * as express from 'express';
import * as morgan from 'morgan';
import * as path from 'path';
import * as cors from 'cors';
import logger from 'pino-http';
import { AbstractGenericApp } from './abstract.generic.app';
import { AbstractGenericRouter, ExtendableError, GenericHealth, GenericRouter, HealthCheckService, HealthController, IHealth } from '../../index';


// Class to create an Express Server from CRUD router and optional port
export class GenericApp extends AbstractGenericApp {
	protected router: AbstractGenericRouter;
	// constructor(public router: AbstractGenericRouter, port: number, private middleware?: string) {
	constructor(public middleware?: string, public health?: IHealth) {
		super();
		if (!health) {
			this.health = new GenericHealth();
		}
		this.initAppVariable();
		this.initModule();
		this.initRoute();
		this.initHealthCheck();
		this.initError();
	}

	public initAppVariable(): void {
		this.app.set('PORT', process.env.PORT || this.app.get('PORT'));
		this.app.set('LOG', process.env.LOG || false);
		this.app.set('HELMET', process.env.HELMET || true);
		this.app.set('COMPRESSION', process.env.COMPRESSION || true);
		this.app.set('SECURE_ROUTE', process.env.SECURE_ROUTE || false);
		this.app.set('CORS', process.env.CORS || true);
		this.app.set('PINO', process.env.PINO || false);
	}

	public initModule(): void {
		if (this.app.get('PINO') === 'true') {
			this.app.use(logger());
		}
		// Use bodyparser to help to communicate with json
		this.app.use('/', express.static(path.join(__dirname, '../public')));
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: false }));

		// Morgan to log
		if (this.app.get('LOG') === 'true') {
			this.app.use(morgan('dev'));
		}
		// Secure App
		if (this.app.get('HELMET') === 'true') {
			this.app.use(helmet());
		}
		// Compress request
		if (this.app.get('COMPRESSION') === 'true') {
			this.app.use(compression());
		}
		if (this.app.get('CORS') === 'true') {
			this.app.use(cors());
		}
	}

	public initRoute(): void {
		if (this.router) {
			this.addRoute(this.router.router);
		}
	}

	public initHealthCheck(): void {
		this.app.use('/', new GenericRouter(new HealthController(new HealthCheckService(
			this.health,
			{
				healthcheck: {
					path: 'healthcheck',
					method: 'GET'
				}
			}))).router);
	}

	public initError(): void {
		this.app.use(this.logErrors);
		this.app.use(this.clientErrorHandler);
		this.app.use(this.errorHandler);
	}

	public setMainRouter(router: AbstractGenericRouter): void {
		this.router = router;
		this.addRoute(this.router.router);
	}

	public addRoute(router: express.Router, m?: any): void {
		this.app.use(`/${[this.middleware, m].filter(n => n && n.length).join('/')}`, router);
		this.initError();
	}

	public getRouter(): AbstractGenericRouter {
		return this.router;
	}

	protected logErrors(err: ExtendableError, req: express.Request, res: express.Response, next: express.NextFunction): void {
		if (err.stack) {
			console.error(err.stack);
		}
		next(err);
	}

	protected clientErrorHandler(err: ExtendableError, req: express.Request, res: express.Response, next: express.NextFunction): void {
		if (req.xhr) {
			res.status(500).json({ error: 'Something failed!' });
		} else {
			next(err);
		}
	}

	protected errorHandler(err: ExtendableError, req: express.Request, res: express.Response, next: express.NextFunction): void {
		if (res.headersSent) {
			return next(err);
		}
		res.status(err.status || 500).json({ error: err.message });
	}

	protected print(p: any, layer: any): void {
		if (layer.route) {
			layer.route.stack.forEach(this.print.bind(null, p.concat(this.split(layer.route.path))));
		} else if (layer.name === 'router' && layer.handle.stack) {
			layer.handle.stack.forEach(this.print.bind(null, p.concat(this.split(layer.regexp))));
		} else if (layer.method) {
			console.log('%s /%s',
				layer.method.toUpperCase(),
				p.concat(this.split(layer.regexp)).filter(Boolean).join('/'));
		}
	}

	protected split(thing: any): any {
		if (typeof thing === 'string') {
			return thing.split('/');
		} else if (thing.fast_slash) {
			return '';
		} else {
			const match = thing.toString()
				.replace('\\/?', '')
				.replace('(?=\\/|$)', '$')
				.match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
			return match
				? match[1].replace(/\\(.)/g, '$1').split('/')
				: '<complex:' + thing.toString() + '>';
		}
	}

}
