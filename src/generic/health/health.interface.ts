export interface IHealth {
	status(): Promise<{ [key: string]: any }>;
}
