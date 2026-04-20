import * as MediaLibrary from 'expo-media-library';

export type GeoPhoto = {
  assetId: string;
  latitude: number;
  longitude: number;
  takenAt: number;
};

export async function ensurePhotoPermission(): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync(true);
  return status === 'granted';
}

export async function* iterateGeotaggedPhotos(
  pageSize = 100,
): AsyncGenerator<GeoPhoto, void, void> {
  let after: string | undefined;
  let hasNext = true;
  while (hasNext) {
    const page = await MediaLibrary.getAssetsAsync({
      first: pageSize,
      after,
      mediaType: 'photo',
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });
    for (const asset of page.assets) {
      const info = await MediaLibrary.getAssetInfoAsync(asset, { shouldDownloadFromNetwork: false });
      const location = info.location;
      if (!location) continue;
      yield {
        assetId: asset.id,
        latitude: location.latitude,
        longitude: location.longitude,
        takenAt: asset.creationTime,
      };
    }
    hasNext = page.hasNextPage;
    after = page.endCursor;
  }
}
