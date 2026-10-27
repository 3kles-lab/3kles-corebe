import * as express from 'express';
import * as bodyParser from 'body-parser';

export interface GenericRouterOptions extends express.RouterOptions {
    /** Omit for JSON/form bodies; false leaves the request stream untouched. */
    parser?: express.RequestHandler | false;
}

/** Body middleware for a router, including native Express routers. */
export function createBodyParser(options?: GenericRouterOptions): express.RequestHandler {
    if (options?.parser === false) return (_req, _res, next) => next();
    if (options?.parser) return options.parser;

    const parsers = new WeakMap<express.Application, express.RequestHandler>();
    return (req, res, next) => {
        let parser = parsers.get(req.app);
        if (!parser) {
            const defaults = req.app.get('bodyParserOptions') ?? {};
            const json = bodyParser.json({ limit: defaults.limit });
            const form = bodyParser.urlencoded({ limit: defaults.limit, extended: defaults.extended ?? false });
            parser = (request, response, done) => {
                json(request, response, error => error ? done(error) : form(request, response, done));
            };
            parsers.set(req.app, parser);
        }
        parser(req, res, next);
    };
}
