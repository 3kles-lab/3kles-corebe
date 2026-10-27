import * as express from 'express';
import * as bodyParser from 'body-parser';
import request = require('supertest');
import { createBodyParser, GenericApp, GenericController, GenericRouter, IGenericService } from '../src';

function application(options?: { limit?: number; extended?: boolean }) {
    return new GenericApp('api', undefined, {
        ...options,
        metricRegister: {
            register: {}, metrics: async () => '', addMetric: () => undefined,
            collect: () => (_req, res, next) => { res.setHeader('x-metrics-active', 'true'); next(); },
        },
    });
}

function controller() {
    return new GenericController({
        getServiceParams: () => ({ save: { path: '/', method: 'POST' } }),
        execute: async (_type, req) => ({ type: 'json', data: req.body }),
    } as unknown as IGenericService);
}

describe('Router-owned body parsing', () => {
    let errors: jest.SpyInstance;
    beforeEach(() => { errors = jest.spyOn(console, 'error').mockImplementation(() => undefined); });
    afterEach(() => errors.mockRestore());

    it('has no application parser: a native upload registered normally receives untouched JSON', async () => {
        const app = application({ limit: 16 });
        app.addRoute(new GenericRouter(controller()).router, 'metadata');
        const files = express.Router();
        files.post('/', async (req, res) => {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            res.json({ bytes: Buffer.concat(chunks).toString('base64'), body: req.body ?? null });
        });
        app.addRoute(files, 'files');
        const bytes = '{invalid JSON file' + 'x'.repeat(150000);
        const response = await request(app.getApp()).post('/api/files').type('json').send(bytes).expect(200);
        expect(response.body).toEqual({ bytes: Buffer.from(bytes).toString('base64'), body: null });
        expect(response.headers['x-metrics-active']).toBe('true');
        await request(app.getApp()).post('/api/metadata').type('json').send('{broken').expect(400);
        await request(app.getApp()).post('/api/metadata').send({ value: 'x'.repeat(100) }).expect(413);
    });

    it('retains app form options in default router parsing and supports native routers explicitly', async () => {
        const app = application({ extended: true });
        app.addRoute(new GenericRouter(controller()).router, 'metadata');
        const native = express.Router();
        native.use(createBodyParser());
        native.post('/', (req, res) => res.json(req.body));
        app.addRoute(native, 'native');
        for (const path of ['/api/metadata', '/api/native']) {
            expect((await request(app.getApp()).post(path).type('form').send('user[name]=Alice').expect(200)).body)
                .toEqual({ user: { name: 'Alice' } });
        }
    });

    it('uses the configured router parser before validation instead of JSON defaults', async () => {
        const app = application({ limit: 16 });
        const validate = jest.fn((req, _res, next) => { expect(typeof req.body).toBe('string'); next(); });
        const c = new GenericController({
            getServiceParams: () => ({ save: { path: '/', method: 'POST', middlewares: [validate] } }),
            execute: async (_type, req) => ({ type: 'json', data: { text: req.body } }),
        } as unknown as IGenericService);
        app.addRoute(new GenericRouter(c, { parser: bodyParser.text({ type: 'application/json', limit: '1kb' }) }).router, 'text');
        const text = 'invalid JSON, interpreted as text';
        expect((await request(app.getApp()).post('/api/text').type('json').send(text).expect(200)).body).toEqual({ text });
        expect(validate).toHaveBeenCalledTimes(1);
        await request(app.getApp()).post('/api/text').type('json').send('x'.repeat(1100)).expect(413);
    });

    it('does not parse an unmatched path or method in an earlier router mounted on /', async () => {
        const app = application({ limit: 16 });
        const c = new GenericController({
            getServiceParams: () => ({ read: { method: 'GET', path: '/files' } }),
            execute: async () => ({ data: {} }),
        } as unknown as IGenericService);
        app.addRoute(new GenericRouter(c).router);
        const raw = express.Router();
        raw.post('/files', async (req, res) => {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            res.send(Buffer.concat(chunks));
        });
        app.addRoute(raw);
        const content = '{broken file';
        expect((await request(app.getApp()).post('/api/files').type('json').send(content).expect(200)).body.toString()).toBe(content);
    });
});
