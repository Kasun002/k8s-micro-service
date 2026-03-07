import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;

  constructor(private configService: ConfigService) {
    this.sqsClient = new SQSClient({
      region: configService.get<string>('SQS_REGION'),
      endpoint: configService.get<string>('SQS_ENDPOINT'),
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });
    this.queueUrl = configService.get<string>('SQS_QUEUE_URL');
  }

  async sendMessage(payload: Record<string, any>): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(payload),
    });
    await this.sqsClient.send(command);
    this.logger.log(`Message sent to queue: ${this.queueUrl}`);
  }
}
