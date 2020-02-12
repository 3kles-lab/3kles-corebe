import * as express from 'express';
import { IGenericService } from '../index.generic';

interface IGenericController {
	execute(type: any): any;
	setService(service: IGenericService): void;
	updateParamFromRequest(type: string, req: express.Request): void;
	parseResponse(response: any, type?: string): any;
	getParameters(): any;
	setParameters(params: any): void;
}
export { IGenericController };
