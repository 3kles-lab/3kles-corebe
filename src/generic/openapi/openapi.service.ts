import { AbstractGenericService } from '../service/abstract.generic.service';
import { ServiceParams, ServiceResponse } from '../service/IGeneric.service';
import { OpenApiRegistry } from './openapi-registry';

export class OpenApiService extends AbstractGenericService {
    constructor(
        private openApiRegistry: OpenApiRegistry,
        params?: ServiceParams,
    ) {
        super(params);
    }

    public execute(type: string, data: any): Promise<ServiceResponse | undefined> | undefined {
        if (type === 'document') {
            return this.document();
        }
    }

    public async document(): Promise<ServiceResponse> {
        return {
            data: this.openApiRegistry.getDocument(),
            type: 'json',
            headers: {
                'Cache-Control': 'no-store',
            },
        };
    }
}
