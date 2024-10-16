import * as React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'

import { configureStore, selectConfig } from './index'
import TestComponent from './TestComponent'

const store = configureStore({
  reducer: {}
})

test('render TestComponent, verify icu-dev config', async () => {
  render(
    <Provider store={store}>
      <TestComponent />
    </Provider>
  );

  expect(screen.getByTestId("votes")).toHaveTextContent('...')
  screen.debug();

  await screen.findByText('data received')

  expect(screen.getByTestId("votes")).toHaveTextContent(/\d+/)

  screen.debug();
});

test('render TestComponent, verify icu-production config', async () => {
  selectConfig('icu-production')

  render(
    <Provider store={store}>
      <TestComponent />
    </Provider>
  );

  await screen.findByText('icu-production data received')

  expect(screen.getByTestId("votes")).toHaveTextContent('60820')

  screen.debug();
});
