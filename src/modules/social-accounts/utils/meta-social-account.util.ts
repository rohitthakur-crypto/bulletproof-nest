import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SocialPlatform } from '@prisma/client';

import type { MetaAsset } from '../interfaces';
import type {
  SocialAccountMetadata,
  SocialAccountUpsertPayload,
} from '../interfaces/social-account-upsert.interface';
import type { CreateSocialAccountType } from '../validators';

function buildPageMetadata(page: MetaAsset): SocialAccountMetadata {
  return {
    page: {
      id: page.id,
      name: page.name,
      pictureUrl: page.picture?.data.url,
    },
  };
}

export function findMetaPageById(pages: MetaAsset[], pageId: string): MetaAsset {
  const page = pages.find((item) => item.id === pageId);

  if (!page) {
    throw new NotFoundException(`Page ${pageId} is not available in your Meta session`);
  }

  if (!page.access_token) {
    throw new BadRequestException(`Missing page access token for page ${pageId}`);
  }

  return page;
}

export function buildMetaSocialAccountPayloads(
  page: MetaAsset,
  selection: CreateSocialAccountType,
): SocialAccountUpsertPayload[] {
  const payloads: SocialAccountUpsertPayload[] = [];

  if (selection.connectFacebook) {
    payloads.push(buildFacebookPayload(page));
  }

  if (selection.connectInstagram) {
    payloads.push(buildInstagramPayload(page));
  }

  return payloads;
}

function buildFacebookPayload(page: MetaAsset): SocialAccountUpsertPayload {
  return {
    platform: SocialPlatform.FACEBOOK,
    platformAccountId: page.id,
    metaPageId: page.id,
    accountName: page.name,
    profilePicture: page.picture?.data.url,
    accessToken: page.access_token!,
    metadata: buildPageMetadata(page),
  };
}

function buildInstagramPayload(page: MetaAsset): SocialAccountUpsertPayload {
  const instagram = page.instagram_business_account;

  if (!instagram?.id) {
    throw new BadRequestException(`Instagram is not linked to page ${page.id}`);
  }

  return {
    platform: SocialPlatform.INSTAGRAM,
    platformAccountId: instagram.id,
    metaPageId: page.id,
    accountName: instagram.username ?? page.name,
    username: instagram.username,
    profilePicture: instagram.profile_picture_url,
    accessToken: page.access_token!,
    metadata: buildPageMetadata(page),
  };
}
