interface IGenericApp {
	initAppVariable(): void;
	initModule(): void;
	initRoute(): void;
	initError(): void;
	startApp(port: number): void;
}
export { IGenericApp };
