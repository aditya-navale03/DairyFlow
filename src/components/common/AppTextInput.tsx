import React, {forwardRef} from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

type Props = TextInputProps;

const AppTextInput = forwardRef<TextInput, Props>(
  (props, ref) => {
    return (
      <View style={styles.container}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {props.placeholder}
          </Text>
        </View>

        <TextInput
          ref={ref}
          {...props}
          placeholder=""
          placeholderTextColor="#888"
          style={[styles.input, props.style]}
        />
      </View>
    );
  },
);

export default AppTextInput;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 18,
    marginTop: 30,
  },

  labelContainer: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    zIndex: 1,
  },

  label: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '600',
  },

  input: {
    backgroundColor: '#FFFFFF',
    color: '#000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
  },
});