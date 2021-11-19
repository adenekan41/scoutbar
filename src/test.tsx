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
    actions={({ createScoutAction }) => [
      createScoutAction({
        label: 'Get Started',
        description: 'Get started with scoutbar',
        href: '/',
      }),
    ]}
    noResultsOnEmptySearch
  />,
  root
);
