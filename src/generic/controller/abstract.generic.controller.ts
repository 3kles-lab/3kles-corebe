import * as express from 'express';
import { IGenericService, ServiceParams } from '../index.generic';
import { ControllerOption, IGenericController } from './IGeneric.controller';

export abstract class AbstractGenericController implements IGenericController {

	protected service: IGenericService;
	protected parameters: ServiceParams = {};
	protected option: ControllerOption;

	constructor(s?: IGenericService, option?: ControllerOption) {
		if (s) {
			this.setService(s);
		}
		if (option) {
			this.setOption(option);
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

	public getOption(): any {
		return this.option;
	}

	public setService(s: IGenericService): void {
		this.service = s;
		this.parameters = this.service.getParameters();
	}

	public setOption(handler: any): void {
		this.option = handler;
	}

	public getParameters(): ServiceParams {
		return this.parameters;
	}

	public setParameters(params: any): void {
		this.parameters = params;
	}

	// tslint:disable-next-line: no-empty
	public setResponseHeader(res: express.Response<any, Record<string, any>>, response: { data: any; totalCount?: number; }): void { }
}
