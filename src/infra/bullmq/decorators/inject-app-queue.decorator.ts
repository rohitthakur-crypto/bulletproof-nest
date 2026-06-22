import { InjectQueue } from '@nestjs/bullmq';

import { QueueName } from '@/infra/bullmq/enums';

export const InjectAppQueue = (queueName: QueueName): ParameterDecorator => InjectQueue(queueName);
