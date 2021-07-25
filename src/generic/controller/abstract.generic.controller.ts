import * as express from 'express';
import { IGenericService } from '../index.generic';
import { IGenericController } from './IGeneric.controller';

export abstract class AbstractGenericController implements IGenericController {

	protected service: IGenericService;
	protected parameters: any = [];

	constructor(s?: IGenericService) {
		if (s) {
			this.setService(s);
		}
	}

	public abstract execute(type: string): any;
	public abstract updateParamFromRequest(type: string, req: express.Request): void;
	public parseResponse(response: any, type?: string): any {
		return response;
	}

	public getService(): IGenericService {
		return this.service;
	}

	public setService(s: IGenericService): void {
		this.service = s;
		this.parameters = this.service.getParameters();
	}

	public getParameters(): any {
		return this.parameters;
	}

	public setParameters(params: any): void {
		this.parameters = params;
	}
}
