import { Injectable } from '@nestjs/common';

import { HttpClientService } from '@/infra/http/http-client.service';
// import { SocialPost } from '@/modules/social-accounts/dto';

@Injectable()
export class FacebookProvider {
  constructor(private readonly http: HttpClientService) {}

  // async getPosts(socialAccountId: string): Promise<SocialPost[]> {
  //   return new Promise((resolve) => resolve([]));
  // }
}
