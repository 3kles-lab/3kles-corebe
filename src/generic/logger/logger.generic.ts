import pino, { Logger } from "pino";
import { ILogger } from "./logger.interface";

export class GenericLogger implements ILogger {
    private logger: Logger;

    constructor(option?: any) {
        this.logger = pino({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            timestamp: pino.stdTimeFunctions.isoTime,
            mixin() {
                return { ...(process.env.SERVICE_NAME && { service: process.env.SERVICE_NAME }) };
            },
            ...option
        });
    }

    trace(obj: any, msg?: string, ...args: any[]): void {
        this.logger.trace(obj, msg, args);
    }

    info(obj: any, msg?: string, ...args: any[]): void {
        this.logger.info(obj, msg, args);
    }

    error(obj: any, msg?: string, ...args: any[]): void {
        this.logger.error(obj, msg, args);
    }

    debug(obj: any, msg?: string, ...args: any[]): void {
        this.logger.debug(obj, msg, args);
    }

    warn(obj: any, msg?: string, ...args: any[]): void {
        this.logger.warn(obj, msg, args);
    }

    fatal(obj: any, msg?: string, ...args: any[]): void {
        this.logger.fatal(obj, msg, args);
    }

    silent(obj: any, msg?: string, ...args: any[]): void {
        this.logger.silent(obj, msg, args);
    }

    child(properties: { [key: string]: any; }): ILogger {
        return this.logger.child(properties);
    }
}
