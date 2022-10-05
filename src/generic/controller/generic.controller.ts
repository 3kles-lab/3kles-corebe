import * as express from 'express';
import { GenericService } from '../index.generic';
import { AbstractGenericController } from './abstract.generic.controller';
import { ExtendableError } from '../../utils/extendable-error';
import { IGenericHandler } from '../handler/IGeneric.handler';

export class GenericController extends AbstractGenericController {

	constructor(s?: GenericService, h?: IGenericHandler) {
		super(s, h);
	}

	public execute(type: string): any {
		return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
			try {
				this.updateParamFromRequest(type, req);

				req.query.per_page = req.query.per_page && +req.query.per_page >= 0 ? req.query.per_page : '0';
				req.query.page = req.query.page && +req.query.page > 0 ? req.query.page : '1';

				const response = await this.service.execute(type, req);
				if (!response) throw new ExtendableError(type + '-not-found', 404);

				if (Array.isArray(response.data)) {
					res.setHeader('Total-Count', response.totalCount);
				}

				res.json(this.parseResponse(response.data, type));
			} catch (err) {
				next(err);
			}
		};
	}

	// tslint:disable-next-line:no-empty
	public updateParamFromRequest(type: string, req: express.Request): void { }

}
