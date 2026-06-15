import type { ConnectableAssetResponse } from '../dto/connectable-asset.response.dto';
import type {
  MetaAsset,
  MetaAssetsResponse,
  MetaInstagramBusinessAccount,
} from '../interfaces/meta-assets.interface';

export const toConnectableInstagramAsset = (
  account?: MetaInstagramBusinessAccount | null,
): ConnectableAssetResponse['instagram'] => {
  if (!account?.id) {
    return { available: false };
  }

  return {
    available: true,
    id: account.id,
    username: account.username,
    profilePicture: account.profile_picture_url,
  };
};

export const toConnectableAsset = (asset: MetaAsset): ConnectableAssetResponse => ({
  id: asset.id,
  name: asset.name ?? '',
  picture: asset.picture?.data.url ?? '',
  instagram: toConnectableInstagramAsset(asset.instagram_business_account),
});

export const toConnectableAssets = (response: MetaAssetsResponse): ConnectableAssetResponse[] =>
  response.data.map(toConnectableAsset);
