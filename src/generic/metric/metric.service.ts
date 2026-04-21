import { AbstractGenericService } from '../service/abstract.generic.service';
import { ServiceParams, ServiceResponse } from '../service/IGeneric.service';
import { IMetricRegistry } from './registry.interface';

export class MetricService extends AbstractGenericService {
    constructor(protected register: IMetricRegistry, params?: ServiceParams) {
        super(params);
    }

    public async execute(type: string, data: any): Promise<ServiceResponse> {
        if (type === 'metrics') {
            return await this.metrics();
        }
    }

    public async metrics(): Promise<ServiceResponse> {
        return {
            data: await this.register.metrics(),
            headers: {
                'Cache-Control': 'no-store',
                ...(this.register?.contentType && { 'Content-Type': this.register.contentType }),
            },
            type: 'send',
        };
    }
}
