/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import React, { createContext } from 'react';

/* --------------------------- Internal Dependency -------------------------- */
import { IScoutStems, IScoutSectionAction } from 'index';

interface IScoutContext {
  actions?: IScoutStems;
  setAction?: React.Dispatch<React.SetStateAction<IScoutStems>>;
  inputValue?: string;
  setInputValue?: (value: string) => void;
  currentSection?: IScoutSectionAction | null;
  setCurrentSection?: (section: IScoutSectionAction | null) => void;
}

const ScoutBarContext = createContext<IScoutContext>({});

export default ScoutBarContext;
