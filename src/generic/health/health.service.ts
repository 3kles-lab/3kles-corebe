import { AbstractGenericService } from "../service/abstract.generic.service";

export class HealthCheckService extends AbstractGenericService {

	public async execute(type: string, data: any): Promise<any> {
		if (type === 'healthcheck') {
			return await this.healthCheck();
		}
	}

	public async healthCheck(): Promise<{ data: any, totalCount?: number }> {
		const version = process.env.npm_package_version;
		const used = process.memoryUsage();
		const memory = Object.keys(used).map((key) => ({ [key]: `${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB` }))
			.reduce((a, b) => ({ ...a, ...b }), {});

		return {
			data: {
				version,
				memory
			},
			totalCount: 1
		};

	}
}
