export type OpenApiHttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

export type OpenApiSchemaType = 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean';

export interface OpenApiReference {
    $ref: string;
}

export interface OpenApiSchema {
    type?: OpenApiSchemaType;
    format?: string;
    title?: string;
    description?: string;
    example?: unknown;
    default?: unknown;
    nullable?: boolean;
    readOnly?: boolean;
    writeOnly?: boolean;

    required?: string[];
    properties?: Record<string, OpenApiSchema | OpenApiReference>;
    items?: OpenApiSchema | OpenApiReference;
    enum?: unknown[];

    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;

    oneOf?: Array<OpenApiSchema | OpenApiReference>;
    anyOf?: Array<OpenApiSchema | OpenApiReference>;
    allOf?: Array<OpenApiSchema | OpenApiReference>;

    additionalProperties?: boolean | OpenApiSchema | OpenApiReference;
}

export interface OpenApiMediaType {
    schema?: OpenApiSchema | OpenApiReference;
    example?: unknown;
    examples?: Record<string, unknown>;
}

export interface OpenApiParameter {
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    schema: OpenApiSchema | OpenApiReference;
    example?: unknown;
}

export interface OpenApiRequestBody {
    description?: string;
    required?: boolean;
    content: Record<string, OpenApiMediaType>;
}

export interface OpenApiResponse {
    description: string;
    headers?: Record<string, unknown>;
    content?: Record<string, OpenApiMediaType>;
}

export interface OpenApiOperation {
    enabled?: boolean;
    summary?: string;
    description?: string;
    operationId?: string;
    tags?: string[];
    deprecated?: boolean;

    parameters?: OpenApiParameter[];
    requestBody?: OpenApiRequestBody;

    responses?: Record<string, OpenApiResponse | OpenApiReference>;
    security?: Array<Record<string, string[]>>;
}

export interface OpenApiPathItem {
    get?: OpenApiOperation;
    post?: OpenApiOperation;
    put?: OpenApiOperation;
    patch?: OpenApiOperation;
    delete?: OpenApiOperation;
    head?: OpenApiOperation;
    options?: OpenApiOperation;
}

export interface OpenApiSecurityScheme {
    type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
    description?: string;

    scheme?: string;
    bearerFormat?: string;

    name?: string;
    in?: 'query' | 'header' | 'cookie';

    openIdConnectUrl?: string;
    flows?: Record<string, unknown>;
}

export interface OpenApiComponents {
    schemas?: Record<string, OpenApiSchema | OpenApiReference>;
    responses?: Record<string, OpenApiResponse | OpenApiReference>;
    securitySchemes?: Record<string, OpenApiSecurityScheme>;
}

export interface OpenApiServer {
    url: string;
    description?: string;
}

export interface OpenApiDocument {
    openapi: string;

    info: {
        title: string;
        version: string;
        description?: string;
    };

    servers?: OpenApiServer[];
    tags?: Array<{
        name: string;
        description?: string;
    }>;

    paths: Record<string, OpenApiPathItem>;
    components?: OpenApiComponents;
    security?: Array<Record<string, string[]>>;
}

export interface OpenApiRouteRegistration {
    method: string;
    path: string;
    operation: OpenApiOperation;
}
