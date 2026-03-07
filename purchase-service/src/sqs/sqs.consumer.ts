import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { PurchaseService } from '../purchase/purchase.service';

@Injectable()
export class SqsConsumer implements OnModuleInit {
  private readonly logger = new Logger(SqsConsumer.name);
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly productServiceUrl: string;

  constructor(
    private configService: ConfigService,
    private purchaseService: PurchaseService,
  ) {
    this.sqsClient = new SQSClient({
      region: configService.get<string>('SQS_REGION'),
      endpoint: configService.get<string>('SQS_ENDPOINT'),
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });
    this.queueUrl = configService.get<string>('SQS_QUEUE_URL');
    this.productServiceUrl = configService.get<string>('PRODUCT_SERVICE_URL');
  }

  onModuleInit() {
    this.startPolling();
  }

  private async deductStock(items: Array<{ productId: string; quantity: number }>) {
    for (const item of items) {
      try {
        await fetch(`${this.productServiceUrl}/products/${item.productId}/deduct-stock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: item.quantity }),
        });
        this.logger.log(`Deducted ${item.quantity} from stock for ${item.productId}`);
      } catch (err) {
        this.logger.error(`Failed to deduct stock for ${item.productId}: ${err.message}`);
      }
    }
  }

  private startPolling() {
    this.logger.log(`Starting SQS polling on queue: ${this.queueUrl}`);
    setInterval(() => this.poll(), 5000);
  }

  private async poll() {
    try {
      const response = await this.sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 0,
        }),
      );

      if (!response.Messages?.length) return;

      for (const message of response.Messages) {
        try {
          const payload = JSON.parse(message.Body);
          const purchase = await this.purchaseService.createFromMessage(payload);
          this.logger.log(`Created purchase ${purchase.id} for user ${payload.userId}`);

          await this.deductStock(payload.items);

          await this.sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: this.queueUrl,
              ReceiptHandle: message.ReceiptHandle,
            }),
          );
        } catch (err) {
          this.logger.error(`Failed to process message ${message.MessageId}: ${err.message}`);
        }
      }
    } catch (err) {
      this.logger.error(`SQS polling error: ${err.message}`);
    }
  }
}
