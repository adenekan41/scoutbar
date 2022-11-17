/**
 * Scoutbar.js
 * @remarks
 * This test environment uses
 *  https://caniuse.com/import-maps so make sure you are on
 *  an environment that supports this
 * @author adenekan41
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { ScoutBar } from './index';

const root = document.querySelector('#app');

ReactDOM.render(
  <ScoutBar
    actions={({ createScoutAction, createScoutPage }) => [
      createScoutAction({
        label: 'Get Started',
        description: 'Get started with scoutbar',
        action: () => alert('Page Two'),
        keyboardShortcut: ['control', 'g'],
      }),
      createScoutAction({
        label: 'Hello There',
        href: '/',
      }),

      createScoutPage({
        label: 'More Pages',
        children: [
          createScoutAction({
            label: 'Page One',
            action: (e, { close }) => close?.(false),
          }),
          createScoutAction({
            label: 'Page Two',
            action: () => alert('Page Two'),
          }),
        ],
      }),
    ]}
  />,
  root
);
