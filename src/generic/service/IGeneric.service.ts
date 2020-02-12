interface IGenericService {
	execute(type: string, data: any): any;
	getParameters(): any;
	setParameters(param: any): void;
}
export { IGenericService };
