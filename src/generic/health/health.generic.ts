import { IHealth } from "./health.interface";

export class GenericHealth implements IHealth {

	public async status(): Promise<any> {
		const version = process.env.npm_package_version;
		const used = process.memoryUsage();

		const memory = Object.keys(used).map((key) => ({ [key]: `${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB` }))
			.reduce((a, b) => ({ ...a, ...b }), {});
		return { version, memory };
	}
}
