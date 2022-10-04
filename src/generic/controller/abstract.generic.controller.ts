import * as express from 'express';
import { IGenericHandler } from '../handler/IGeneric.handler';
import { IGenericService } from '../index.generic';
import { IGenericController } from './IGeneric.controller';

export abstract class AbstractGenericController implements IGenericController {

	protected service: IGenericService;
	protected parameters: any = [];
	protected handler: IGenericHandler;

	constructor(s?: IGenericService, handler?: IGenericHandler) {
		if (s) {
			this.setService(s);
		}
		if(handler){
			this.setHandler(handler);
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

	public getHandler(): IGenericHandler {
		return this.handler;
	}

	public setService(s: IGenericService): void {
		this.service = s;
		this.parameters = this.service.getParameters();
	}
	
	public setHandler(handler: IGenericHandler): void {
		this.handler = handler;
	}

	public getParameters(): any {
		return this.parameters;
	}

	public setParameters(params: any): void {
		this.parameters = params;
	}
}
