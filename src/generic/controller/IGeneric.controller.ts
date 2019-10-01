import * as express from 'express';
import { IGenericService } from '../index.generic';

interface IGenericController {
	execute(type: any): any;
	setService(service: IGenericService): void;
	updateParamFromRequest(type: string, req: express.Request): void;
	getParameters(): any;
}
export { IGenericController };
