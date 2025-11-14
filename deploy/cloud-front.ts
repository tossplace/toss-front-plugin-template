import {
    CloudFront,
    CreateInvalidationCommand,
    ListDistributionsCommand,
} from '@aws-sdk/client-cloudfront';

export class RemoteCloudFront {
    private client: CloudFront;
    private distributionId: string | undefined = undefined;
    private readonly bucket;

    constructor(aws: {
        bucket: string,
        region: string,
        credentials: { secretAccessKey: string, accessKeyId: string }
    }) {
        this.bucket = aws.bucket;
        this.client = new CloudFront({
            region: aws.region,
            credentials: aws.credentials,
        });
    }

    async invalidation(paths: string[]) {
        const id = await this.getFoundId();
        const items = paths
            .map((path) => (path.startsWith('/') ? path : `/${path}`))
            .map((path) => (path.includes('.') ? path : path.endsWith('/') ? `${path}*` : `${path}/*`));
        console.log(`====== cloudfront invalidation (${items.join(',')}) ======`);
        const command = new CreateInvalidationCommand({
            DistributionId: id,
            InvalidationBatch: {
                CallerReference: Date.now().toString(),
                Paths: {
                    Quantity: paths.length,
                    Items: items,
                },
            },
        });
        await this.client.send(command);
    }

    private async getDistributionId() {
        const command = new ListDistributionsCommand({});
        const list = await this.client.send(command);
        if (list.DistributionList?.Items === undefined) {
            throw new Error('DistributionList.Items is undefined');
        }
        const found = list.DistributionList?.Items.find((item) =>
            (item.Origins?.Items ?? []).some((item) => item.DomainName?.includes(this.bucket)),
        );
        if (found === undefined) {
            throw new Error('Distribution not found');
        }
        return found.Id;
    }

    private async getFoundId() {
        if (this.distributionId === undefined) {
            this.distributionId = await this.getDistributionId();
        }
        return this.distributionId;
    }
}

