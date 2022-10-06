
interface IGenericAPI {
	buildRequest(params: any, id?: any, data?: string): any; // Function to create request options
	executeRequest(options: any): Promise<{ statusCode: number, headers: any, body: any }>; // Function to execute request and manage response
	processResponse(response: any): any; // Process reponse from execute request
	processError(error: any): any; // Process error response from execute
	beforeExecute(): void;
	afterExecute(): void;
}
export { IGenericAPI };
