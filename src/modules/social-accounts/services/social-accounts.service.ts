import { Injectable } from '@nestjs/common';

@Injectable()
export class SocialAccountsService {
  constructor() {
    // private readonly config: AppConfigService,
    // private readonly socialAccountCacheService: SocialAccountCacheService,
    // private readonly metaService: MetaService,
    // private readonly socialAccountRepo: SocialAccountsRepository,
  }

  // public async createSocialAccount(
  //   user: AuthenticatedUser,
  //   workspaceId: string,
  //   createSocialAccountDto: CreateSocialAccountDto):
  //    Promise<void> {
  //   const metaOAuthSession = await this.metaService.getMetaOAuthSession(user.sessionId);

  //   const pages = await this.metaService.getMetaPages(user, workspaceId);

  //   const page = pages.find(page => page.id === createSocialAccountDto.pageId);

  //   if (!page) {
  //       throw new NotFoundException('Page not found');
  //   }

  // }
}
