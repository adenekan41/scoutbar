import { createContext } from 'react';
import { ISectionAction, IAction } from './action-helpers';

interface IScoutContext {
  currentRoute?: string;
  actions?: (ISectionAction | IAction)[];
  currentSection?: ISectionAction | null;
  setCurrentSection?: (section: ISectionAction | null) => void;
  setCurrentRoute?: (route: string) => void;
}

const ScoutBarContext = createContext<IScoutContext>({});
export default ScoutBarContext;
