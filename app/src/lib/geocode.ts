import type { Prefecture } from '../types';

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/reverse';

const PREFECTURES: Prefecture[] = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

const cache = new Map<string, Prefecture | null>();

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

function normalizePrefecture(raw: string | undefined): Prefecture | null {
  if (!raw) return null;
  const hit = PREFECTURES.find((p) => raw.includes(p) || raw.includes(p.replace(/[都道府県]$/, '')));
  return hit ?? null;
}

export async function reverseGeocodeToPrefecture(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<Prefecture | null> {
  const key = cacheKey(latitude, longitude);
  if (cache.has(key)) return cache.get(key) ?? null;

  const url = `${NOMINATIM_ENDPOINT}?format=jsonv2&accept-language=ja&lat=${latitude}&lon=${longitude}&zoom=6`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'FutariMap/0.1 (contact: you@example.com)' },
    signal,
  });
  if (!res.ok) {
    cache.set(key, null);
    return null;
  }
  const json = (await res.json()) as { address?: Record<string, string> };
  const addr = json.address ?? {};
  const candidate = addr.province ?? addr.state ?? addr.region ?? addr.county;
  const pref = normalizePrefecture(candidate);
  cache.set(key, pref);
  return pref;
}

export function listAllPrefectures(): readonly Prefecture[] {
  return PREFECTURES;
}
