import { IGenericAPI } from '../../api/IGenericAPI';
import { AbstractGenericService } from './abstract.generic.service';

export class GenericService extends AbstractGenericService {
	protected apiUtils: IGenericAPI;

	constructor(api: IGenericAPI, params?: any) {
		super();
		this.apiUtils = api;
		if (params) this.parameters = params;
	}

	public async execute(type: string, data: any): Promise<any> {
		try {
			if (this.parameters[type]) {
				const param = this.apiUtils.buildRequest(this.parameters[type], null, data);
				const response = await this.apiUtils.executeRequest(param);
				return response;
			}
		} catch (e) {
			throw e;
		}
	}
}
