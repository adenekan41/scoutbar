/**
 * Scoutbar.js
 * @remarks
 * This test enviroment uses
 *  https://caniuse.com/import-maps so make sure you are on
 *  an enviroment that supports this
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
        href: '/',
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
            action: () => alert('Page One'),
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
