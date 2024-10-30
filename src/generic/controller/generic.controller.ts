import * as express from 'express';
import { ControllerOption, GenericService, IGenericService } from '../index.generic';
import { AbstractGenericController } from './abstract.generic.controller';
import { ExtendableError } from '../../utils/extendable-error';

export class GenericController extends AbstractGenericController {

	constructor(s?: IGenericService, o?: ControllerOption) {
		if (!o?.formatResponse) {
			o = {
				...o,
				formatResponse: (type, req, res, data) => {
					return data;
				}
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

			req.on('aborted', abortHandler);
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

				this.setResponseHeader(res, response);

				res.json(this.option.formatResponse(type, req, res, this.parseResponse(response.data, type)));
			} catch (err) {
				next(err);
			} finally {
				req.off('aborted', abortHandler);
			}
		};
	}

	// tslint:disable-next-line:no-empty
	public updateParamFromRequest(type: string, req: express.Request): void { }

	public setResponseHeader(res: express.Response, response: { data: any, totalCount?: number }): void {
		if (response.totalCount) {
			res.setHeader('Total-Count', response.totalCount);
		}
	}

}
