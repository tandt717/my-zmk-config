import React, { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PairingScreen } from './src/screens/PairingScreen';
import { PhotosScreen } from './src/screens/PhotosScreen';
import { MapScreen } from './src/screens/MapScreen';
import type { Pair } from './src/types';

type Session = { pair: Pair; userId: string };
type RootStack = {
  Map: Session;
  Photos: Session;
};

const Stack = createNativeStackNavigator<RootStack>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  const handleReady = useCallback((pair: Pair, userId: string) => {
    setSession({ pair, userId });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {session ? (
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Map" options={{ title: '二人のマップ' }}>
              {() => <MapScreen pair={session.pair} userId={session.userId} />}
            </Stack.Screen>
            <Stack.Screen name="Photos" options={{ title: '写真から取り込み' }}>
              {() => <PhotosScreen pair={session.pair} userId={session.userId} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <PairingScreen onReady={handleReady} />
      )}
    </SafeAreaProvider>
  );
}
