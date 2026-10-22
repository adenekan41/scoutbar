import type { IScoutAction } from './action-helpers';

type ShortcutKeyMap = Record<string, boolean>;
type ShortcutCallback = (keyMap: ShortcutKeyMap) => void;
type Navigate = (href: string, target?: string) => void;

const navigateAction = (href: string, target?: string): void => {
  if (target) {
    window.open(href, target);
    return;
  }

  window.location.assign(href);
};

export const createShortcutActionCallback = (
  action: IScoutAction,
  navigate: Navigate = navigateAction
): ShortcutCallback => {
  if (action.action) return action.action as unknown as ShortcutCallback;

  const href = action.href;
  if (!href) return () => undefined;

  return () => navigate(href, action.target);
};
