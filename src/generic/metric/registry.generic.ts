import { collectDefaultMetrics, Counter, Histogram, Metric, Registry, Summary } from "prom-client";
import { IMetricRegistry } from "./registry.interface";

export class GenericMetric implements IMetricRegistry {

    private register: Registry;

    constructor(labels?: { [key: string]: string }) {
        this.register = new Registry();
        this.register.setDefaultLabels(
            {
                ...(process.env.SERVICE_NAME && { serviceName: process.env.SERVICE_NAME }),
                ...labels
            }
        );

        collectDefaultMetrics({ register: this.register });
        this.collectCustomMetrics();
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

    protected collectCustomMetrics(): void {
        const httpRequestsTotal = new Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code']
        });

        const httpRequestDurationSummary = new Summary({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code']
        });

        const httpRequestDurationHistogram = new Histogram({
            name: 'http_requests_duration_histogram_seconds',
            help: 'Histogram of HTTP request durations',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5, 10]
        });

        this.register.registerMetric(httpRequestsTotal);
        this.register.registerMetric(httpRequestDurationSummary);
        this.register.registerMetric(httpRequestDurationHistogram);
    }

    public collect(): (req: any, res: any, next: any) => void | Promise<void> {
        const httpRequestDurationSummary = this.register.getSingleMetric('http_request_duration_seconds') as Summary;
        const httpRequestDurationHistogram = this.register.getSingleMetric('http_requests_duration_histogram_seconds') as Histogram;
        const httpRequestsTotal = this.register.getSingleMetric('http_requests_total') as Counter;
        return (req: any, res: any, next: any) => {

            const endSummary = httpRequestDurationSummary.startTimer();
            const endHistogram = httpRequestDurationHistogram.startTimer();
            res.on('finish', () => {
                const labels = {
                    method: req.method,
                    route: req.route?.path || req.path,
                    status_code: res.statusCode
                };
                httpRequestsTotal.inc(labels);
                endSummary(labels);
                endHistogram(labels);
            });
            next();
        }

    }
}
