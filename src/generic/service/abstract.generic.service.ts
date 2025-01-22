import { IGenericService, ExecuteOption, ServiceParams } from './IGeneric.service';

export abstract class AbstractGenericService implements IGenericService {

	protected parameters: ServiceParams;

	constructor(params?: ServiceParams) {
		if (params) this.parameters = params;
	}

	public abstract execute(type: string, data: any, option?: ExecuteOption): Promise<{ data: any, totalCount?: number }>;


	public getServiceParams(): ServiceParams {
		return this.parameters;
	}

	public setServiceParams(params: ServiceParams): void {
		this.parameters = params;
	}

	public setHeaders(type: string, headers: { [key: string]: string }): { [key: string]: string } {
		return {};
	}

	public setCustomHeaders(type: string, data: any): { [key: string]: string } {
		return {};
	}

}
