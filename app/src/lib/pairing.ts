import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import type { Pair, Visit } from '../types';

const STORED_PAIR_KEY = 'futari-map.pairId';

function makeInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function getStoredPairId(): Promise<string | null> {
  return AsyncStorage.getItem(STORED_PAIR_KEY);
}

export async function rememberPairId(pairId: string): Promise<void> {
  await AsyncStorage.setItem(STORED_PAIR_KEY, pairId);
}

export async function createPair(userId: string): Promise<Pair> {
  const pairId = doc(collection(db, 'pairs')).id;
  const inviteCode = makeInviteCode();
  const pair: Pair = {
    id: pairId,
    memberIds: [userId],
    inviteCode,
    createdAt: Date.now(),
  };
  await setDoc(doc(db, 'pairs', pairId), { ...pair, createdAt: serverTimestamp() });
  await rememberPairId(pairId);
  return pair;
}

export async function joinPair(userId: string, inviteCode: string): Promise<Pair> {
  const q = query(collection(db, 'pairs'), where('inviteCode', '==', inviteCode.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('招待コードが見つかりません');
  const target = snap.docs[0];
  const pair = await runTransaction(db, async (tx) => {
    const fresh = await tx.get(target.ref);
    const data = fresh.data() as Pair | undefined;
    if (!data) throw new Error('ペアが見つかりません');
    if (data.memberIds.includes(userId)) return data;
    if (data.memberIds.length >= 2) throw new Error('このペアは既に2人が参加しています');
    const nextMembers = [...data.memberIds, userId] as Pair['memberIds'];
    tx.update(target.ref, { memberIds: nextMembers });
    return { ...data, memberIds: nextMembers };
  });
  await rememberPairId(pair.id);
  return pair;
}

export async function loadPair(pairId: string): Promise<Pair | null> {
  const snap = await getDoc(doc(db, 'pairs', pairId));
  return snap.exists() ? (snap.data() as Pair) : null;
}

export function watchPairVisits(
  pairId: string,
  listener: (visits: Visit[]) => void,
): () => void {
  const ref = collection(db, 'pairs', pairId, 'visits');
  return onSnapshot(ref, (snap) => {
    listener(snap.docs.map((d) => d.data() as Visit));
  });
}

export async function recordVisit(visit: Visit): Promise<void> {
  const ref = doc(db, 'pairs', visit.pairId, 'visits', visit.id);
  await setDoc(ref, visit, { merge: true });
}

export function visitIdFromPhoto(userId: string, assetId: string): string {
  return `photo_${userId}_${assetId}`;
}
