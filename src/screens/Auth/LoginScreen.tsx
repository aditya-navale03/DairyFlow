import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/RootNavigator';

import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

import {Colors, Spacing} from '../../theme';
import {login} from '../../services/auth/authService';

export default function LoginScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);

const [isOnline, setIsOnline] = useState<boolean | null>(null);
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (
      state.isConnected === false ||
      state.isInternetReachable === false
    ) {
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

const onLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert('Validation', 'Please enter email and password.');
    return;
  }

  try {
    setLoading(true);

    await login(email, password);

navigation.replace('Main');    // Navigation to Dashboard will be added in the next step
  } catch (error: any) {
    let message = 'Login failed';

    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Invalid email address.';
        break;

      case 'auth/user-not-found':
        message = 'User not found.';
        break;

      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        message = 'Incorrect email or password.';
        break;

      default:
        message = error.message;
    }

    Alert.alert('Login Failed', message);
  } finally {
    setLoading(false);
  }
};



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🥛</Text>

        <Text style={styles.title}>Dairy Manager</Text>

        <Text style={styles.subtitle}>Welcome Back</Text>

        <View
  style={[
    styles.networkStatus,
    {
      backgroundColor:
        isOnline === true
          ? '#DCFCE7'
          : isOnline === false
          ? '#FEE2E2'
          : '#FEF3C7',
    },
  ]}>
  <Icon
    name={isOnline === true ? 'wifi' : 'wifi-off'}
    size={16}
    color={
      isOnline === true
        ? '#166534'
        : isOnline === false
        ? '#991B1B'
        : '#854D0E'
    }
  />

  <Text
    style={{
      color:
        isOnline === true
          ? '#166534'
          : isOnline === false
          ? '#991B1B'
          : '#854D0E',
      fontWeight: '600',
    }}>
    {isOnline === true
      ? 'Online'
      : isOnline === false
      ? 'Offline — Check your internet'
      : 'Checking connection...'}
  </Text>
</View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
<TouchableOpacity
  style={styles.loginButton}
  onPress={onLogin}
  disabled={loading}>
  <Text style={styles.loginText}>
    {loading ? 'Signing In...' : 'LOGIN'}
  </Text>
</TouchableOpacity>

        <Text style={styles.version}>Version 1.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  networkStatus: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'center',
  gap: 6,
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 20,
  marginVertical: 12,
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
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 10,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: Colors.subtitle,
    textAlign: 'center',
    marginBottom: 40,
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: Spacing.lg,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
  },

  showText: {
    color: Colors.primary,
    fontWeight: '600',
  },

  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },

  loginText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  version: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});