import {
    OpenApiDocument,
    OpenApiHttpMethod,
    OpenApiOperation,
    OpenApiResponse,
    OpenApiRouteRegistration,
    OpenApiSchema,
    OpenApiSecurityScheme,
} from './openapi.interface';

export interface OpenApiRegistryOptions {
    title: string;
    version: string;
    description?: string;
    servers?: Array<{
        url: string;
        description?: string;
    }>;
}

export class OpenApiRegistry {
    private readonly document: OpenApiDocument;

    constructor(options: OpenApiRegistryOptions) {
        this.document = {
            openapi: '3.0.3',
            info: {
                title: options.title,
                version: options.version,
                description: options.description,
            },
            servers: options.servers,
            paths: {},
            components: {
                schemas: {},
                responses: {},
                securitySchemes: {},
            },
        };
    }

    public addRoute(method: string, expressPath: string, operation: OpenApiOperation): void {
        if (operation.enabled === false) {
            return;
        }
        const openApiMethod = method.toLowerCase();
        if (!this.isSupportedMethod(openApiMethod)) {
            return;
        }
        const path = this.toOpenApiPath(expressPath);
        this.document.paths[path] ??= {};
        const pathItem = this.document.paths[path];

        const { enabled: _enabled, ...openApiOperation } = operation;
        pathItem[openApiMethod] = {
            ...openApiOperation,
            responses: openApiOperation.responses ?? {
                200: {
                    description: 'Successful response',
                },
            },
        };
    }

    public addRoutes(routes: readonly OpenApiRouteRegistration[], basePath = ''): void {
        for (const route of routes) {
            this.addRoute(route.method, this.joinPaths(basePath, route.path), route.operation);
        }
    }

    public addSchema(name: string, schema: OpenApiSchema): void {
        this.document.components ??= {};
        this.document.components.schemas ??= {};
        this.document.components.schemas[name] = schema;
    }

    public addResponse(name: string, response: OpenApiResponse): void {
        this.document.components ??= {};
        this.document.components.responses ??= {};
        this.document.components.responses[name] = response;
    }

    public addSecurityScheme(name: string, securityScheme: OpenApiSecurityScheme): void {
        this.document.components ??= {};
        this.document.components.securitySchemes ??= {};
        this.document.components.securitySchemes[name] = securityScheme;
    }

    public setGlobalSecurity(security: Array<Record<string, string[]>>): void {
        this.document.security = security;
    }

    public getDocument(): OpenApiDocument {
        return this.document;
    }

    private toOpenApiPath(expressPath: string): string {
        const normalizedPath = this.normalizePath(expressPath);
        return normalizedPath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
    }

    private normalizePath(path: string): string {
        const result = `/${path}`.replace(/\/+/g, '/').replace(/\/$/, '');
        return result || '/';
    }

    private isSupportedMethod(method: string): method is OpenApiHttpMethod {
        return ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method);
    }

    private joinPaths(...parts: string[]): string {
        const path = parts
            .filter(Boolean)
            .map((part) => part.replace(/^\/+|\/+$/g, ''))
            .filter(Boolean)
            .join('/');

        return path ? `/${path}` : '/';
    }
}
