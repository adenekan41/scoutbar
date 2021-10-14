import { guidGenerator } from '../utils';

export interface IAction {
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

export interface ISectionAction
  extends Omit<IAction, 'keyboardShortcut' | 'type'> {
  type: 'scout-section' | 'scout-section-page';
  children: IAction[];
}

export const createScoutAction = (args: IAction): IAction => {
  return { ...args, id: guidGenerator(), type: 'scout-action' };
};

export const createScoutActionSection = (
  args: ISectionAction
): ISectionAction => {
  return { ...args, id: guidGenerator(), type: 'scout-section' };
};

export const createScoutActionSectionPage = (
  args: ISectionAction
): ISectionAction => {
  return { ...args, id: guidGenerator(), type: 'scout-section-page' };
};
