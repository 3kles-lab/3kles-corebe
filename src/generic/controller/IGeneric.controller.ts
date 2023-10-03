import * as express from 'express';
import { IGenericHandler } from '../handler/IGeneric.handler';
import { IGenericService, ServiceParams } from '../index.generic';
import { ValidationResult } from 'joi';

interface IGenericController {
	execute(type: any): any;
	getService(): IGenericService;
	getOption(): any;
	setService(service: IGenericService): void;
	setOption(option: any): void;
	updateParamFromRequest(type: string, req: express.Request): void;
	parseResponse(response: any, type?: string): any;
	getParameters(): ServiceParams;
	setParameters(params: ServiceParams): void;
	setResponseHeader(res: express.Response, response: { data: any, totalCount?: number }): void;
}

type ControllerOption = {
	handler?: IGenericHandler;
	validation?: (type: string, data: any) => Partial<ValidationResult>;
	formatRequest?: (type: string, req: express.Request) => void;
	formatResponse?: (type: string, req: express.Request, res: express.Response, data: any) => any;
};

export { IGenericController, ControllerOption };
