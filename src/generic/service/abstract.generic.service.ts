import { IGenericService } from './IGeneric.service';

export abstract class AbstractGenericService implements IGenericService {
	protected parameters: any;

	public abstract async execute(type: string, data: any): Promise<any>;

	public getParameters(): any {
		return this.parameters;
	}

	public setParameters(params: any): void {
		this.parameters = params;
	}
}
