/* -------------------------------------------------------------------------- */
/*            Author: Adenekan Wonderful (https://codewonders.dev)            */
/* -------------------------------------------------------------------------- */

export * from './scoutbar';
export * from './helpers/action-helpers';
export * from './helpers/context';

export { default as useScoutKey } from './use-scout-key';
export { default as useScoutShortcut } from './use-scout-shortcut';

export { default as ScoutbarInput } from './components/input';
export { default as ScoutBarStem } from './components/stem';
export { default as ScoutBar } from './scoutbar';

/* ----------------------------- Private Methods ---------------------------- */
/**
 * @remarks These methods are privately used in the application
 * but are exported and can be used by other applications.
 */
export { default as useTrapFocus } from './helpers/use-trap-focus';
export { default as useKeyboardNavigation } from './helpers/use-keyboard-navigation';
export { default as useIsMounted } from './helpers/use-is-mounted';
export { default as useLocalStorage } from './helpers/use-local-storage';
export { default as useOnClickOutside } from './helpers/use-click-outside';
