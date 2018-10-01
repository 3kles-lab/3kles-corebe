import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as express from 'express';
import { NextFunction, Request, Response, Error } from 'express-validation';
import * as morgan from 'morgan';
import * as path from 'path';
import { AbstractGenericApp } from './abstract.generic.app';
import { AbstractGenericRouter } from '../../index';

// Class to create an Express Server from CRUD router and optional port
export class GenericApp extends AbstractGenericApp {
	protected router: AbstractGenericRouter;
	// constructor(public router: AbstractGenericRouter, port: number, private middleware?: string) {
	constructor(private middleware?: string) {
		super();
		this.initAppVariable();
		this.initModule();
		this.initRoute();
		this.initError();
		// this.startApp(port);
	}

	public initAppVariable(): void {
		this.app.set('PORT', process.env.PORT || this.app.get('PORT'));
		this.app.set('LOG', process.env.LOG || false);
		this.app.set('HELMET', process.env.HELMET || false);
		this.app.set('COMPRESSION', process.env.COMPRESSION || false);
		this.app.set('SECURE_ROUTE', process.env.SECURE_ROUTE || false);
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
	}

	public initRoute(): void {
		// Middleware root from CRUDRouter
		if (this.router) {
			if (this.middleware) {
				this.app.use('/' + this.middleware, this.router.router);
			} else {
				this.app.use('/', this.router.router);
			}
		}
	}

	public initError(): void {
		this.app.use(this.logErrors);
		this.app.use(this.clientErrorHandler);
		this.app.use(this.errorHandler);
	}

	public setMainRouter(router: AbstractGenericRouter): void {
		this.router = router;
		this.initRoute();
	}

	protected logErrors(err: Error, req: Request, res: Response, next: NextFunction): void {
		console.error(err.stack);
		next(err);
	}

	protected clientErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
		if (req.xhr) {
			res.status(500).send({ error: 'Something failed!' });
		} else {
			next(err);
		}
	}

	protected errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
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
