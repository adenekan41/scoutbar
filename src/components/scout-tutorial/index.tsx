import React from 'react';
import { ScoutBarProps } from 'scoutbar';

import { TutorialIcon } from 'components/icon/svg/tutorial';
import ScoutBarLogo from 'components/icon/svg/logo';

const ScoutTutorial: React.FC<Partial<ScoutBarProps>> = ({
  brandColor,
  acknowledgement,
}) => (
  <div className="scout__bar-tutorial-section">
    {acknowledgement && (
      <div className="scout__bar-mobile-acknowledge">
        <p>
          Powered by <ScoutBarLogo brandColor={brandColor} />
        </p>
      </div>
    )}
    <div className="scout__bar-tutorial-section-item">
      <p>
        <span>
          <TutorialIcon.Tab />
          TAB
        </span>
        or{' '}
        <span className="scout__bar-tutorial-section-item__arrow m-left">
          <TutorialIcon.Down />
        </span>
        <span className="scout__bar-tutorial-section-item__arrow">
          <TutorialIcon.Up />
        </span>
        to navigate
      </p>
    </div>
    <div className="scout__bar-tutorial-section-item">
      <p>
        <span>
          <TutorialIcon.Return />
          RETURN
        </span>
        to Select
      </p>
    </div>
    <div className="scout__bar-tutorial-section-item">
      <p>
        <span>ESC</span>
        to cancel
      </p>
    </div>
  </div>
);

export default ScoutTutorial;
