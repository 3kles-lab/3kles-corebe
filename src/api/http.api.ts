import * as https from 'https';
import * as http from 'http';
import { IGenericAPI } from './IGenericAPI';
import { IHttpOptions, IParserResponse } from '../utils/index.utils';

export class HttpApi implements IGenericAPI {

	protected protocol: string = 'http';
	protected responseParser: IParserResponse;
	protected errorParser: IParserResponse;

	constructor(protocol?: string) {
		if (protocol) {
			this.protocol = protocol;
		}
	}

	// Function to create options request data
	public buildRequest(params: IHttpOptions, id?: any, data?: any): any {
		// console.log("Parameters:", params);
		// Create options request
		if (params.protocol) {
			this.protocol = params.protocol;
		}
		const options: IHttpOptions = params;
		if (data) {
			options.data = data;
		}
		return options;
	}

	// Function to execute request and manage response
	public async executeRequest(options: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.beforeExecute();

			// tslint:disable-next-line:typedef
			function callback(res) {
				// cumulate data
				let body = [];
				res.on('data', (chunk) => {
					body.push(chunk);
				});
				// resolve on end
				res.on('end', () => {
					try {
						body = this.processResponse(body);
					} catch (e) {
						const error = this.processError(e);
						reject(error);
					}
					// reject on bad status
					if (res.statusCode < 200 || res.statusCode > 304) {
						reject({statusCode: res.statusCode, body});
					} else {
						resolve(body);
					}
					
				});
			}

			// console.log('Options: ', options);
			let req;
			if (this.protocol === 'https') {
				req = https.request(options, callback.bind(this));
			} else {
				req = http.request(options, callback.bind(this));
			}
			if (options.data) {
				req.write(options.data);
			}

			req.end();
		});
		this.afterExecute();
	}

	public processResponse(response: any): any {
		return (this.responseParser) ? this.responseParser.parseResponse(response) : response;
	}

	public processError(error: any): any {
		return (this.errorParser) ? this.errorParser.parseResponse(error) : error;
	}

	public beforeExecute(): void {
		// console.log("Before execute");
		return;
	}
	public afterExecute(): void {
		// console.log("After execute");
		return;
	}

	public setResponseParser(parser: IParserResponse): void {
		this.responseParser = parser;
	}

	public setErrorParser(parser: IParserResponse): void {
		this.errorParser = parser;
	}
}
