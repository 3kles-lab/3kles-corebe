interface IHttpOptions {
	protocol?: string;
	hostname: string;
	port: number;
	path: string;
	method: string;
	rejectUnauthorized: boolean;
	headers: any;
	data?: any;
	signal?: AbortSignal;
}

interface IRequestParameter {
	protocol?: string;
	host: string;
	port?: number;
	user?: string;
	password?: string;
}

export { IHttpOptions, IRequestParameter };
