import { AbstractGenericService } from "../service/abstract.generic.service";
import { ServiceParams } from "../service/IGeneric.service";
import { IMetricRegistry } from "./registry.interface";

export class MetricService extends AbstractGenericService {

	constructor(protected register: IMetricRegistry, params?: ServiceParams) {
		super(params);
	}

	public async execute(type: string, data: any): Promise<any> {
		if (type === 'metrics') {
			return await this.metrics();
		}
	}

	public async metrics(): Promise<{ data: any, totalCount?: number, contentType?: string }> {
		return {
			data: await this.register.metrics(),
			contentType: this.register.contentType,
			totalCount: 1
		};
	}
}
