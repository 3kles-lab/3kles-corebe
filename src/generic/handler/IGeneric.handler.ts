import * as express from 'express';

interface IGenericHandler {
	handler(data: any, req: express.Request, res: express.Response, next: express.NextFunction): any;
}
export { IGenericHandler };
