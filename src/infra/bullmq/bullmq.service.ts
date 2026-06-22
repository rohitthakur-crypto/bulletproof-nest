import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BullmqService {
  async pause(queue: Queue): Promise<void> {
    await queue.pause();
  }

  async resume(queue: Queue): Promise<void> {
    await queue.resume();
  }

  async getWaitingCount(queue: Queue): Promise<number> {
    return queue.getWaitingCount();
  }

  async getFailedCount(queue: Queue): Promise<number> {
    return queue.getFailedCount();
  }
}
