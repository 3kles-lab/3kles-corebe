import { Request } from 'express-validation';
import { IGenericService } from '../index.generic';
import { IGenericController } from './IGeneric.controller';

export abstract class AbstractGenericController implements IGenericController {

	protected service: IGenericService;

	constructor(s?: IGenericService) {
		this.service = s;
	}

	public abstract execute(type: string): any;
	public abstract updateParamFromRequest(type: string, req: Request): void;

	public setService(s: IGenericService): void {
		this.service = s;
	}

	public getParameters(): any {
		return this.service.getParameters();
	}
}
