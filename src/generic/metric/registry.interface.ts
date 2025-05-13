export interface IMetricRegistry {
    metrics(): Promise<string>;
    contentType?: any;
    addMetric(metric: any): void;
}