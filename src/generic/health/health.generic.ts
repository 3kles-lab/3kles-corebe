import { IHealth } from "./health.interface";

export class GenericHealth implements IHealth {

	public async status(): Promise<any> {
		const serviceVersion = process.env.SERVICE_VERSION;
		const applicationVersion = process.env.APP_VERSION;
		const commit = process.env.CI_COMMIT_SHORT_SHA;
		const buildTime = process.env.APP_BUILD_TIME;
		const used = process.memoryUsage();
		const uptime = process.uptime();

		const memory = Object.keys(used).map((key) => ({ [key]: `${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB` }))
			.reduce((a, b) => ({ ...a, ...b }), {});
		return {
			status: 'ok',
			serviceVersion, applicationVersion,
			commit, buildTime, memory, uptime
		};
	}
}
