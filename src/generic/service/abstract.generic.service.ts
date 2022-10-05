import { IGenericService } from './IGeneric.service';

export abstract class AbstractGenericService implements IGenericService {
	protected parameters: any;

	public abstract execute(type: string, data: any): Promise<{ data: any, totalCount?: number }>;

	public getParameters(): any {
		return this.parameters;
	}

	public setParameters(params: any): void {
		this.parameters = params;
	}
}
