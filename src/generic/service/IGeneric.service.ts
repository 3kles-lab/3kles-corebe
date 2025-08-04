import { CookieOptions } from 'express';

interface IGenericService {
    execute(type: string, data: any, option?: { abortSignal?: AbortSignal }): Promise<ServiceResponse | undefined>;
    getServiceParams(): ServiceParams;
    setServiceParams(param: ServiceParams): void;
    setHeaders(type: string, headers: { [key: string]: string }): { [key: string]: string };
    setCustomHeaders(type: string, data: any): { [key: string]: string };
}

interface ICookieOperation {
    name: string;
    value?: string;
    options?: CookieOptions;
    action: 'set' | 'clear';
}

type ResponseType = 'json' | 'send' | 'end' | 'redirect' | 'download' | 'sendFile' | 'render' | 'stream';

interface IServiceBaseResponse {
    statusCode?: number;
    headers?: Record<string, string | number | string[] | undefined>;
    type?: ResponseType;
    data?: any;
    cookies?: ICookieOperation[];
}

interface IJsonResponse extends IServiceBaseResponse {
    type?: 'json';
    data: any;
}

interface ISendResponse extends IServiceBaseResponse {
    type: 'send';
    data: any;
}

interface IEndResponse extends IServiceBaseResponse {
    type: 'end';
}

interface IRedirectResponse extends IServiceBaseResponse {
    type: 'redirect';
    redirectUrl: string;
}

interface IDownloadResponse extends IServiceBaseResponse {
    type: 'download';
    data: string; // absolute file path
    filename: string;
}

interface ISendFileResponse extends IServiceBaseResponse {
    type: 'sendFile';
    data: string; // absolute file path
}

interface IRenderResponse extends IServiceBaseResponse {
    type: 'render';
    viewName: string;
    viewData?: Record<string, any>;
}

interface IStreamResponse extends IServiceBaseResponse {
    type: 'stream';
    data: NodeJS.ReadableStream;
}

type ServiceResponse =
    | IJsonResponse
    | ISendResponse
    | IEndResponse
    | IRedirectResponse
    | IDownloadResponse
    | ISendFileResponse
    | IRenderResponse
    | IStreamResponse;

type ServiceParams = {
    [key: string]: {
        path: string;
        method: string;
        option?: any;
        middlewares?: any[];
        headerKeys?: string[];
        responseType?: 'json' | 'stream';
    };
};

type ExecuteOption = {
    abortSignal?: AbortSignal; // to stop process execution
};

export {
    IGenericService,
    ServiceParams,
    ExecuteOption,
    ServiceResponse,
    IServiceBaseResponse,
    IJsonResponse,
    ISendResponse,
    IEndResponse,
    IRedirectResponse,
    IDownloadResponse,
    ISendFileResponse,
    IRenderResponse,
    IStreamResponse,
};
