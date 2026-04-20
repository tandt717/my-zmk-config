import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { ensureSignedIn } from '../lib/firebase';
import { createPair, joinPair, getStoredPairId, loadPair } from '../lib/pairing';
import type { Pair } from '../types';

type Props = {
  onReady: (pair: Pair, userId: string) => void;
};

export function PairingScreen({ onReady }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await ensureSignedIn();
      setUserId(user.uid);
      const storedPairId = await getStoredPairId();
      if (!storedPairId) return;
      const pair = await loadPair(storedPairId);
      if (pair) onReady(pair, user.uid);
    })().catch((err) => Alert.alert('初期化に失敗しました', String(err)));
  }, [onReady]);

  async function handleCreate() {
    if (!userId) return;
    setBusy(true);
    try {
      const pair = await createPair(userId);
      onReady(pair, userId);
    } catch (err) {
      Alert.alert('ペア作成に失敗しました', String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (!userId || inviteCode.length < 4) return;
    setBusy(true);
    try {
      const pair = await joinPair(userId, inviteCode.trim());
      onReady(pair, userId);
    } catch (err) {
      Alert.alert('参加に失敗しました', String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>二人のマップ</Text>
      <Text style={styles.subtitle}>一緒に行った都道府県を記録しよう</Text>

      <View style={styles.card}>
        <Text style={styles.label}>新しいペアを作る</Text>
        <Button label="招待コードを発行" onPress={handleCreate} disabled={busy || !userId} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>招待コードで参加</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="characters"
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="ABC123"
        />
        <Button label="参加する" onPress={handleJoin} disabled={busy || inviteCode.length < 4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 20 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  card: { padding: 16, borderRadius: 12, backgroundColor: '#f5f5f7', gap: 12 },
  label: { fontSize: 16, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});
