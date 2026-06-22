import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';

import { META_WEBHOOK_ACK_RESPONSE } from '../constants';
import { MetaWebhookService } from '../services/meta-webhook.service';
import { MetaWebhookEventBodyDto, MetaWebhookVerifyQueryDto } from '../validators';

import { SWAGGER_TAGS } from '@/common/constants';
import { ApiVersion } from '@/common/enums';
import { SkipEnvelope } from '@/core/api/decorators';

@ApiTags(SWAGGER_TAGS.WEBHOOKS)
@Controller({ path: 'webhooks/meta', version: ApiVersion.V1 })
export class MetaWebhookController {
  constructor(private readonly metaWebhookService: MetaWebhookService) {}

  /**
   * Meta sends a GET request with a challenge string when a webhook subscription
   * is first set up.  The endpoint must echo the challenge back as plain text.
   */
  @Get()
  @SkipEnvelope()
  @ApiOperation({ summary: 'Verify Meta webhook subscription' })
  @ApiOkResponse({ description: 'Challenge echoed back to Meta', type: String })
  async verify(
    @Query() query: MetaWebhookVerifyQueryDto,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const challenge = this.metaWebhookService.verifySubscription(query);
    return reply.type('text/plain').send(challenge);
  }

  /**
   * Meta POSTs all real-time events here.  We respond with HTTP 200 immediately
   * to acknowledge receipt; heavy processing is deferred to a queue worker.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @SkipEnvelope()
  @ApiOperation({ summary: 'Receive Meta webhook events' })
  @ApiOkResponse({ description: 'Event acknowledged', type: String })
  async handleEvent(@Body() body: MetaWebhookEventBodyDto): Promise<string> {
    await this.metaWebhookService.handleWebhook(body);
    return META_WEBHOOK_ACK_RESPONSE;
  }
}
