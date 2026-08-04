import React from 'react';
import {StyleSheet, TextInput, TextInputProps} from 'react-native';

type Props = TextInputProps;

export default function AppTextInput(props: Props) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#888"
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
    color: '#000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 15,
    fontSize: 16,
  },
});