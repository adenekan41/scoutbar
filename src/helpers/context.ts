import { createContext } from 'react';
import { IScoutSectionAction, IScoutAction } from './action-helpers';

interface IScoutContext {
  currentRoute?: string;
  actions?: (IScoutSectionAction | IScoutAction)[];
  inputValue?: string;
  setInputValue?: (value: string) => void;
  currentSection?: IScoutSectionAction | null;
  setCurrentSection?: (section: IScoutSectionAction | null) => void;
  setCurrentRoute?: (route: string) => void;
}

const ScoutBarContext = createContext<IScoutContext>({});
export default ScoutBarContext;
