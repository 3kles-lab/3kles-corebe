export interface IMetricRegistry<T = unknown> {
    register: T;
    metrics(): Promise<string>;
    contentType?: any;
    addMetric(metric: any): void;

    collect?(): (req, res, next) => void | Promise<void>;
}