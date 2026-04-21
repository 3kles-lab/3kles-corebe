import { AbstractGenericService } from '../service/abstract.generic.service';
import { ServiceParams, ServiceResponse } from '../service/IGeneric.service';
import { IHealth } from './health.interface';

export class HealthCheckService extends AbstractGenericService {
    constructor(private health: IHealth, params?: ServiceParams) {
        super(params);
    }

    public async execute(type: string, data: any): Promise<ServiceResponse> {
        if (type === 'healthcheck') {
            return await this.healthCheck();
        }
    }

    public async healthCheck(): Promise<ServiceResponse> {
        return {
            data: await this.health.status(),
            type: 'json',
            headers: {
                'Cache-Control': 'no-store',
            },
        };
    }
}
