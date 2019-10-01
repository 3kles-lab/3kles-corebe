import * as express from 'express';
import { GenericService } from '../index.generic';
import { AbstractGenericController } from './abstract.generic.controller';
import { ExtendableError } from '../../utils/extendable-error';

export class GenericController extends AbstractGenericController {

	constructor(s: GenericService) {
		super(s);
	}

	public execute(type: string): any {
		return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
			try {
				this.updateParamFromRequest(type, req);
				const response = await this.service.execute(type, req.body);
				if (!response) throw new ExtendableError(type + '-not-found', 404);
				res.json(response);
			} catch (err) {
				next(err);
			}
		};
	}

	// tslint:disable-next-line:no-empty
	public updateParamFromRequest(type: string, req: express.Request): void { }

}
