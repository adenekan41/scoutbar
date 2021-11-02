/* --------------------------- Internal Dependency -------------------------- */
import { guidGenerator } from 'utils';

export interface IScoutAction {
  id?: string;
  label: string;
  type?: 'scout-action';
  href?: string;
  action?: () => void;
  target?: string;
  rel?: string;
  keyboardShortcut?: string[];
  icon?: HTMLElement | string;
  description?: string;
  ariaLabel?: string;
}

export interface IScoutSectionAction
  extends Omit<IScoutAction, 'keyboardShortcut' | 'type'> {
  type?: 'scout-section' | 'scout-section-page';
  children: (IScoutAction | IScoutSectionAction)[];
}

/**
 * Create a new scout action object
 *
 * @param   {IScoutAction}  args  [args description]
 * @return  {IScoutAction}        [return description]
 */
export const createScoutAction = (args: IScoutAction): IScoutAction => {
  return { id: guidGenerator(), ...args, type: 'scout-action' };
};

export const createScoutSection = (
  args: IScoutSectionAction
): IScoutSectionAction => {
  return { id: guidGenerator(), ...args, type: 'scout-section' };
};

export const createScoutPage = (
  args: IScoutSectionAction
): IScoutSectionAction => {
  return { id: guidGenerator(), ...args, type: 'scout-section-page' };
};

export type IScoutStems = Array<IScoutAction | IScoutSectionAction>;
