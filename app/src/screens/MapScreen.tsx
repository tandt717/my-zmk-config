import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { watchPairVisits } from '../lib/pairing';
import { listAllPrefectures } from '../lib/geocode';
import type { Pair, Prefecture, Visit } from '../types';

type Props = {
  pair: Pair;
  userId: string;
};

export function MapScreen({ pair, userId }: Props) {
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    return watchPairVisits(pair.id, setVisits);
  }, [pair.id]);

  const summary = useMemo(() => buildSummary(visits, userId, pair.memberIds), [visits, userId, pair.memberIds]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Header label="二人で訪問" value={summary.both.size} />
        <Header label="自分" value={summary.self.size} />
        <Header label="相手" value={summary.partner.size} />
      </View>

      <Text style={styles.sectionTitle}>都道府県</Text>
      <View style={styles.grid}>
        {listAllPrefectures().map((pref) => {
          const state = prefState(pref, summary);
          return (
            <View key={pref} style={[styles.cell, styles[`cell_${state}`]]}>
              <Text style={[styles.cellText, state !== 'none' && styles.cellTextActive]}>{pref}</Text>
            </View>
          );
        })}
      </View>

      <Legend />
    </ScrollView>
  );
}

type Summary = {
  self: Set<Prefecture>;
  partner: Set<Prefecture>;
  both: Set<Prefecture>;
};

function buildSummary(visits: Visit[], userId: string, memberIds: Pair['memberIds']): Summary {
  const partnerId = memberIds.find((id) => id !== userId);
  const self = new Set<Prefecture>();
  const partner = new Set<Prefecture>();
  for (const v of visits) {
    if (v.userId === userId) self.add(v.prefecture);
    else if (v.userId === partnerId) partner.add(v.prefecture);
  }
  const both = new Set<Prefecture>();
  for (const p of self) if (partner.has(p)) both.add(p);
  return { self, partner, both };
}

function prefState(pref: Prefecture, summary: Summary): 'both' | 'self' | 'partner' | 'none' {
  if (summary.both.has(pref)) return 'both';
  if (summary.self.has(pref)) return 'self';
  if (summary.partner.has(pref)) return 'partner';
  return 'none';
}

function Header({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerValue}>{value}</Text>
      <Text style={styles.headerLabel}>{label}</Text>
    </View>
  );
}

function Legend() {
  return (
    <View style={styles.legend}>
      <LegendItem color="#ff6b81" label="二人で訪問" />
      <LegendItem color="#ffc2cc" label="自分のみ" />
      <LegendItem color="#c7d7ff" label="相手のみ" />
      <LegendItem color="#eee" label="未訪問" />
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  headerRow: { flexDirection: 'row', gap: 12 },
  header: { flex: 1, backgroundColor: '#f5f5f7', borderRadius: 12, padding: 12, alignItems: 'center' },
  headerValue: { fontSize: 22, fontWeight: '700' },
  headerLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
    minWidth: 72,
    alignItems: 'center',
  },
  cell_both: { backgroundColor: '#ff6b81' },
  cell_self: { backgroundColor: '#ffc2cc' },
  cell_partner: { backgroundColor: '#c7d7ff' },
  cell_none: { backgroundColor: '#eee' },
  cellText: { fontSize: 12, color: '#555' },
  cellTextActive: { color: '#222', fontWeight: '600' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 14, height: 14, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#555' },
});
