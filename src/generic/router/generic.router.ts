import { AbstractGenericRouter } from './index.generic.router';
import { IGenericController } from '../controller/index.generic.controller';
import { GenericHandler } from '../handler/generic.handler';
import { RouterOptions } from 'express';
import { OpenApiRouteRegistration } from '../openapi';

// Class to create a router from a GenericController
export class GenericRouter extends AbstractGenericRouter {
    public readonly openApiRoutes: OpenApiRouteRegistration[] = [];

    constructor(controller?: IGenericController, options?: RouterOptions) {
        super(options);
        if (controller) {
            this.addController(controller);
        }
    }

    public addController(controller: IGenericController, checker?: any): void {
        if (controller) {
            const handler = controller.getOption()?.handler?.handler || new GenericHandler().handler;
            const serviceParams = controller.getServiceParams();

            if (serviceParams) {
                for (const key of Object.keys(serviceParams)) {
                    const definition = serviceParams[key];
                    const middlewares = definition.middlewares || [];
                    const route = this.normalizeRoute(definition.path ?? key);

                    const method = definition.method ?? 'GET';

                    this.registerOpenApiRoute(key, method, route, definition.openapi);

                    switch (method) {
                        case 'GET':
                            this.router.route(route).get(...middlewares, controller.execute(key), handler);
                            break;
                        case 'POST':
                            this.router.route(route).post(...middlewares, controller.execute(key), handler);
                            break;
                        case 'PUT':
                            this.router.route(route).put(...middlewares, controller.execute(key), handler);
                            break;
                        case 'DELETE':
                            this.router.route(route).delete(...middlewares, controller.execute(key), handler);
                            break;
                        case 'PATCH':
                            this.router.route(route).patch(...middlewares, controller.execute(key), handler);
                            break;
                        case 'SEARCH':
                            this.router.route(route).search(...middlewares, controller.execute(key), handler);
                            break;
                    }
                }
            }
        }
    }

    protected registerOpenApiRoute(
        key: string,
        method: string,
        path: string,
        openapi?: OpenApiRouteRegistration['operation'],
    ): void {
        if (openapi?.enabled === false) {
            return;
        }

        this.openApiRoutes.push({
            method,
            path,

            operation: {
                operationId: openapi?.operationId ?? key,
                summary: openapi?.summary,

                responses: openapi?.responses ?? {
                    200: {
                        description: 'Successful response',
                    },
                },

                ...openapi,
            },
        });
    }

    private normalizeRoute(route: string): string {
        return route.startsWith('/') ? route : `/${route}`;
    }

    private joinPaths(...paths: string[]): string {
        const result = paths
            .filter(Boolean)
            .map((path) => path.replace(/^\/+|\/+$/g, ''))
            .filter(Boolean)
            .join('/');

        return `/${result}`;
    }
}
