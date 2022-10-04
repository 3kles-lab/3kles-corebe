import { Request, Response, NextFunction } from "express";
import { IGenericHandler } from "./IGeneric.handler";

export class GenericHandler implements IGenericHandler {
    public handler(data: any, req: Request, res: Response, next: NextFunction) {
        next(data);
    }
}
