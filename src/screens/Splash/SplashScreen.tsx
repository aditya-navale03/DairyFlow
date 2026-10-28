import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import {Colors} from '../../theme';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({navigation}: Props) {
useEffect(() => {
  const auth = getAuth();

  const unsubscribe = onAuthStateChanged(auth, user => {
    if (user) {
      navigation.replace('Main');
    } else {
      navigation.replace('Login');
    }
  });

  return unsubscribe;
}, [navigation]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🥛 Dairy Manager</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
});