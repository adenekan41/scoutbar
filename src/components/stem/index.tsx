/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

/* -------------------------- Internal Dependencies ------------------------- */
import { classNames, isEmpty } from '../../utils';
import ScoutBarContext from '../../helpers/context';
import { IAction, ISectionAction } from '../../helpers/action-helpers';
import { ScoutBarProps } from '../../scoutbar';
import { useScoutKey, useScoutShortcut } from '../..';
import Icon from '../icon';

/* --------------------------- Styles Dependencies -------------------------- */
/* @ts-ignore */
import styles from './stem.module.scss';

interface ScoutActions extends Array<IAction | ISectionAction> {}

const ScoutBarStem = ({ actions, brandColor }: Partial<ScoutBarProps>) => {
  const [items, setItems] = useState<
    JSX.Element | JSX.Element[] | ScoutActions | undefined
  >(<></>);
  const [cursor, setCursor] = useState<number>(0);
  const [hovered, setHovered] = useState<HTMLElement | undefined>(undefined);
  const { currentSection } = useContext(ScoutBarContext);

  /**
   * Scout Key Stroke Handlers
   */
  const downPress = useScoutKey('ArrowDown', true);
  const upPress = useScoutKey('ArrowUp', true);
  const enterPress = useScoutKey('Enter');

  const ref = useRef(null);

  const allActions: HTMLElement[] = Array.from(
    !isEmpty(ref?.current)
      ? (ref?.current as unknown as HTMLElement)?.querySelectorAll('a, button')
      : []
  );
  const elementActive = allActions[cursor];

  useLayoutEffect(() => {
    // Get original body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (upPress || downPress) {
      // Prevent scrolling on mount or deps check
      document.body.style.overflow = 'hidden';
    }

    return () => {
      // Re-enable scrolling when component unmounts
      document.body.style.overflow = originalStyle;
    };
  }, [upPress, downPress]);

  useEffect(() => {
    if (elementActive && (upPress || downPress)) {
      /**
       * Allow elements scroll into view on keydown
       */
      elementActive?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
    if (elementActive && enterPress) {
      /**
       * initial focus on enter
       */
      elementActive?.click();
    }
  }, [upPress, downPress, cursor, enterPress]);

  useEffect(() => {
    if (allActions?.length && downPress) {
      setCursor(prevState =>
        prevState < allActions.length - 1 ? prevState + 1 : prevState
      );
    }
  }, [downPress]);

  useEffect(() => {
    if (allActions?.length && upPress) {
      setCursor(prevState => (prevState > 0 ? prevState - 1 : prevState));
    }
  }, [upPress]);

  useEffect(() => {
    if (allActions?.length && hovered) {
      setCursor(allActions.indexOf(hovered));
    }
  }, [hovered]);

  const createScoutbarStemItems = useCallback(
    (item: ScoutActions | any) => {
      console.log(currentSection, 'Calling for your mother');
      if (
        item.type === 'scout-action' ||
        (item.type === 'scout-section-page' && currentSection?.id !== item.id)
      )
        return (
          // Return Cell if its a section page or action
          <ScoutbarStemCell
            item={item}
            key={item.id}
            setHovered={setHovered}
            active={cursor}
            allActions={allActions}
          />
        );

      /**
       * Run a Recursion to create new scoutbar items to
       * form a tree of items
       * @returns {function(): object}
       */

      const scoutbarItemChildren = item?.children?.map((child: ScoutActions) =>
        createScoutbarStemItems(child)
      );

      /**
       * Set the element for parent dir
       */
      return (
        <ScoutbarStemItem
          key={item.id}
          item={item}
          scoutbarChildren={scoutbarItemChildren}
        />
      );
    },
    [currentSection, cursor]
  );

  const setUpScoutbarStem = useCallback(() => {
    const scoutbarItems = actions?.map((item: ScoutActions | unknown) =>
      createScoutbarStemItems(item)
    );

    setItems(scoutbarItems);
  }, [createScoutbarStemItems, actions]);

  useEffect(() => {
    setUpScoutbarStem();
  }, [setUpScoutbarStem]);

  return (
    <div
      className={styles.scoutbarStem}
      style={{ ['--scout-brand-primary' as any]: brandColor }}
      ref={ref}
    >
      <div className={styles.scoutbarStemInner}>
        {!isEmpty(currentSection) ? (
          <>
            {(currentSection as unknown as ScoutActions)?.length > 0 ? (
              <>
                {(currentSection as unknown as ScoutActions)?.map(
                  (section: ScoutActions | unknown) =>
                    createScoutbarStemItems(section)
                )}
              </>
            ) : (
              createScoutbarStemItems(currentSection)
            )}
          </>
        ) : (
          <>{items}</>
        )}
      </div>
    </div>
  );
};

const ScoutbarStemCell: React.FC<{
  item: IAction | ISectionAction;
  setHovered: Function;
  active: number;
  allActions: HTMLElement[];
}> = memo(({ item, setHovered, active, allActions }) => {
  const isNewPage =
    item.type === 'scout-section-page' && item?.children?.length > 0;
  const { setCurrentSection } = useContext(ScoutBarContext);

  const ref = useRef(null);
  const elementActive =
    allActions.indexOf(ref?.current as unknown as HTMLElement) === active;

  const handleClick: React.MouseEventHandler<
    HTMLButtonElement | HTMLAnchorElement
  > = useCallback(e => {
    if (isNewPage) return setCurrentSection?.(item);

    item.action?.call(e);
  }, []);

  const keyboardShortcut =
    (item.type === 'scout-action' && item.keyboardShortcut) || [];

  if (keyboardShortcut.length > 0) {
    useScoutShortcut([...keyboardShortcut], handleClick);
  }

  const CommonElement = () => (
    <>
      {typeof item.icon === 'string' ? (
        <img src={item.icon} alt={item?.label || ''} aria-hidden="true" />
      ) : (
        <>{item.icon}</>
      )}

      <p>
        {item.label}
        {item.description && <span>{item.description}</span>}
        {keyboardShortcut?.map((key: string) => (
          <span key={key} className={styles.shortcut}>
            {key}
          </span>
        ))}

        {isNewPage && (
          <Icon
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className={styles.newPageIcon}
            aria-hidden="true"
          >
            <path
              d="M0 14C0 14.5304 0.210714 15.0391 0.585786 15.4142C0.960859 15.7893 1.46957 16 2 16H14C14.5304 16 15.0391 15.7893 15.4142 15.4142C15.7893 15.0391 16 14.5304 16 14V2C16 1.46957 15.7893 0.960859 15.4142 0.585786C15.0391 0.210714 14.5304 0 14 0L2 0C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2L0 14ZM4.5 7.5H10.293L8.146 5.354C8.05211 5.26011 7.99937 5.13278 7.99937 5C7.99937 4.86722 8.05211 4.73989 8.146 4.646C8.23989 4.55211 8.36722 4.49937 8.5 4.49937C8.63278 4.49937 8.76011 4.55211 8.854 4.646L11.854 7.646C11.9006 7.69245 11.9375 7.74762 11.9627 7.80837C11.9879 7.86911 12.0009 7.93423 12.0009 8C12.0009 8.06577 11.9879 8.13089 11.9627 8.19163C11.9375 8.25238 11.9006 8.30755 11.854 8.354L8.854 11.354C8.76011 11.4479 8.63278 11.5006 8.5 11.5006C8.36722 11.5006 8.23989 11.4479 8.146 11.354C8.05211 11.2601 7.99937 11.1328 7.99937 11C7.99937 10.8672 8.05211 10.7399 8.146 10.646L10.293 8.5H4.5C4.36739 8.5 4.24021 8.44732 4.14645 8.35355C4.05268 8.25979 4 8.13261 4 8C4 7.86739 4.05268 7.74021 4.14645 7.64645C4.24021 7.55268 4.36739 7.5 4.5 7.5V7.5Z"
              fill="black"
            />
          </Icon>
        )}
      </p>
    </>
  );

  const commonProps = {
    onClick: handleClick,
    onMouseEnter: () => setHovered(ref?.current),
    onMouseLeave: () => setHovered(undefined),
    className: classNames([
      styles.scoutbarStemCell,
      `${elementActive && styles.active}`,
    ]),
    'aria-label': item.ariaLabel,
    ref,
  };

  return (
    <>
      {item.href ? (
        <a
          href={item.href}
          {...commonProps}
          target={item?.target}
          rel={item?.rel}
        >
          <CommonElement />
        </a>
      ) : (
        <button
          type="button"
          {...commonProps}
          disabled={!item.action && item.type === 'scout-action'}
          aria-hidden={!item.action && item.type === 'scout-action'}
        >
          <CommonElement />
        </button>
      )}
    </>
  );
});

const ScoutbarStemItem: React.FC<{
  item: ISectionAction;
  scoutbarChildren: Element[] | undefined;
}> = memo(({ item, scoutbarChildren }) => {
  return (
    <div key={item.id}>
      <div className={styles.scoutbarSection}>
        {item.label && <p className={styles.header}>{item.label}</p>}
        {scoutbarChildren}
      </div>
    </div>
  );
});

export default ScoutBarStem;
