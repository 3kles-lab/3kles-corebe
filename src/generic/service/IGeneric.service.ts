interface IGenericService {
	execute(type: string, data: any): Promise<{ data: any, totalCount?: number }>;
	getParameters(): any;
	setParameters(param: any): void;
}
export { IGenericService };
