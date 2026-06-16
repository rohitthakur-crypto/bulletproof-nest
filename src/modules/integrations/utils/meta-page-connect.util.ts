import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SocialPlatform } from '@prisma/client';

import type { MetaAsset, MetaPageConnectData, MetaPageSelection } from '../interfaces';

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

export function buildMetaPageConnectData(
  page: MetaAsset,
  selection: MetaPageSelection,
  webhookFields: string[],
  webhookSubscribedAt: Date,
): MetaPageConnectData[] {
  const results: MetaPageConnectData[] = [];

  if (selection.connectFacebook) {
    results.push(buildFacebookConnectData(page, webhookFields, webhookSubscribedAt));
  }

  if (selection.connectInstagram) {
    results.push(buildInstagramConnectData(page, webhookFields, webhookSubscribedAt));
  }

  return results;
}

function buildFacebookConnectData(
  page: MetaAsset,
  webhookFields: string[],
  webhookSubscribedAt: Date,
): MetaPageConnectData {
  return {
    metaPageId: page.id,
    platform: SocialPlatform.FACEBOOK,
    platformAccountId: page.id,
    accountName: page.name,
    profilePicture: page.picture?.data.url,
    accessToken: page.access_token!,
    webhookSubscribed: true,
    webhookSubscribedAt,
    webhookFields,
    pageInfo: {
      id: page.id,
      name: page.name,
      pictureUrl: page.picture?.data.url,
    },
  };
}

function buildInstagramConnectData(
  page: MetaAsset,
  webhookFields: string[],
  webhookSubscribedAt: Date,
): MetaPageConnectData {
  const instagram = page.instagram_business_account;

  if (!instagram?.id) {
    throw new BadRequestException(`Instagram is not linked to page ${page.id}`);
  }

  return {
    metaPageId: page.id,
    platform: SocialPlatform.INSTAGRAM,
    platformAccountId: instagram.id,
    accountName: instagram.username ?? page.name,
    username: instagram.username,
    profilePicture: instagram.profile_picture_url,
    accessToken: page.access_token!,
    webhookSubscribed: true,
    webhookSubscribedAt,
    webhookFields,
    pageInfo: {
      id: page.id,
      name: page.name,
      pictureUrl: page.picture?.data.url,
    },
  };
}
