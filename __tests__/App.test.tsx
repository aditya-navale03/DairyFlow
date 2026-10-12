
/**
 * @format
 */

jest.mock('../App', () => {
  const React = require('react');
  const {View} = require('react-native');

  return function MockApp() {
    return React.createElement(View, null);
  };
});

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
});
