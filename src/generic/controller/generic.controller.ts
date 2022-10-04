import * as express from 'express';
import { GenericService } from '../index.generic';
import { AbstractGenericController } from './abstract.generic.controller';
import { ExtendableError } from '../../utils/extendable-error';
import { IGenericHandler } from '../handler/IGeneric.handler';

export class GenericController extends AbstractGenericController {

	constructor(s?: GenericService, h?:IGenericHandler) {
		super(s, h);
	}

	public execute(type: string): any {
		return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
			try {
				this.updateParamFromRequest(type, req);

				const data = {
                    headers: req.headers,
                    params: req.params,
                    query: req.query,
                    body: req.body,
				};

				const response = await this.service.execute(type, data);
				if (!response) throw new ExtendableError(type + '-not-found', 404);
				res.json(this.parseResponse(response, type));
			} catch (err) {
				next(err);
			}
		};
	}

	// tslint:disable-next-line:no-empty
	public updateParamFromRequest(type: string, req: express.Request): void { }

}
