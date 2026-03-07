import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetQueueAttributesCommand, SQSClient } from '@aws-sdk/client-sqs';
import { PurchaseService } from '../purchase/purchase.service';

@Controller('admin')
export class AdminController {
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;

  constructor(
    private configService: ConfigService,
    private purchaseService: PurchaseService,
  ) {
    this.sqsClient = new SQSClient({
      region: configService.get<string>('SQS_REGION'),
      endpoint: configService.get<string>('SQS_ENDPOINT'),
      credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
    });
    this.queueUrl = configService.get<string>('SQS_QUEUE_URL');
  }

  @Get('queue')
  async getQueueStats() {
    const response = await this.sqsClient.send(
      new GetQueueAttributesCommand({
        QueueUrl: this.queueUrl,
        AttributeNames: [
          'ApproximateNumberOfMessages',
          'ApproximateNumberOfMessagesNotVisible',
          'ApproximateNumberOfMessagesDelayed',
        ],
      }),
    );

    const attrs = response.Attributes ?? {};
    const allPurchases = await this.purchaseService.findAll();

    return {
      queue: {
        name: 'order-created',
        url: this.queueUrl,
        messagesAvailable: parseInt(attrs['ApproximateNumberOfMessages'] ?? '0', 10),
        messagesInFlight: parseInt(attrs['ApproximateNumberOfMessagesNotVisible'] ?? '0', 10),
        messagesDelayed: parseInt(attrs['ApproximateNumberOfMessagesDelayed'] ?? '0', 10),
      },
      purchases: {
        total: allPurchases.length,
        pending: allPurchases.filter((p) => p.status === 'pending').length,
        confirmed: allPurchases.filter((p) => p.status === 'confirmed').length,
      },
    };
  }
}
