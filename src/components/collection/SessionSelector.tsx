import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  value: 'Morning' | 'Evening';
  onChange: (value: 'Morning' | 'Evening') => void;
};

export default function SessionSelector({
  value,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          value === 'Morning' && styles.activeButton,
        ]}
        onPress={() => onChange('Morning')}>
        <Text
          style={[
            styles.text,
            value === 'Morning' && styles.activeText,
          ]}>
          Morning
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          value === 'Evening' && styles.activeButton,
        ]}
        onPress={() => onChange('Evening')}>
        <Text
          style={[
            styles.text,
            value === 'Evening' && styles.activeText,
          ]}>
          Evening
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 15,
  },

  button: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#1976D2',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5,
  },

  activeButton: {
    backgroundColor: '#1976D2',
  },

  text: {
    color: '#1976D2',
    fontWeight: '600',
  },

  activeText: {
    color: '#fff',
  },
});