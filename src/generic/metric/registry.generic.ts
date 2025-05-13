import { collectDefaultMetrics, Histogram, Metric, Registry } from "prom-client";
import { IMetricRegistry } from "./registry.interface";

export class GenericMetric implements IMetricRegistry {

    private register: Registry;
    private httpHistogram: Histogram;

    constructor(labels?: { [key: string]: string }) {
        this.register = new Registry();
        this.register.setDefaultLabels(
            {
                ...(process.env.SERVICE_NAME && { serviceName: process.env.SERVICE_NAME }),
                ...labels
            }
        );

        collectDefaultMetrics({ register: this.register });
    }


    metrics(): Promise<string> {
        return this.register.metrics();
    }

    get contentType() {
        return this.register.contentType;
    }

    public addMetric(metric: Metric<any>) {
        this.register.registerMetric(metric);
    }



}