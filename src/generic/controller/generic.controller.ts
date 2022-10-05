import * as express from 'express';
import { ControllerOption, GenericService } from '../index.generic';
import { AbstractGenericController } from './abstract.generic.controller';
import { ExtendableError } from '../../utils/extendable-error';

export class GenericController extends AbstractGenericController {

	constructor(s?: GenericService, o?: ControllerOption) {
		super(s, o);
	}

	public execute(type: string): any {
		return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
			try {
				this.updateParamFromRequest(type, req);

				if (this.option?.validation) {
					const { error } = this.option.validation(type, req.body);
					if (error) {
						throw new ExtendableError(error.message, 400);
					}
				}

				req.query.per_page = req.query.per_page && +req.query.per_page >= 0 ? req.query.per_page : '0';
				req.query.page = req.query.page && +req.query.page > 0 ? req.query.page : '1';

				const response = await this.service.execute(type, req);
				if (!response) throw new ExtendableError(type + '-not-found', 404);

				this.setResponseHeader(res, response);

				res.json(this.parseResponse(response.data, type));
			} catch (err) {
				next(err);
			}
		};
	}

	// tslint:disable-next-line:no-empty
	public updateParamFromRequest(type: string, req: express.Request): void { }

	public setResponseHeader(res: express.Response, response: { data: any, totalCount?: number }): void {
		if (Array.isArray(response.data)) {
			res.setHeader('Total-Count', response.totalCount);
		}
	}

}
