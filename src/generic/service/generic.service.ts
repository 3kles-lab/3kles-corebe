import { IGenericAPI } from '../../api/IGenericAPI';
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
				const param = this.apiUtils.buildRequest(this.parameters[type].option, null,
					(data.body && Object.keys(data.body).length > 0) ? JSON.stringify(data.body) : null);
				param.path = this.setParams(param.path, data.params);
				param.headers = { ...param.headers, ...this.setHeaders(type, data.headers) };

				const response = await this.apiUtils.executeRequest(param);
				return {
					data: response.body,
					totalCount: response.headers['total-count'] || Array.isArray(response.body) ? response.body.length : 1
				};
			}
		} catch (e) {
			throw e;
		}
	}

	public setParams(path: string, params: { [key: string]: any }): string {
		Object.keys(params).forEach(key => {
			path = path.replace(`:${key}`, params[key]);
		});
		return path;
	}
}
