import { IGenericAPI } from '../../api/IGenericAPI';
import { ExtendableError } from '../../utils/extendable-error';
import { AbstractGenericService } from './abstract.generic.service';
import { ServiceParams } from './IGeneric.service';

export class GenericService extends AbstractGenericService {
	protected apiUtils: IGenericAPI;

	constructor(api: IGenericAPI, params?: ServiceParams) {
		super(params);
		this.apiUtils = api;
	}

	public async execute(type: string, data: any): Promise<any> {
		try {
			if (this.parameters[type]) {
				const query = data.query ? new URLSearchParams(data.query).toString() : '';
				if (!this.parameters[type].option?.path) {
					this.parameters[type].option.path = this.parameters[type].path;
				}
				const param = this.apiUtils.buildRequest(this.parameters[type].option, data,
					(data.body && Object.keys(data.body).length > 0) ? JSON.stringify(data.body) : null);
				param.path = this.setParams(param.path, data.params);
				if (query) {
					param.path += `?${query}`;
				}

				param.headers = {
					...param.headers,
					...(this.parameters[type].headerKeys && this.parameters[type].headerKeys.filter((key) => data.headers[key]).map((key) => ({ [key]: data.headers[key] })).reduce((a, b) => ({ ...a, ...b }), {})),
					...this.setHeaders(type, data.headers)
				};

				const response = await this.apiUtils.executeRequest(param);
				return {
					data: response.body,
					totalCount: response.headers['total-count'] || (Array.isArray(response.body) ? response.body.length : 1)
				};
			}
		} catch (e) {
			// throw e;
			throw new ExtendableError(e.body?.error, e.statusCode);
		}
	}

	public setParams(path: string, params: { [key: string]: any }): string {
		Object.keys(params).forEach(key => {
			path = path.replace(`:${key}`, params[key]);
		});
		return path;
	}
}
