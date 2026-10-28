import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';

import { logout } from '../../services/auth/authService';

type Props = {
  title: string;
  subtitle?: string;
};

export default function AppHeader({
  title,
  subtitle,
}: Props) {
  const navigation = useNavigation();

  const canGoBack = navigation.canGoBack();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();

const parentNavigation = navigation.getParent() as any;

if (parentNavigation) {
  parentNavigation.reset({
    index: 0,
    routes: [{name: 'Login'}],
  });
} else {
  navigation.navigate('Login' as never);
}
          } catch (error) {
            Alert.alert('Error', 'Unable to logout. Please try again.');
          }
        },
      },
    ]);
  };

  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected === false ||
        state.isInternetReachable === false) {
        setIsOnline(false);
      } else if (
        state.isConnected === true &&
        state.isInternetReachable === true
      ) {
        setIsOnline(true);
      } else {
        setIsOnline(null);
      }
    });

    return unsubscribe;
  }, []);


  return (
    <View style={styles.container}>

      {title === 'Dashboard' && (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Icon name="logout" size={18} color="#D32F2F" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}
      {canGoBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>

          <Icon
            name="arrow-left"
            size={22}
            color="#1976D2"
          />

        </TouchableOpacity>
      )}

      <Text style={styles.logo}>
        🥛
      </Text>

      <Text style={styles.title}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}


      <View
        style={[
          styles.statusPill,
          isOnline === true
            ? styles.onlinePill
            : isOnline === false
              ? styles.offlinePill
              : styles.checkingPill,
        ]}>
        <Icon
          name={isOnline === true ? 'wifi' : 'wifi-off'}
          size={15}
          color={
            isOnline === true
              ? '#166534'
              : isOnline === false
                ? '#991B1B'
                : '#854D0E'
          }
        />
        <Text
          style={[
            styles.statusText,
            isOnline === true
              ? styles.onlineText
              : isOnline === false
                ? styles.offlineText
                : styles.checkingText,
          ]}>
          {isOnline === true
            ? 'Online'
            : isOnline === false
              ? 'Offline'
              : 'Checking connection...'}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  onlinePill: {
    backgroundColor: '#DCFCE7',
  },
  offlinePill: {
    backgroundColor: '#FEE2E2',
  },
  checkingPill: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  onlineText: {
    color: '#166534',
  },
  offlineText: {
    color: '#991B1B',
  },
  checkingText: {
    color: '#854D0E',
  },

  container: {
    backgroundColor: '#1976D2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },

  backButton: {
    position: 'absolute',
    left: 16,
    top: 52,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 3,
  },

  logo: {
    fontSize: 32,
    marginBottom: 5,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    color: '#E3F2FD',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
  logoutButton: {
    position: 'absolute',
    right: 16,
    top: 52,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10,
    elevation: 3,
  },
  logoutText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '700',
  },

});