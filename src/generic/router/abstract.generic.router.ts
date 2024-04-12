import * as express from 'express';
import { IGenericRouter } from './IGeneric.router';
import { IGenericController } from '../controller/index.generic.controller';

// Class to create a router from a GenericController
export abstract class AbstractGenericRouter implements IGenericRouter {
	public router: express.Router = express.Router(this.options);

	constructor(protected options?: express.RouterOptions) {

	}

	public abstract addController(controller: IGenericController, checker?: any): void;
}
