import { Request } from 'express-validation';
import { IGenericService } from '../index.generic';

interface IGenericController {
	execute(type: any): any;
	setService(service: IGenericService): void;
	updateParamFromRequest(type: string, req: Request): void;
	getParameters(): any;
}
export { IGenericController };
