import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as express from 'express';
import * as morgan from 'morgan';
import * as path from 'path';
import * as cors from 'cors';
import { AbstractGenericApp } from './abstract.generic.app';
import { AbstractGenericRouter } from '../../index';

// Class to create an Express Server from CRUD router and optional port
export class GenericApp extends AbstractGenericApp {
	protected router: AbstractGenericRouter;
	// constructor(public router: AbstractGenericRouter, port: number, private middleware?: string) {
	constructor(public middleware?: string) {
		super();
		this.initAppVariable();
		this.initModule();
		this.initRoute();
		this.initError();
	}

	public initAppVariable(): void {
		this.app.set('PORT', process.env.PORT || this.app.get('PORT'));
		this.app.set('LOG', process.env.LOG || false);
		this.app.set('HELMET', process.env.HELMET || true);
		this.app.set('COMPRESSION', process.env.COMPRESSION || true);
		this.app.set('SECURE_ROUTE', process.env.SECURE_ROUTE || false);
		this.app.set('CORS', process.env.CORS || true);
	}

	public initModule(): void {
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
		if(this.app.get('CORS') === 'true'){
			this.app.use(cors());
		}
	}

	public initRoute(): void {
		if (this.router) {
			this.addRoute(this.router.router);
		}
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
		if (m) {
			this.app.use('/' + m, router);
		} else if (this.middleware) {
			this.app.use('/' + this.middleware, router);
		} else {
			this.app.use('/', router);
			const routes = [];
			router.stack.forEach((r: any) => {
				if (r.route) {
					routes.push(Object.keys(m.route.methods) + " -> " + m.route.path);
				}
			});
			console.log('Route for :', JSON.stringify(routes, null, 4));
		}
		this.initError();
	}

	public getRouter(): AbstractGenericRouter {
		return this.router;
	}

	protected logErrors(err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void {
		console.error(err.stack);
		next(err);
	}

	protected clientErrorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void {
		if (req.xhr) {
			res.status(500).send({ error: 'Something failed!' });
		} else {
			next(err);
		}
	}

	protected errorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void {
		if (res.headersSent) {
			return next(err);
		}
		res.status(500);
		res.render('error', { error: err });
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
