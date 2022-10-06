import { IGenericService, ServiceParams } from './IGeneric.service';

export abstract class AbstractGenericService implements IGenericService {
	protected parameters: ServiceParams;

	public abstract execute(type: string, data: any): Promise<{ data: any, totalCount?: number }>;

	public getParameters(): ServiceParams {
		return this.parameters;
	}

	public setParameters(params: ServiceParams): void {
		this.parameters = params;
	}
}
