import { IGenericAPI } from './IGenericAPI';
import { IParserResponse } from '../utils/index.utils';

export abstract class AbstractGenericAPI implements IGenericAPI {
	protected responseParser: IParserResponse;
	protected errorParser: IParserResponse;

	public abstract buildRequest(params: any, id?: any, data?: any): any;
	public abstract execute(options: any): Promise<any>;

	public async executeRequest(options: any): Promise<any> {
		try {
			this.beforeExecute();
			const response = await this.execute(options);
			return this.processResponse(response);
		} catch (e) {
			return this.processError(e);
		} finally {
			this.afterExecute();
		}
	}

	public processResponse(response: any): any { return (this.responseParser) ? this.responseParser.parseResponse(response) : response; }
	public processError(error: any): any { return (this.errorParser) ? this.errorParser.parseResponse(error) : error; }
	public beforeExecute(): void { return; }
	public afterExecute(): void { return; }
}
