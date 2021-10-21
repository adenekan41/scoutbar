/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import React, { useCallback, useState } from 'react';
import Fuse from 'fuse.js';

/* -------------------------- Internal Dependencies ------------------------- */
import ScoutBarContext from 'helpers/context';
import { IScoutStems, IScoutSectionAction, ScoutBarProps } from 'index';

interface ScoutBarProviderProps extends Partial<ScoutBarProps> {
  values?: {
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
  const { inputValue, setInputValue } = values || {};

  /**
   * Revise action data type if its a function to a an array
   * We want to give user the ability to Item creation fucntions as a parameter in the props
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
      const fuse = new Fuse(currentAction as IScoutStems, {
        shouldSort: true,
        threshold: 0.2,
        location: 0,
        distance: 100,
        keys: [
          'label',
          'description',
          'children.label',
          'children.description',
        ],
      });

      const result = fuse.search(inputValue || value);

      const finalResult: IScoutStems = [];

      if (result.length) {
        result.forEach((item: any) => {
          finalResult.push(item.item);
        });
        setSection?.(finalResult as unknown as IScoutSectionAction);
      } else {
        setSection?.(null);
      }
    },
    [inputValue, setSection]
  );

  return (
    <ScoutBarContext.Provider
      value={{
        actions: currentAction,
        setAction,
        inputValue,
        setInputValue: (value: string) => {
          setInputValue?.(value);
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
