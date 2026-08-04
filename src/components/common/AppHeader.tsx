import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
};

export default function AppHeader({title, subtitle}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🥛</Text>

      <Text style={styles.title}>{title}</Text>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1976D2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logo: {
    fontSize: 34,
    textAlign: 'center',
    marginBottom: 6,
  },
  title: {
    color: '#fff',
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
});