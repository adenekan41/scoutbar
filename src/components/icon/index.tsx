/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import React from 'react';

interface SvgIconConstituentValues {
  strokeColor?: string;
  strokeWidth?: string;
  strokeWidth2?: string;
  strokeWidth3?: string;
  strokeFill?: string;
  fill?: string;
  imageWidth?: string;
  imageHeight?: string;
  width?: string;
  viewBox?: string;
  height?: string;
  rotateCenter?: number;
  style?: React.CSSProperties;
  className?: string;
}

const Icon: React.FC<SvgIconConstituentValues> = ({
  children,
  width,
  height,
  fill = 'none',
  viewBox,
  ...attrs
}): JSX.Element => {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      {...attrs}
    >
      {children}
    </svg>
  );
};

export default Icon;
