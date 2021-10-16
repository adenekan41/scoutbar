import { guidGenerator } from '../utils';

export interface IScoutAction {
  id: string;
  label: string;
  type: 'scout-action';
  href?: string;
  action?: Function;
  target?: string;
  rel?: string;
  keyboardShortcut?: string[];
  icon?: HTMLElement | string;
  description?: string;
  ariaLabel?: string;
}

export interface IScoutSectionAction
  extends Omit<IScoutAction, 'keyboardShortcut' | 'type'> {
  type: 'scout-section' | 'scout-section-page';
  children: IScoutAction[];
}

export const createScoutAction = (args: IScoutAction): IScoutAction => {
  return { ...args, id: guidGenerator(), type: 'scout-action' };
};

export const createScoutActionSection = (
  args: IScoutSectionAction
): IScoutSectionAction => {
  return { ...args, id: guidGenerator(), type: 'scout-section' };
};

export const createScoutActionSectionPage = (
  args: IScoutSectionAction
): IScoutSectionAction => {
  return { ...args, id: guidGenerator(), type: 'scout-section-page' };
};
