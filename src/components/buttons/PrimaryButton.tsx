import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Colors, Spacing} from '../../theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
};

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.button}
      disabled={loading}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});