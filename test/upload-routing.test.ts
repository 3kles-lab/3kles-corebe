import * as express from 'express';
import request = require('supertest');
import { AbstractGenericService, GenericApp, GenericController, GenericRouter, SecureRouter } from '../src';

class EchoService extends AbstractGenericService {
    async execute(_type: string, request: express.Request) {
        return { type: 'json' as const, data: request.body };
    }
}

function application(limit = 32) {
    return new GenericApp('api', undefined, { limit, metricRegister: {
        register: {}, metrics: async () => 'test_metric 1', addMetric: () => undefined,
        collect: () => (_req, res, next) => { res.setHeader('x-metrics-active', 'true'); next(); },
    } });
}

const upload: express.RequestHandler = async (req, res, next) => {
    try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        res.status(201).json({ bytes: Buffer.concat(chunks).toString('base64'), body: req.body ?? null, params: req.params });
    } catch (error) { next(error); }
};

describe('5.4.1 routing with dedicated upload entry points', () => {
    it.each(['application/json', 'application/xml', 'application/x-ndjson', 'application/octet-stream', 'application/x-www-form-urlencoded'])(
        'preserves %s bytes, even after earlier normal routers', async mime => {
            const app = application();
            const metadata = express.Router();
            metadata.post('/metadata', (req, res) => res.json(req.body));
            app.addRoute(metadata);
            const files = express.Router({ mergeParams: true });
            files.post('/files/:id', upload);
            app.addRoute(files, 'workspaces/:workspaceId', { parser: false });
            const content = '\ufeff{invalid file\r\n' + 'été\0'.repeat(40000);
            const result = await request(app.getApp()).post('/api/workspaces/ws/files/file').set('content-type', mime).send(content).expect(201);
            expect(result.body).toEqual({ bytes: Buffer.from(content).toString('base64'), body: null, params: { workspaceId: 'ws', id: 'file' } });
            expect(result.headers['x-content-type-options']).toBe('nosniff');
            expect(result.headers['access-control-allow-origin']).toBe('*');
            expect(result.headers['x-metrics-active']).toBe('true');
            expect((await request(app.getApp()).post('/api/metadata').send({ empty: {}, value: false }).expect(200)).body)
                .toEqual({ empty: {}, value: false });
            await request(app.getApp()).get('/healthcheck').expect(200);
            expect((await request(app.getApp()).get('/metrics').expect(200)).text).toBe('test_metric 1');
        },
    );

    it('retains default JSON for existing service/controller declarations without new parser options', async () => {
        const app = application(256);
        const validate = jest.fn<ReturnType<express.RequestHandler>, Parameters<express.RequestHandler>>((req, _res, next) => {
            expect(req.body).toEqual({ empty: {}, value: false, zero: 0 }); next();
        });
        const controller = new GenericController(new EchoService({
            save: { method: 'POST', path: '/metadata', middlewares: [validate] },
        }));
        app.addRoute(new GenericRouter(controller).router);
        const result = await request(app.getApp()).post('/api/metadata').send({ empty: {}, value: false, zero: 0 }).expect(200);
        expect(result.body).toEqual({ empty: {}, value: false, zero: 0 });
        expect(validate).toHaveBeenCalledTimes(1);
    });

    it('retains authentication and normal JSON parsing for existing secure routers', async () => {
        const auth = {
            authenticate: jest.fn(async (req, res) => { res.json(req.body); }),
            checkAuth: jest.fn((_req, _res, next) => next()),
            revokeAuth: jest.fn((_req, res) => res.end()),
            refreshToken: jest.fn(async (_req, res) => { res.end(); }),
        };
        const controller = new GenericController(new EchoService({
            save: { method: 'POST', path: '/metadata' },
        }));
        const app = application(256);
        app.addRoute(new SecureRouter(auth, controller).router);
        expect((await request(app.getApp()).post('/api/authenticate').send({ user: 'Alice' }).expect(200)).body).toEqual({ user: 'Alice' });
        expect((await request(app.getApp()).post('/api/metadata').send({ value: false }).expect(200)).body).toEqual({ value: false });
        expect(auth.checkAuth).toHaveBeenCalledTimes(1);
    });
});
