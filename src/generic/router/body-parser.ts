import type { OptionsJson } from 'body-parser';
import type { Request, RequestHandler, Response, RouterOptions } from 'express';

/** Undefined selects JSON; false leaves the HTTP request stream untouched. */
export type RouteParser = RequestHandler | false;

export interface GenericRouterOptions extends RouterOptions {
    jsonParserOptions?: OptionsJson;
}

/** Application defaults read when a router is mounted in GenericApp. */
export const APP_JSON_PARSER_OPTIONS = '3kles.jsonParserOptions';

// Consuming libraries may bundle their own corebe copy. Share the request marker
// across those copies so an explicit parser can cancel any inherited fallback.
const pendingParserKey = Symbol.for('@3kles/3kles-corebe.pendingBodyParser');
type ParserRequest = Request & { [pendingParserKey]?: RequestHandler };

export function deferBodyParser(request: Request, parser: RequestHandler): void {
    (request as ParserRequest)[pendingParserKey] = parser;
}

export function clearBodyParser(request: Request): void {
    delete (request as ParserRequest)[pendingParserKey];
}

/** Fallback for inherited routes that call a controller without route middleware. */
export async function parsePendingBody(request: Request, response: Response): Promise<void> {
    const parser = (request as ParserRequest)[pendingParserKey];
    if (!parser) return;
    clearBodyParser(request);
    await new Promise<void>((resolve, reject) => {
        parser(request, response, error => error ? reject(error) : resolve());
    });
}
