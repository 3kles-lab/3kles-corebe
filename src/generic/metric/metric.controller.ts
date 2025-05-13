import { Response, Request, NextFunction } from "express";
import { GenericController } from "../controller/generic.controller";
import { ExtendableError } from "../../utils/extendable-error";
import { MetricService } from "./metric.service";
import { ControllerOption } from "../controller/IGeneric.controller";

export class MetricController extends GenericController {

    constructor(protected service: MetricService, o?: ControllerOption) {
        super(service, o);
    }

    public execute(type: string): any {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const response = await this.service.execute(type, req);
                if (!response) throw new ExtendableError(type + '-not-found', 404);
                this.setResponseHeader(res, response);
                res.end(response.data);
            } catch (err) {
                next(err);
            }
        };
    }



    public setResponseHeader(res: Response<any, Record<string, any>>, response: { data: any; totalCount?: number; contentType?: any }): void {
        res.set('Cache-Control', 'no-store');
        if (response.contentType) {
            res.set('Content-Type', response.contentType);
        }
        return super.setResponseHeader(res, response);
    }
}
