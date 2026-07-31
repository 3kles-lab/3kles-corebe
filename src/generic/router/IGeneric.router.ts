import { IGenericController } from '../controller/index.generic.controller';
import * as express from 'express';
import { OpenApiRouteRegistration } from '../openapi';

interface IGenericRouter {
    router: express.Router;
    addController(controller: IGenericController, checker?: any): void;
    openApiRoutes?(): readonly OpenApiRouteRegistration[];
}
export { IGenericRouter };
