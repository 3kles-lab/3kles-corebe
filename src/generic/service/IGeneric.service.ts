interface IGenericService {
	execute(type: string, data: any): void;
	getParameters(): any;
}
export { IGenericService };
