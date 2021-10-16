import { IScoutAction, IScoutSectionAction } from '..';

export interface IScoutStems
  extends Array<IScoutAction | IScoutSectionAction> {}
