import { IGenericAPI } from '../../api/IGenericAPI';
import { ExtendableError } from '../../utils/extendable-error';
import { hopByHopHeaders } from '../constants';
import { AbstractGenericService } from './abstract.generic.service';
import { ExecuteOption, ServiceParams, ServiceResponse } from './IGeneric.service';
import { stringify } from 'querystring';

export class GenericService extends AbstractGenericService {
    protected apiUtils: IGenericAPI;

    constructor(api: IGenericAPI, params?: ServiceParams) {
        super(params);
        this.apiUtils = api;
    }

    public async execute(type: string, data: any, option?: ExecuteOption): Promise<ServiceResponse | undefined> {
        try {
            if (this.parameters?.[type]) {
                const serviceParameter = this.parameters[type];
                const isRequestStream = serviceParameter.requestType === 'stream';
                const isResponseStream = serviceParameter.responseType === 'stream';
                const query = data.query ? stringify(data.query) : '';
                if (!serviceParameter.option?.path) {
                    serviceParameter.option.path = serviceParameter.path;
                }
                const param = this.apiUtils.buildRequest(
                    serviceParameter.option,
                    data,
                    !isRequestStream && data.body && Object.keys(data.body).length > 0
                        ? JSON.stringify(data.body)
                        : undefined,
                );
                param.path = this.setParams(param.path, data.params);
                if (query) {
                    param.path += `?${query}`;
                }

                param.headers = {
                    ...param.headers,
                    ...(serviceParameter.headerKeys &&
                        serviceParameter.headerKeys
                            .filter((key) => data.headers[key])
                            .map((key) => ({ [key]: data.headers[key] }))
                            .reduce((a, b) => ({ ...a, ...b }), {})),
                    ...this.setHeaders(type, data.headers),
                    ...this.setCustomHeaders(type, data),
                };

                const response = await this.apiUtils.executeRequest(param, {
                    signal: option?.abortSignal,
                    requestStream: isRequestStream ? data : undefined,
                    responseType: isResponseStream ? 'stream' : 'buffer',
                });

                return {
                    data: response.body,
                    statusCode: response.statusCode,
                    headers: (() => {
                        return Object.keys(response.headers)
                            .filter((key) => {
                                return !hopByHopHeaders.has(key.toLowerCase());
                            })
                            .map((key) => {
                                return { [key]: response.headers[key] };
                            })
                            .reduce((a, b) => ({ ...a, ...b }), {});
                    })(),
                    type: serviceParameter.responseType || 'json',
                } as ServiceResponse;
            }
        } catch (e: any) {
            throw new ExtendableError(e.body?.error, e.statusCode, e.body);
        }
    }

    public setParams(path: string, params: { [key: string]: any }): string {
        Object.keys(params).forEach((key) => {
            path = path.replace(`:${key}`, encodeURIComponent(params[key]));
        });
        return path;
    }
}
