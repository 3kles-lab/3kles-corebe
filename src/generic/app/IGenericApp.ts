import { Server } from "http";

interface IGenericApp {
	initAppVariable(): void;
	initModule(): void;
	initRoute(): void;
	initError(): void;
	startApp(port?: number): Server;
}
export { IGenericApp };
