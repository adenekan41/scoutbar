import React, { useContext, useEffect, useState } from 'react';
import { ScoutBarProps, defaultProps } from '../../scoutbar';
import { classNames, isEmpty } from '../../utils';
import Icon from '../icon';
import ScoutBarContext from '../../helpers/context';

/* @ts-ignore */
import styles from './input.module.scss';
import { useScoutKey } from '../..';
import useLocalStorage from '../../helpers/use-local-storage';
interface IScoutBar extends Partial<ScoutBarProps> {
  closeScoutbar: () => void;
}

const ScoutbarInput: React.FC<IScoutBar> = ({
  brandColor,
  placeholder,
  showRecentSearch,
  closeScoutbar,
}) => {
  // Initialize the placeholder
  const initialPlaceholder =
    placeholder && Array.isArray(placeholder)
      ? placeholder[0]
      : placeholder || 'What would you like to do today ?';
  /**
   * Check if esc key is pressed
   */
  const isEscPressed = useScoutKey('Backspace', true);
  const { inputValue, setInputValue, currentSection, setCurrentSection } =
    useContext(ScoutBarContext);

  const [_, setRecentSearch] = useLocalStorage<string[]>(
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
              : 'Hit Backspace or Delete key to exit'
          }
          type="text"
          id="scoutbar"
          value={inputValue}
          onChange={e => {
            setInputValue?.(e.target.value);
          }}
          onBlur={e => {
            if (e.target.value.trim() && showRecentSearch) {
              (setRecentSearch as Function)?.((prev: string[]) => {
                const newRecentSearch = [...prev, e.target.value];
                return Array.from(new Set(newRecentSearch));
              });
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
      <button
        type="button"
        onClick={closeScoutbar}
        className={styles.closeScoutBar}
      >
        <Icon width="24" height="24" viewBox="0 0 24 24">
          <path
            d="M6.22517 4.81099C6.03657 4.62883 5.78397 4.52803 5.52177 4.53031C5.25957 4.53259 5.00876 4.63776 4.82335 4.82317C4.63794 5.00858 4.53278 5.25939 4.5305 5.52158C4.52822 5.78378 4.62901 6.03638 4.81117 6.22499L10.5862 12L4.81017 17.775C4.71466 17.8672 4.63848 17.9776 4.58607 18.0996C4.53366 18.2216 4.50607 18.3528 4.50492 18.4856C4.50377 18.6184 4.52907 18.75 4.57935 18.8729C4.62963 18.9958 4.70388 19.1075 4.79778 19.2014C4.89167 19.2953 5.00332 19.3695 5.12622 19.4198C5.24911 19.4701 5.38079 19.4954 5.51357 19.4942C5.64635 19.4931 5.77757 19.4655 5.89958 19.4131C6.02158 19.3607 6.13192 19.2845 6.22417 19.189L12.0002 13.414L17.7752 19.189C17.9638 19.3711 18.2164 19.4719 18.4786 19.4697C18.7408 19.4674 18.9916 19.3622 19.177 19.1768C19.3624 18.9914 19.4676 18.7406 19.4698 18.4784C19.4721 18.2162 19.3713 17.9636 19.1892 17.775L13.4142 12L19.1892 6.22499C19.3713 6.03638 19.4721 5.78378 19.4698 5.52158C19.4676 5.25939 19.3624 5.00858 19.177 4.82317C18.9916 4.63776 18.7408 4.53259 18.4786 4.53031C18.2164 4.52803 17.9638 4.62883 17.7752 4.81099L12.0002 10.586L6.22517 4.80999V4.81099Z"
            style={{ fill: brandColor }}
          />
        </Icon>
      </button>
    </div>
  );
};

ScoutbarInput.defaultProps = {
  ...defaultProps,
};
export default ScoutbarInput;
