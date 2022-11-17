/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import React, { useCallback, useState } from 'react';

/* -------------------------- Internal Dependencies ------------------------- */
import ScoutBarContext from 'helpers/context';
import { IScoutStems, IScoutSectionAction, ScoutBarProps } from 'index';
import scoutSearch from 'helpers/scout-search';

interface ScoutBarProviderProps extends Partial<ScoutBarProps> {
  values?: {
    scoutbarReveal?: boolean;
    setScoutbarReveal?: (value: boolean) => void;
    inputValue?: string;
    setInputValue?: (value: string) => void;
  };
}

const ScoutBarProvider: React.FC<ScoutBarProviderProps> = ({
  actions = [],
  children,
  values,
}) => {
  const [section, setSection] = useState<IScoutSectionAction | null>(null);

  const { inputValue, setInputValue, scoutbarReveal, setScoutbarReveal } =
    values || {};

  /**
   * Revise action data type if its a function to a an array
   * We want to give user the ability to Item creation functions as a parameter in the props
   *
   * e.g
   * ...
   * actions={({ createScoutAction,createScoutSection,createScoutPage}) => [...]}
   */

  const [currentAction, setAction] = useState<IScoutStems>(
    actions as IScoutStems
  );

  const searchItem = useCallback(
    value => {
      const result = scoutSearch(currentAction, inputValue || value);

      if (result.length) {
        setSection?.(result as unknown as IScoutSectionAction);
      } else {
        setSection?.(null);
      }
    },
    [setSection, scoutSearch]
  );

  return (
    <ScoutBarContext.Provider
      value={{
        actions: currentAction,
        setAction,
        inputValue,
        setScoutbarReveal,
        scoutbarReveal,
        setInputValue: async (value: string) => {
          await setInputValue?.(value);
          searchItem(value);
        },
        currentSection: section,
        setCurrentSection: (section: IScoutSectionAction | null) =>
          setSection(section),
      }}
    >
      {children}
    </ScoutBarContext.Provider>
  );
};

export default ScoutBarProvider;
