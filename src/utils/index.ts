const inputs = ['input', 'select', 'button', 'textarea'];

export const ignoreStrokes = (activeElement: string) => {
  return inputs.includes(activeElement.toLowerCase());
};

export const classNames = (args: (string | boolean)[]) => {
  return args
    .flat()
    .filter(arg => {
      /**
       * Make sure that the className doesnt have a boolean value
       */
      return Boolean(arg) && arg !== 'false' ? arg : '';
    })
    .join(' ');
};

export const isBrowser = () =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Gives you the ability to create a 'Globally Unique Identifier' from S4 encryptions
 *
 * e.g: guidGenerator() // 4456-4545-4343-55e3455
 * @from https://github.com/adenekan41/helpers/blob/master/src/helpers/guid-generator.js
 *
 * @returns {String} Returns a Unique Identifier
 */
export const guidGenerator = () => {
  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
};

/**
 * Gives you the ability to check if any data type is empty
 *
 * e.g: isEmpty('') // True
 * isEmpty({}) // True
 * @from https://github.com/adenekan41/helpers/blob/master/src/helpers/guid-generator.js
 *
 * @param {unknown} data - the data type
 * @returns {Boolean} Returns a boolean if its empty
 */
export const isEmpty = (data: any) => {
  for (let key in data) {
    if (data.hasOwnProperty(key)) return false;
  }
  return true;
};
