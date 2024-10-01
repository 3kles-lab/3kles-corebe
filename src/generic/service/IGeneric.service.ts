interface IGenericService {
	execute(type: string, data: any): Promise<{ data: any, totalCount?: number }>;
	getParameters(): ServiceParams;
	setParameters(param: ServiceParams): void;
	setHeaders(type: string, headers: { [key: string]: string }): { [key: string]: string };
	setCustomHeaders(type: string, data: any): { [key: string]: string };
}

type ServiceParams = {
	[key: string]: {
		path: string;
		method: string;
		option?: any;
		middlewares?: any[];
		headerKeys?: string[];
	}
};

export { IGenericService, ServiceParams };
