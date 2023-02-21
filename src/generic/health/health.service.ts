import { AbstractGenericService } from "../service/abstract.generic.service";
import { ServiceParams } from "../service/IGeneric.service";
import { IHealth } from "./health.interface";

export class HealthCheckService extends AbstractGenericService {

	constructor(private health: IHealth, params?: ServiceParams) {
		super(params);
	}

	public async execute(type: string, data: any): Promise<any> {
		if (type === 'healthcheck') {
			return await this.healthCheck();
		}
	}

	public async healthCheck(): Promise<{ data: any, totalCount?: number }> {
		return {
			data: await this.health.status(),
			totalCount: 1
		};
	}
}
