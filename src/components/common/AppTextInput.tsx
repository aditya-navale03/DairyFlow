import React, {forwardRef} from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
} from 'react-native';

type Props = TextInputProps;

const AppTextInput = forwardRef<TextInput, Props>(
  (props, ref) => {
    return (
      <TextInput
        ref={ref}
        {...props}
        placeholderTextColor="#888"
        style={[styles.input, props.style]}
      />
    );
  },
);

export default AppTextInput;

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