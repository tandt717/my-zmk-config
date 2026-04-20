# FutariMap (二人のマップ)

二人で一緒に訪れた都道府県を、写真のEXIF位置情報から自動で記録するMVPスキャフォールド。

## スタック

- Expo (React Native + TypeScript)
- Firebase Auth (匿名ログイン) + Firestore (ペア・訪問データ共有)
- Nominatim (OpenStreetMap) 逆ジオコーディング
- expo-media-library / expo-location

## セットアップ

```bash
cd app
npm install
cp .env.example .env     # Firebase プロジェクトの値を入れる
npm start
```

Firebase コンソールで `pairs/{pairId}` と `pairs/{pairId}/visits/{visitId}` への
認証済みユーザーの読み書きを許可するセキュリティルールを設定すること。

## 主な機能

- ペア作成 / 招待コードでの参加
- 写真ライブラリをスキャンして位置情報つき写真を都道府県に変換
- 自分・相手・二人の訪問都道府県をグリッドで可視化 (`MapScreen`)

## 今後の拡張候補

- `react-native-maps` + 都道府県ポリゴン GeoJSON で塗り分け地図
- 手動での訪問地登録 / タイムライン UI
- 写真サムネイルのプレビュー (`expo-image`)
- バックグラウンド位置 (`expo-location` のバックグラウンド権限) — 電池・プライバシー要検討
- Nominatim のレート制限対策: 緯度経度グリッドでの事前グループ化
