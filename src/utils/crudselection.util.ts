import { CRUDUtil } from "./crud.utils";

export class CRUDSelectionUtil extends CRUDUtil {

    public static generate(route: string, hostname: string, port: number, path: string, headerKeys?: string[], middlewares?: any[]): ({ [key: string]: any }) {
        const option = {
            hostname,
            port,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        return {
            ...super.generate(route, hostname, port, path, headerKeys, middlewares),
            select: {
                method: 'PUT',
                path: route + ':id/select',
                headerKeys: headerKeys || [],
                option: {
                    path: path + '/:id/select',
                    method: 'PUT',
                    ...option
                },
                middlewares: middlewares || []
            },
            selectAll: {
                method: 'PUT',
                path: route + 'selectAll',
                headerKeys: headerKeys || [],
                option: {
                    path: path + '/selectAll',
                    method: 'PUT',
                    ...option
                },
                middlewares: middlewares || []
            },
            clearSelection: {
                method: 'PUT',
                path: route + 'clearSelection',
                headerKeys: headerKeys || [],
                option: {
                    path: path + '/clearSelection',
                    method: 'PUT',
                    ...option
                },
                middlewares: middlewares || []
            }
        };
    }
}