import { Response } from "express";
import { GenericController } from "../controller/generic.controller";

export class HealthController extends GenericController {

	public setResponseHeader(res: Response<any, Record<string, any>>, response: { data: any; totalCount?: number; }): void {
		res.set('Cache-Control', 'no-store');
		return super.setResponseHeader(res, response);
	}
}
