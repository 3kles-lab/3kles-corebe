import * as https from 'https';
import * as http from 'http';
import { IGenericAPI } from './IGenericAPI';
import { IHttpOptions } from '../utils/interface.utils';

export class HttpApi implements IGenericAPI {

	protected protocol: string = 'http';

	constructor(protocol?: string) {
		if (protocol) {
			this.protocol = protocol;
		}
	}
	// Function to create options request data
	public buildRequest(params: IHttpOptions, id?: any, data?: any): any {
		console.log("Parameters:", params);
		// Create options request
		if (params.protocol) {
			this.protocol = params.protocol;
		}
		const options: IHttpOptions = params;
		return options;
	}

	// Function to execute request and manage response
	public async executeRequest(options: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.beforeExecute();
			// tslint:disable-next-line:typedef
			function callback(res) {
				// reject on bad status
				if (res.statusCode < 200 || res.statusCode > 304) {
					return reject(new Error('statusCode=' + res.statusCode));
				}
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
					resolve(body);
				});
			}
			console.log('Options: ', options);
			let req;
			if (this.protocol === 'https') {
				req = https.request(options, callback.bind(this));
			} else {
				req = http.request(options, callback.bind(this));
			}
			req.write(options.data);
			req.end();
		});
		this.afterExecute();
	}

	public processResponse(response: any): any {
		return response;
	}

	public processError(error: any): any {
		return error;
	}

	public beforeExecute(): void { return; }
	public afterExecute(): void { return; }
}
