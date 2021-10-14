import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScoutBarProps, defaultProps } from '../../scoutbar';
import { classNames, isEmpty } from '../../utils';
import Icon from '../icon';
import ScoutBarContext from '../../helpers/context';
import Fuse from 'fuse.js';

/* @ts-ignore */
import styles from './input.module.scss';
import { useScoutKey } from '../..';
import { IAction, ISectionAction } from '../../helpers/action-helpers';
import useLocalStorage from '../../helpers/use-local-storage';

interface IScoutBar extends Partial<ScoutBarProps> {}

const ScoutbarInput: React.FC<IScoutBar> = ({ brandColor, placeholder }) => {
  // Initialize the placeholder
  const initialPlaceholder =
    placeholder && Array.isArray(placeholder)
      ? placeholder[0]
      : placeholder || 'What would you like to do today ?';
  /**
   * Check if esc key is pressed
   */
  const isEscPressed = useScoutKey('Backspace', true);
  const { actions, currentSection, setCurrentSection } =
    useContext(ScoutBarContext);

  const [inputValue, setInputValue] = useState('');
  const [_, setRecentSearch] = useLocalStorage<string[] | undefined>(
    'scoutbar:recent-search',
    []
  );

  const [inputPlaceholder, setInputPlaceholder] = useState({
    id: Math.floor(Math.random() * 100),
    word: initialPlaceholder,
    currentIndex: 0,
  });

  useEffect(() => {
    const words = placeholder;
    // Function that executes every 2000 milliseconds
    if (words && Array.isArray(words)) {
      const interval = setInterval(function () {
        setInputPlaceholder(prev => ({
          ...prev,
          id: Math.floor(Math.random() * 100),
          word: words[prev.currentIndex],
          currentIndex:
            prev.currentIndex === words.length - 1 ? 0 : prev.currentIndex + 1,
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (inputValue === '' && !isEmpty(currentSection) && isEscPressed) {
      setCurrentSection?.(null);
    }
  }, [inputValue, isEscPressed, setCurrentSection]);

  const searchItem = useCallback(() => {
    const fuse = new Fuse(actions as any, {
      shouldSort: true,
      ignoreLocation: true,
      includeMatches: true,
      keys: ['label', 'description', 'children.label', 'children.description'],
    });

    const result = fuse.search(inputValue);

    const finalResult: Array<IAction | ISectionAction> = [];

    if (result.length) {
      result.forEach((item: any) => {
        finalResult.push(item.item);
      });
      setCurrentSection?.(finalResult as any);
    } else {
      setCurrentSection?.(null);
    }
  }, [setCurrentSection]);

  return (
    <div
      className={classNames(['scout__bar-wrapper-input', styles.inputWrapper])}
    >
      <button
        type="button"
        onClick={() => !isEmpty(currentSection) && setCurrentSection?.(null)}
        className={styles.iconButton}
        disabled={isEmpty(currentSection)}
      >
        <Icon
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className={classNames([
            'scout__bar-wrapper-input-icon',
            styles.inputIcon,
          ])}
          style={{ color: brandColor }}
        >
          {isEmpty(currentSection) ? (
            <path
              d="M11 4.99983C10.2121 4.99983 9.43185 5.15503 8.7039 5.45656C7.97595 5.75808 7.31451 6.20004 6.75736 6.75719C6.20021 7.31434 5.75825 7.97578 5.45672 8.70373C5.15519 9.43169 5 10.2119 5 10.9998C5 11.7878 5.15519 12.568 5.45672 13.2959C5.75825 14.0239 6.20021 14.6853 6.75736 15.2425C7.31451 15.7996 7.97595 16.2416 8.7039 16.5431C9.43185 16.8446 10.2121 16.9998 11 16.9998C12.5913 16.9998 14.1174 16.3677 15.2426 15.2425C16.3679 14.1173 17 12.5911 17 10.9998C17 9.40853 16.3679 7.88241 15.2426 6.75719C14.1174 5.63197 12.5913 4.99983 11 4.99983V4.99983ZM3 10.9998C3.00018 9.72669 3.30422 8.47198 3.88684 7.33997C4.46946 6.20797 5.31384 5.23136 6.3498 4.49132C7.38577 3.75127 8.5834 3.26917 9.84315 3.08506C11.1029 2.90096 12.3884 3.02018 13.5928 3.43281C14.7973 3.84544 15.8858 4.53957 16.768 5.4575C17.6502 6.37543 18.3006 7.49067 18.6651 8.71051C19.0296 9.93035 19.0977 11.2196 18.8638 12.471C18.6298 13.7225 18.1006 14.9001 17.32 15.9058L20.707 19.2928C20.8892 19.4814 20.99 19.734 20.9877 19.9962C20.9854 20.2584 20.8802 20.5092 20.6948 20.6947C20.5094 20.8801 20.2586 20.9852 19.9964 20.9875C19.7342 20.9898 19.4816 20.889 19.293 20.7068L15.906 17.3198C14.7235 18.2379 13.307 18.8058 11.8178 18.9588C10.3285 19.1118 8.82619 18.8439 7.48165 18.1855C6.1371 17.5271 5.00429 16.5046 4.21202 15.2343C3.41976 13.964 2.99983 12.4969 3 10.9998V10.9998Z"
              fill={brandColor}
            />
          ) : (
            <path
              d="M20.9999 11H6.41394L11.7069 5.70697L10.2929 4.29297L2.58594 12L10.2929 19.707L11.7069 18.293L6.41394 13H20.9999V11Z"
              fill={brandColor}
              style={{ fill: brandColor }}
            />
          )}
        </Icon>
      </button>

      <div className={styles.inputField}>
        <input
          placeholder={
            isEmpty(currentSection)
              ? initialPlaceholder
              : 'Click Backspace or Delete to exit section'
          }
          type="text"
          id="scoutbar"
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            searchItem();
          }}
          onBlur={e => {
            if (e.target.value.trim()) {
              setRecentSearch(prev => [...prev, e.target.value]);
            }
          }}
        />

        <label htmlFor="scoutbar">
          {Array.isArray(placeholder)
            ? inputPlaceholder.word.split(' ').map(word => (
                <>
                  <span key={`${word}:${inputPlaceholder.id}`}>{word}</span>{' '}
                </>
              ))
            : initialPlaceholder}
        </label>
      </div>
    </div>
  );
};

ScoutbarInput.defaultProps = {
  ...defaultProps,
};
export default ScoutbarInput;
