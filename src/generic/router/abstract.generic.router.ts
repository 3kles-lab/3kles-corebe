import * as express from 'express';
import { createBodyParser, GenericRouterOptions } from './body-parser';
import { IGenericRouter } from './IGeneric.router';
import { IGenericController } from '../controller/index.generic.controller';

// Class to create a router from a GenericController
export abstract class AbstractGenericRouter implements IGenericRouter {
	public router: express.Router;
	protected readonly bodyParser: express.RequestHandler;
	private readonly bodyParserPaths = new Set<string>();

	constructor(protected options?: GenericRouterOptions) {
		const { parser, ...routerOptions } = options ?? {};
		this.router = express.Router(routerOptions);
		this.bodyParser = createBodyParser(options);
	}

	/** Mount once on a manual router's scope, before inherited validators. */
	protected useBodyParser(path: string): void {
		if (this.bodyParserPaths.has(path)) return;
		this.bodyParserPaths.add(path);
		this.router.use(path, this.bodyParser);
	}

	public abstract addController(controller: IGenericController, checker?: any): void;
}
