import * as express from 'express';
import * as bodyParser from 'body-parser';
import request = require('supertest');
import {
    AbstractGenericRouter, GenericRouter, SecureRouter, GenericController, GenericApp,
    IGenericController, IGenericService, ServiceParams, GenericRouterOptions,
} from '../src';

function controller(params: ServiceParams, execute?: (key: string) => express.RequestHandler): IGenericController {
    return {
        getOption: () => undefined,
        getServiceParams: () => params,
        execute: execute ?? (() => (req, res) => res.json({ body: req.body ?? null, params: req.params })),
    } as unknown as IGenericController;
}

const upload: express.RequestHandler = async (req, res, next) => {
    try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        res.json({ content: Buffer.concat(chunks).toString('base64'), body: req.body ?? null,
            contentType: req.headers['content-type'], params: req.params });
    } catch (error) { next(error); }
};

function application(router: AbstractGenericRouter, mount = '/api') {
    const app = express();
    app.use(mount, router.router);
    app.use(((error, _req, res, _next) => res.status(error.status ?? 500).json({ error: error.message })) as express.ErrorRequestHandler);
    return app;
}

describe('Router body parsers', () => {
    it('keeps parser:false through the real controller', async () => {
        const params: ServiceParams = { upload: { method: 'POST', path: '/files', parser: false } };
        const actualController = new GenericController({
            getServiceParams: () => params,
            execute: async (_type, req) => {
                const chunks: Buffer[] = [];
                for await (const chunk of req) chunks.push(Buffer.from(chunk));
                return { type: 'json', data: { content: Buffer.concat(chunks).toString('base64') } };
            },
        } as IGenericService);
        const content = '{ "bytes": "unchanged" }\n';
        const result = await request(application(new GenericRouter(actualController))).post('/api/files').type('json').send(content).expect(200);
        expect(result.body.content).toBe(Buffer.from(content).toString('base64'));
    });

    it('parses JSON before validation without any application-level parser', async () => {
        const validate: express.RequestHandler = (req, _res, next) => {
            expect(req.body).toEqual({ empty: {}, value: false }); next();
        };
        const app = application(new GenericRouter(controller({ save: { method: 'POST', path: '/metadata', middlewares: [validate] } })));
        const result = await request(app).post('/api/metadata').send({ empty: {}, value: false }).expect(200);
        expect(result.body.body).toEqual({ empty: {}, value: false });
        await request(app).post('/api/metadata').type('json').send('{broken').expect(400);
    });

    it.each(['application/json', 'application/xml', 'application/x-ndjson', 'application/octet-stream'])(
        'keeps %s file bytes intact when parser is false', async contentType => {
            const router = new GenericRouter(controller({ upload: { method: 'POST', path: '/files', parser: false } }, () => upload));
            const text = '\ufeff{\r\n  "duplicate": 1, "duplicate": 2, "value": "été"\r\n}\r\n';
            const result = await request(application(router)).post('/api/files').set('content-type', contentType).send(text).expect(200);
            expect(result.body.content).toBe(Buffer.from(text).toString('base64'));
            expect(result.body.body).toBeNull();
            expect(result.body.contentType).toBe(contentType);
        },
    );

    it('accepts a large or malformed JSON file without invoking the default JSON parser', async () => {
        const router = new GenericRouter(controller({ upload: { method: 'POST', path: '/files', parser: false } }, () => upload));
        const text = 'not valid JSON\n' + 'x'.repeat(150000);
        const result = await request(application(router)).post('/api/files').type('json').send(text).expect(200);
        expect(result.body.content).toBe(Buffer.from(text).toString('base64'));
    });

    it('uses the selected text, raw or form parser without falling back to JSON', async () => {
        const router = new GenericRouter(controller({
            text: { method: 'POST', path: '/text', parser: bodyParser.text({ type: 'application/json' }) },
            raw: { method: 'POST', path: '/raw', parser: bodyParser.raw({ type: 'application/json' }) },
            form: { method: 'POST', path: '/form', parser: bodyParser.urlencoded({ extended: true }) },
        }));
        const app = application(router);
        const text = await request(app).post('/api/text').type('json').send('not JSON').expect(200);
        expect(text.body.body).toBe('not JSON');
        const raw = await request(app).post('/api/raw').type('json').send('bytes').expect(200);
        expect(raw.body.body).toEqual({ type: 'Buffer', data: [...Buffer.from('bytes')] });
        const form = await request(app).post('/api/form').type('form').send('user[name]=Alice').expect(200);
        expect(form.body.body).toEqual({ user: { name: 'Alice' } });
    });

    it('resolves the parser by HTTP method and preserves mounted and route parameters', async () => {
        const router = new GenericRouter(controller({
            save: { method: 'PUT', path: '/files/:fileId' },
            upload: { method: 'POST', path: '/files/:fileId', parser: false },
        }, key => key === 'upload' ? upload : (_req, res) => res.json({ parsed: _req.body, params: _req.params })), { mergeParams: true });
        const app = application(router, '/workspaces/:workspaceId');
        const text = '{ "value": false }';
        const [file, metadata] = await Promise.all([
            request(app).post('/workspaces/ws/files/file').type('json').send(text).expect(200),
            request(app).put('/workspaces/ws/files/file').type('json').send(text).expect(200),
        ]);
        expect(file.body.content).toBe(Buffer.from(text).toString('base64'));
        expect(file.body.params).toEqual({ workspaceId: 'ws', fileId: 'file' });
        expect(metadata.body.parsed).toEqual({ value: false });
        expect(metadata.body.params).toEqual({ workspaceId: 'ws', fileId: 'file' });
    });

    it('uses the same Express path and case matching as the actual router', async () => {
        const router = new GenericRouter(controller({ upload: { method: 'POST', path: '/Files/:id', parser: false } }, () => upload),
            { caseSensitive: true, strict: true });
        const app = application(router);
        const result = await request(app).post('/api/Files/id').type('json').send('raw').expect(200);
        expect(result.body.content).toBe(Buffer.from('raw').toString('base64'));
        await request(app).post('/api/files/id').expect(404);
        await request(app).post('/api/Files/id/').expect(404);
    });

    it('applies a custom parser once and propagates its error without executing validation', async () => {
        const parser = jest.fn<ReturnType<express.RequestHandler>, Parameters<express.RequestHandler>>((_req, _res, next) =>
            next(Object.assign(new Error('Rejected by selected parser'), { status: 422 })));
        const validate = jest.fn((_req, _res, next) => next());
        const router = new GenericRouter(controller({ save: { method: 'POST', path: '/metadata', parser, middlewares: [validate] } }));
        const result = await request(application(router)).post('/api/metadata').send({ value: 1 }).expect(422);
        expect(result.body.error).toBe('Rejected by selected parser');
        expect(parser).toHaveBeenCalledTimes(1);
        expect(validate).not.toHaveBeenCalled();
    });

    it.each(['HEAD', 'OPTIONS'] as const)('selects an explicit parser for %s routes', async method => {
        const parser = jest.fn<ReturnType<express.RequestHandler>, Parameters<express.RequestHandler>>((_req, res, next) => {
            res.setHeader('x-selected-parser', method); next();
        });
        const router = new GenericRouter(controller({ action: { method, path: '/metadata', parser } }, () => (_req, res) => res.status(204).end()));
        const call = request(application(router));
        const result = await (method === 'HEAD' ? call.head('/api/metadata') : call.options('/api/metadata')).expect(204);
        expect(result.headers['x-selected-parser']).toBe(method);
        expect(parser).toHaveBeenCalledTimes(1);
    });

    it('retains default parsing for derived CRUD routers that register Express routes directly', async () => {
        const crudController = new GenericController({
            getServiceParams: () => undefined,
            execute: async (_type, req) => ({ data: req.body, type: 'json' }),
        } as IGenericService);
        class CrudRouter extends GenericRouter {
            constructor() {
                super();
                const crud = express.Router();
                crud.post('/', crudController.execute('add'));
                crud.patch('/:id', crudController.execute('update'));
                this.router.use('/models', crud);
            }
        }
        const app = new GenericApp();
        app.addRoute(new CrudRouter().router, 'api');
        expect((await request(app.getApp()).post('/api/models').send({ name: 'Created' }).expect(200)).body).toEqual({ name: 'Created' });
        expect((await request(app.getApp()).patch('/api/models/id').send({ value: false }).expect(200)).body).toEqual({ value: false });
    });

    it('provides the same selection to subclasses of AbstractGenericRouter', async () => {
        class CustomRouter extends AbstractGenericRouter {
            constructor(options?: GenericRouterOptions) {
                super(options);
                this.router.post('/files', this.getParserMiddleware(false), upload);
                this.router.post('/metadata', this.getParserMiddleware(), (req, res) => res.json(req.body));
            }
            addController(): void {}
        }
        const app = application(new CustomRouter({ jsonParserOptions: { limit: 16 } }));
        const raw = await request(app).post('/api/files').type('json').send('x'.repeat(100)).expect(200);
        expect(raw.body.content).toBe(Buffer.from('x'.repeat(100)).toString('base64'));
        await request(app).post('/api/metadata').send({ text: 'x'.repeat(100) }).expect(413);
    });

    it('keeps JSON parsing for authentication and selects parsers for secure business routes', async () => {
        const auth = {
            authenticate: jest.fn(async (req, res) => { res.json(req.body); }),
            checkAuth: jest.fn((_req, _res, next) => next()),
            revokeAuth: jest.fn((_req, res) => res.end()),
            refreshToken: jest.fn(async (_req, res) => { res.end(); }),
        };
        const router = new SecureRouter(auth, controller({
            upload: { method: 'POST', path: '/files', parser: false },
            metadata: { method: 'POST', path: '/metadata' },
        }, key => key === 'upload' ? upload : (req, res) => res.json(req.body)));
        const app = application(router);
        expect((await request(app).post('/api/authenticate').send({ username: 'Alice' }).expect(200)).body).toEqual({ username: 'Alice' });
        const file = await request(app).post('/api/files').type('json').send('raw file').expect(200);
        expect(file.body.content).toBe(Buffer.from('raw file').toString('base64'));
        expect((await request(app).post('/api/metadata').send({ value: false }).expect(200)).body).toEqual({ value: false });
        expect(auth.checkAuth).toHaveBeenCalledTimes(2);
    });
});

describe('GenericApp integration', () => {
    function app(limit: number) {
        const metrics = {
            register: {}, metrics: async () => 'test_metric 1', addMetric: () => undefined,
            collect: () => (_req, res, next) => { res.setHeader('x-metrics-active', 'true'); next(); },
        };
        return new GenericApp(undefined, undefined, { limit, metricRegister: metrics });
    }

    it('preserves uploads after health/metrics routers while retaining common middleware and the JSON size limit', async () => {
        const generic = app(32);
        const crudController = new GenericController({ getServiceParams: () => undefined,
            execute: async (_type, req) => ({ data: req.body, type: 'json' }) } as IGenericService);
        class CrudRouter extends GenericRouter {
            constructor() {
                super();
                const crud = express.Router();
                crud.post('/', crudController.execute('add'));
                this.router.use('/models', crud);
            }
        }
        // An unmatched CRUD router must not consume a following upload request either.
        generic.addRoute(new CrudRouter().router);
        const routes = new GenericRouter(controller({
            file: { method: 'POST', path: '/files', parser: false },
            metadata: { method: 'POST', path: '/metadata' },
        }, key => key === 'file' ? upload : (req, res) => res.json(req.body)));
        generic.addRoute(routes.router, undefined, { parser: false });
        const content = 'invalid JSON file\n' + 'x'.repeat(150000);
        const file = await request(generic.getApp()).post('/files').type('json').send(content).expect(200);
        expect(file.body.content).toBe(Buffer.from(content).toString('base64'));
        expect(file.headers['x-content-type-options']).toBe('nosniff');
        expect(file.headers['access-control-allow-origin']).toBe('*');
        expect(file.headers['x-metrics-active']).toBe('true');
        expect((await request(generic.getApp()).post('/metadata').send({ value: false }).expect(200)).body).toEqual({ value: false });
        expect((await request(generic.getApp()).post('/models').send({ value: false }).expect(200)).body).toEqual({ value: false });
        const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        try {
            await request(generic.getApp()).post('/metadata').send({ content: 'x'.repeat(100) }).expect(413);
            await request(generic.getApp()).post('/models').send({ content: 'x'.repeat(100) }).expect(413);
        } finally { errors.mockRestore(); }
        await request(generic.getApp()).get('/healthcheck').expect(200);
        expect((await request(generic.getApp()).get('/metrics').expect(200)).text).toBe('test_metric 1');
    });

    it('resolves application and router-specific limits independently when mounting the same router twice', async () => {
        const shared = new GenericRouter(controller({ metadata: { method: 'POST', path: '/metadata' } }));
        const small = app(16), large = app(256);
        small.addRoute(shared.router); large.addRoute(shared.router);
        const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        try {
            await request(small.getApp()).post('/metadata').send({ text: 'x'.repeat(100) }).expect(413);
            const result = await request(large.getApp()).post('/metadata').send({ text: 'x'.repeat(100) }).expect(200);
            expect(result.body.body.text).toHaveLength(100);
            const override = new GenericRouter(controller({ metadata: { method: 'POST', path: '/override' } }), { jsonParserOptions: { limit: 256 } });
            small.addRoute(override.router, undefined, { parser: false });
            await request(small.getApp()).post('/override').send({ text: 'x'.repeat(100) }).expect(200);
        } finally { errors.mockRestore(); }
    });
});
