interface IGenericService {
	execute(type: string, data: any): any;
	getParameters(): any;
}
export { IGenericService };
