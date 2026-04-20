import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { ensurePhotoPermission, iterateGeotaggedPhotos } from '../lib/photos';
import { reverseGeocodeToPrefecture } from '../lib/geocode';
import { recordVisit, visitIdFromPhoto } from '../lib/pairing';
import type { Pair, Visit } from '../types';

type Props = {
  pair: Pair;
  userId: string;
};

export function PhotosScreen({ pair, userId }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [scanned, setScanned] = useState(0);
  const [saved, setSaved] = useState(0);
  const [lastPref, setLastPref] = useState<string | null>(null);

  async function handleSync() {
    const granted = await ensurePhotoPermission();
    if (!granted) {
      Alert.alert('権限が必要です', '写真ライブラリへのアクセスを許可してください');
      return;
    }
    setSyncing(true);
    setScanned(0);
    setSaved(0);
    try {
      for await (const photo of iterateGeotaggedPhotos()) {
        setScanned((n) => n + 1);
        const pref = await reverseGeocodeToPrefecture(photo.latitude, photo.longitude);
        if (!pref) continue;
        const visit: Visit = {
          id: visitIdFromPhoto(userId, photo.assetId),
          pairId: pair.id,
          userId,
          prefecture: pref,
          latitude: photo.latitude,
          longitude: photo.longitude,
          visitedAt: photo.takenAt,
          source: 'photo',
          photoAssetId: photo.assetId,
        };
        await recordVisit(visit);
        setSaved((n) => n + 1);
        setLastPref(pref);
        await new Promise((r) => setTimeout(r, 1100));
      }
    } catch (err) {
      Alert.alert('同期に失敗しました', String(err));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>写真から訪問地を取り込み</Text>
      <Text style={styles.body}>
        位置情報つきの写真を読み取って、訪れた都道府県をペアのマップに反映します。
        逆ジオコーディングのレート制限に配慮して、1件ずつゆっくり処理します。
      </Text>

      <View style={styles.statRow}>
        <Stat label="スキャン" value={scanned} />
        <Stat label="登録" value={saved} />
      </View>
      {lastPref ? <Text style={styles.body}>最後に登録: {lastPref}</Text> : null}

      <Button
        label={syncing ? '同期中...' : '写真を取り込む'}
        onPress={handleSync}
        disabled={syncing}
      />
      <Text style={styles.hint}>招待コード: {pair.inviteCode}</Text>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  body: { fontSize: 14, color: '#444', lineHeight: 20 },
  statRow: { flexDirection: 'row', gap: 16 },
  stat: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  hint: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 },
});
