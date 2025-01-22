interface IGenericService {
	execute(type: string, data: any, option?: { abortSignal?: AbortSignal }): Promise<{ data: any, totalCount?: number }>;
	getServiceParams(): ServiceParams;
	setServiceParams(param: ServiceParams): void;
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

type ExecuteOption = {
	abortSignal?: AbortSignal;  // to stop process execution
}

export { IGenericService, ServiceParams, ExecuteOption };
