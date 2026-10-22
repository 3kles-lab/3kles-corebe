import * as express from 'express';
import * as bodyParser from 'body-parser';
import request = require('supertest');
import { GenericApp, GenericController, GenericRouter, IGenericService } from '../src';

function application(options?: { limit?: number; extended?: boolean }) {
    return new GenericApp('api', undefined, {
        ...options,
        metricRegister: {
            register: {}, metrics: async () => '', addMetric: () => undefined,
            collect: () => (_req, res, next) => { res.setHeader('x-metrics-active', 'true'); next(); },
        },
    });
}

describe('Application parsing compatibility', () => {
    let errors: jest.SpyInstance;
    beforeEach(() => { errors = jest.spyOn(console, 'error').mockImplementation(() => undefined); });
    afterEach(() => errors.mockRestore());

    it('parses JSON before validators declared by a subclass of a CRUD router', async () => {
        const validated: unknown[] = [];
        const validate: express.RequestHandler = (req, _res, next) => {
            validated.push(req.body);
            if (!req.body || !('value' in req.body)) return next(Object.assign(new Error('Missing body'), { status: 400 }));
            next();
        };
        const controller = new GenericController({
            getServiceParams: () => undefined,
            execute: async (_type, req) => ({ type: 'json', data: req.body }),
        } as IGenericService);
        class CrudRouter extends GenericRouter {
            override addController(c: GenericController): void {
                super.addController(c);
                const crud = express.Router();
                crud.post('/', validate, c.execute('add'));
                this.router.use('/templates', crud);
            }
        }
        class TemplateRouter extends CrudRouter {
            override addController(c: GenericController): void {
                this.router.route('/templates/:id').all(validate).patch(c.execute('update'));
                super.addController(c);
            }
        }
        const app = application();
        app.addRoute(new TemplateRouter(controller).router);
        const value = { value: false, empty: {}, zero: 0 };
        for (const method of ['post', 'patch'] as const) {
            const path = method === 'post' ? '/api/templates' : '/api/templates/id';
            const response = await request(app.getApp())[method](path).send(value).expect(200);
            expect(response.body).toEqual(value);
        }
        expect(validated).toEqual([value, value]);
    });

    it('retains default parsing for plain Express routers and direct application handlers', async () => {
        const app = application({ extended: true });
        const processes = express.Router();
        processes.post('/', (req, res) => res.json(req.body));
        app.addRoute(processes, 'processes');
        app.getApp().post('/direct', (req, res) => res.json(req.body));
        expect((await request(app.getApp()).post('/api/processes').send({ value: false }).expect(200)).body).toEqual({ value: false });
        expect((await request(app.getApp()).post('/direct').send({ empty: {} }).expect(200)).body).toEqual({ empty: {} });
        expect((await request(app.getApp()).post('/api/processes').type('form').send('user[name]=Alice').expect(200)).body)
            .toEqual({ user: { name: 'Alice' } });
    });

    it('isolates raw uploads from preceding legacy routers, while keeping common middleware and authentication', async () => {
        const app = application({ limit: 32 });
        const legacy = express.Router();
        legacy.post('/metadata', (req, res) => res.json(req.body));
        app.addRoute(legacy);
        const files = express.Router();
        let uploads = 0;
        files.post('/', (req, res, next) => {
            if (req.get('authorization') !== 'Bearer internal') return res.status(401).end();
            next();
        }, async (req, res, next) => {
            try {
                const chunks: Buffer[] = [];
                for await (const chunk of req) chunks.push(Buffer.from(chunk));
                uploads++;
                res.status(201).json({ content: Buffer.concat(chunks).toString('base64'), contentType: req.get('content-type') });
            } catch (error) { next(error); }
        });
        app.addRoute(files, 'files', { parser: false });
        const bytes = 'malformed JSON file\n' + 'x'.repeat(150_000);
        for (const mime of ['application/json', 'application/xml', 'application/x-ndjson', 'application/octet-stream', 'application/x-www-form-urlencoded']) {
            const result = await request(app.getApp()).post('/api/files').set('authorization', 'Bearer internal')
                .set('content-type', mime).send(bytes).expect(201);
            expect(result.body).toEqual({ content: Buffer.from(bytes).toString('base64'), contentType: mime });
            expect(result.headers['x-content-type-options']).toBe('nosniff');
            expect(result.headers['access-control-allow-origin']).toBe('*');
            expect(result.headers['x-metrics-active']).toBe('true');
        }
        await request(app.getApp()).post('/api/files').type('json').send('invalid').expect(401);
        expect(uploads).toBe(5);
        expect((await request(app.getApp()).post('/api/metadata').send({ value: false }).expect(200)).body).toEqual({ value: false });
        await request(app.getApp()).post('/api/metadata').type('json').send('{broken').expect(400);
        await request(app.getApp()).post('/api/metadata').send({ value: 'x'.repeat(100) }).expect(413);
    });

    it('uses a selected mount parser before validators instead of the application defaults', async () => {
        const app = application({ limit: 16 });
        const text = express.Router();
        text.post('/', (req, res) => res.json({ text: req.body }));
        app.addRoute(text, 'text', { parser: bodyParser.text({ type: 'application/json', limit: '1kb' }) });
        const content = 'invalid JSON, interpreted as text';
        expect((await request(app.getApp()).post('/api/text').type('json').send(content).expect(200)).body).toEqual({ text: content });
        await request(app.getApp()).post('/api/text').type('json').send('x'.repeat(1100)).expect(413);
    });

    it('retains the previous OpenAPI array argument when registering a normal router', async () => {
        const app = application();
        const router = express.Router();
        router.post('/', (req, res) => res.json(req.body));
        app.addRoute(router, 'metadata', []);
        expect((await request(app.getApp()).post('/api/metadata').send({ value: 0 }).expect(200)).body).toEqual({ value: 0 });
    });
});
