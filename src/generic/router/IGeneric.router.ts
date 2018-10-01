import { IGenericController } from '../controller/index.generic.controller';

interface IGenericRouter {
	addController(controller: IGenericController, checker?: any): void;
}
export { IGenericRouter };
