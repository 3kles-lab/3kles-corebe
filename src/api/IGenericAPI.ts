
interface IHttpExecuteRequestOption {
	signal?: AbortSignal;
	requestStream?: NodeJS.ReadableStream;
	responseType?: 'buffer' | 'stream';
}

interface IHttpApiResponse {
	statusCode: number;
	headers: any;
	body: any;
}

interface IGenericAPI {
	buildRequest(params: any, originDataRequest?: any, dataBody?: string): any; // Function to create request options
	executeRequest(options: any, requestOption?: IHttpExecuteRequestOption): Promise<IHttpApiResponse>; // Function to execute request and manage response
	processResponse(response: any): any; // Process reponse from execute request
	processError(error: any): any; // Process error response from execute
	beforeExecute(): void;
	afterExecute(): void;
}
export { IGenericAPI, IHttpApiResponse, IHttpExecuteRequestOption };
