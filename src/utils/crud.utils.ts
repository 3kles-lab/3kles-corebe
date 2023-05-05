export class CRUDUtil {
	public static generate(route: string, hostname: string, port: number, path: string): ({ [key: string]: any }) {
		route += route.endsWith("/") ? "" : "/";
		const option = {
			hostname,
			port,
			headers: {
				'Content-Type': 'application/json',
			}
		};
		return {
			list: {
				path: route,
				method: 'GET',
				option: {
					method: 'GET',
					path,
					...option
				}
			},
			get: {
				path: route + ':id',
				method: 'GET',
				option: {
					path: path + '/:id',
					method: 'GET',
					...option
				}
			},
			create: {
				method: 'POST',
				path: route,
				option: {
					path,
					method: 'POST',
					...option
				}
			},
			update: {
				method: 'PUT',
				path: route + ':id',
				option: {
					path: path + '/:id',
					method: 'PUT',
					...option
				}
			},
			delete: {
				method: 'DELETE',
				path: route + ':id',
				option: {
					path: path + '/:id',
					method: 'DELETE',
					...option
				}
			},
		};
	}
}
