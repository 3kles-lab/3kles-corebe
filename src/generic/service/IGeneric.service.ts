interface IGenericService {
	execute(type: string, data: any): Promise<{ data: any, totalCount?: number }>;
	getParameters(): ServiceParams;
	setParameters(param: ServiceParams): void;
}

type ServiceParams = {
	[key: string] : {
		path: string;
		method: string;
		option?: any;
		middlewares?: any[];
	}
};

export { IGenericService, ServiceParams };
