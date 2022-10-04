import * as express from 'express';
import { IGenericHandler } from '../handler/IGeneric.handler';
import { IGenericService } from '../index.generic';

interface IGenericController {
	execute(type: any): any;
	getService(): IGenericService;
	getHandler(): IGenericHandler;
	setService(service: IGenericService): void;
	setHandler(service: IGenericHandler): void;
	updateParamFromRequest(type: string, req: express.Request): void;
	parseResponse(response: any, type?: string): any;
	getParameters(): any;
	setParameters(params: any): void;
}
export { IGenericController };
