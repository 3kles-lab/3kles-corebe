interface IHttpOptions {
	protocol?: string;
	hostname: string;
	port: number;
	path: string;
	method: string;
	rejectUnauthorized: boolean;
	headers: any;
}

interface IRequestParameter {
	protocol?: string;
	host: string;
	port?: number;
	user?: string;
	password?: string;
}

export { IHttpOptions, IRequestParameter };
