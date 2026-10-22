import type { OptionsJson } from 'body-parser';
import type { RequestHandler, RouterOptions } from 'express';
import type { OpenApiRouteRegistration } from '../openapi';

/** Undefined selects JSON; false leaves the HTTP request stream untouched. */
export type RouteParser = RequestHandler | false;

export interface GenericRouterOptions extends RouterOptions {
    jsonParserOptions?: OptionsJson;
}

/** Application defaults read when a router is mounted in GenericApp. */
export const APP_JSON_PARSER_OPTIONS = '3kles.jsonParserOptions';

/** A dedicated router can run with its selected parser before the app defaults. */
export interface RouteRegistrationOptions {
    parser?: RouteParser;
    openApiRoutes?: readonly OpenApiRouteRegistration[];
}
