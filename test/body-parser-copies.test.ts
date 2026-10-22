import type { Request, Response } from 'express';

describe('Body parser context across bundled corebe copies', () => {
    let first: typeof import('../src/generic/router/body-parser');
    let second: typeof import('../src/generic/router/body-parser');

    beforeEach(() => {
        jest.isolateModules(() => { first = require('../src/generic/router/body-parser'); });
        jest.isolateModules(() => { second = require('../src/generic/router/body-parser'); });
    });

    it('honours a parser override even when the inherited router and controller use separate copies', async () => {
        const request = {} as Request;
        const parser = jest.fn((_req, _res, next) => next());
        first.deferBodyParser(request, parser);
        second.clearBodyParser(request);
        await first.parsePendingBody(request, {} as Response);
        expect(parser).not.toHaveBeenCalled();
    });

    it('executes the nearest router fallback once across copies', async () => {
        const request = {} as Request;
        const outer = jest.fn((_req, _res, next) => next());
        const inner = jest.fn((_req, _res, next) => next());
        first.deferBodyParser(request, outer);
        second.deferBodyParser(request, inner);
        await first.parsePendingBody(request, {} as Response);
        await second.parsePendingBody(request, {} as Response);
        expect(outer).not.toHaveBeenCalled();
        expect(inner).toHaveBeenCalledTimes(1);
    });
});
