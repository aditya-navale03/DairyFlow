import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
};

export default function QuickActionCard({
  title,
  onPress,
}: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1976D2',
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: 'center',
    elevation: 2,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});