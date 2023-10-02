export class CRUDUtil {
    public static generate(route: string, hostname: string, port: number, path: string, headerKeys?: string[], middlewares?: any[]): ({ [key: string]: any }) {
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
                headerKeys: headerKeys || [],
                option: {
                    method: 'GET',
                    path,
                    ...option
                },
                middlewares: middlewares || []
            },
            get: {
                path: route + ':id',
                method: 'GET',
                headerKeys: headerKeys || [],
                option: {
                    path: path + '/:id',
                    method: 'GET',
                    ...option
                },
                middlewares: middlewares || []
            },
            create: {
                method: 'POST',
                path: route,
                headerKeys: headerKeys || [],
                option: {
                    path,
                    method: 'POST',
                    ...option
                },
                middlewares: middlewares || []
            },
            update: {
                method: 'PUT',
                path: route + ':id',
                headerKeys: headerKeys || [],
                option: {
                    path: path + '/:id',
                    method: 'PUT',
                    ...option
                },
                middlewares: middlewares || []
            },
            delete: {
                method: 'DELETE',
                path: route + ':id',
                headerKeys: headerKeys || [],
                option: {
                    path: path + '/:id',
                    method: 'DELETE',
                    ...option
                },
                middlewares: middlewares || []
            },
        };
    }
}
