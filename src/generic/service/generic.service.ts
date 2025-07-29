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

    public async execute(type: string, data: any, option?: ExecuteOption): Promise<ServiceResponse> {
        try {
            if (this.parameters[type]) {
                const query = data.query ? stringify(data.query) : '';
                if (!this.parameters[type].option?.path) {
                    this.parameters[type].option.path = this.parameters[type].path;
                }
                const param = this.apiUtils.buildRequest(
                    this.parameters[type].option,
                    data,
                    data.body && Object.keys(data.body).length > 0 ? JSON.stringify(data.body) : null,
                );
                param.path = this.setParams(param.path, data.params);
                if (query) {
                    param.path += `?${query}`;
                }

                param.headers = {
                    ...param.headers,
                    ...(this.parameters[type].headerKeys &&
                        this.parameters[type].headerKeys
                            .filter((key) => data.headers[key])
                            .map((key) => ({ [key]: data.headers[key] }))
                            .reduce((a, b) => ({ ...a, ...b }), {})),
                    ...this.setHeaders(type, data.headers),
                    ...this.setCustomHeaders(type, data),
                };

                const response = await this.apiUtils.executeRequest(param, { signal: option?.abortSignal });
                return {
                    data: response.body,
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
                    type: this.parameters[type].responseType || 'json',
                };
            }
        } catch (e) {
            throw new ExtendableError(e.body?.error, e.statusCode);
        }
    }

    public setParams(path: string, params: { [key: string]: any }): string {
        Object.keys(params).forEach((key) => {
            path = path.replace(`:${key}`, encodeURIComponent(params[key]));
        });
        return path;
    }
}
