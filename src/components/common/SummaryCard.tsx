import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type Props = {
  title: string;
  value: string | number;
};

export default function SummaryCard({title, value}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    alignItems: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1976D2',
  },
  title: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});