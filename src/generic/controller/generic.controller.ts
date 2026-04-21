import * as express from 'express';
import { ControllerOption, IGenericService, ServiceResponse } from '../index.generic';
import { AbstractGenericController } from './abstract.generic.controller';
import { ExtendableError } from '../../utils/extendable-error';

export class GenericController extends AbstractGenericController {
    constructor(s?: IGenericService, o?: ControllerOption) {
        if (!o?.formatResponse) {
            o = {
                ...o,
                formatResponse: (type, req, res, data) => {
                    return data;
                },
            };
        }
        super(s, o);
    }

    public execute(type: string): any {
        return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const abortController = new AbortController();
            const signal = abortController.signal;
            const abortHandler = () => {
                abortController.abort();
            };

            req.socket.once('close', abortHandler);
            try {
                this.updateParamFromRequest(type, req);

                if (this.option?.validation) {
                    const { error } = this.option.validation(type, req.body);
                    if (error) {
                        throw new ExtendableError(error.message, 400);
                    }
                }

                if (this.option.formatRequest) {
                    this.option.formatRequest(type, req);
                } else {
                    req.query.per_page = req.query.per_page && +req.query.per_page >= 0 ? req.query.per_page : '0';
                    req.query.page = req.query.page && +req.query.page > 0 ? req.query.page : '1';
                }

                const response = await this.service.execute(type, req, { abortSignal: signal });
                if (!response) throw new ExtendableError(type + '-not-found', 404);

                if (!response.type) {
                    response.type = 'json';
                }

                this.setResponseHeader(res, response);
                this.handleResponse(type, req, res, response);
            } catch (err) {
                next(err);
            } finally {
                req.socket.removeListener('close', abortHandler);
            }
        };
    }

    // tslint:disable-next-line:no-empty
    public updateParamFromRequest(type: string, req: express.Request): void {}

    public setResponseHeader(res: express.Response, response: ServiceResponse): void {
        if (response.headers) {
            for (const [key, value] of Object.entries(response.headers)) {
                res.setHeader(key, value);
            }
        }

        if (response.cookies) {
            response.cookies.forEach((cookie) => {
                if (cookie.action === 'set') {
                    res.cookie(cookie.name, cookie.value ?? '', cookie.options ?? {});
                } else if (cookie.action === 'clear') {
                    res.clearCookie(cookie.name, cookie.options ?? {});
                }
            });
        }
    }

    public handleResponse(type: string, req: express.Request, res: express.Response, response: ServiceResponse): void {
        switch (response.type) {
            case 'json':
                res.status(response.statusCode || 200).json(
                    this.option.formatResponse(type, req, res, this.parseResponse(response.data, type)),
                );
                break;

            case 'send':
                res.status(response.statusCode || 200).send(
                    this.option.formatResponse(type, req, res, this.parseResponse(response.data, type)),
                );
                break;

            case 'download':
                res.status(response.statusCode || 200).download(response.data, response.filename);
                break;

            case 'sendFile':
                res.status(response.statusCode || 200).sendFile(response.data);
                break;

            case 'stream':
                res.status(response.statusCode || 200);
                response.data.pipe(res);
                break;

            case 'redirect':
                res.redirect(response.statusCode || 302, response.redirectUrl || '/');
                break;

            case 'render':
                res.status(response.statusCode || 200).render(response.viewName, response.viewData || {});
                break;

            case 'end':
                res.status(response.statusCode || 204).end();
                break;
        }
    }
}
