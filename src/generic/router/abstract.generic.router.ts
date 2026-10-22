import * as express from 'express';
import { IGenericRouter } from './IGeneric.router';
import { IGenericController } from '../controller/index.generic.controller';
import * as bodyParser from 'body-parser';
import { APP_JSON_PARSER_OPTIONS, GenericRouterOptions, RouteParser } from './body-parser';

// Class to create a router from a GenericController
export abstract class AbstractGenericRouter implements IGenericRouter {
    public router: express.Router;
    private readonly jsonParsers = new WeakMap<express.Application, express.RequestHandler>();

    constructor(protected options?: GenericRouterOptions) {
        const { jsonParserOptions: _jsonOptions, ...routerOptions } = options ?? {};
        this.router = express.Router(routerOptions);
    }

    /** Install before validators on routes registered directly by a subclass. */
    protected getParserMiddleware(parser?: RouteParser): express.RequestHandler {
        return (request, response, next) => {
            if (parser === false) return next();
            if (parser === undefined) return this.parseJson(request, response, next);
            return parser(request, response, next);
        };
    }

    private parseJson(request: express.Request, response: express.Response, next: express.NextFunction): unknown {
        let parser = this.jsonParsers.get(request.app);
        if (!parser) {
            parser = bodyParser.json({
                ...request.app.get(APP_JSON_PARSER_OPTIONS),
                ...this.options?.jsonParserOptions,
            });
            this.jsonParsers.set(request.app, parser);
        }
        return parser(request, response, next);
    }

    public abstract addController(controller: IGenericController, checker?: any): void;
}
