import { getOS } from 'utils';

export const SCOUTBAR_ROOT_ID = 'scoutbar___root';
export const FOCUSABLE_ELEMENTS = `body > div:not(#${SCOUTBAR_ROOT_ID})`;
export const ROOT_SHORTCUT =
  getOS() === 'Mac' ? ['meta', 'k'] : ['control', 'k'];
