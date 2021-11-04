import { IScoutStems, IScoutSectionAction } from 'index';

const contains = (initialValue: string, patterns: Array<string>) => {
  /**
   * Check if the pattern is an array else exit function
   */
  if (!Array.isArray(patterns))
    return console.error('contains: patterns must be an array');

  let value = 0;

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];

    value += Number(pattern.includes(initialValue));
  }

  return Boolean(value);
};

const scoutSearch = (nodes: IScoutStems, keyword: string) => {
  const isScoutSection = (type: string | undefined) =>
    type === 'scout-section' || type === 'scout-section-page';
  const search = keyword.toLowerCase().trim();

  const res: IScoutStems = [];

  const findNode = (doc: IScoutStems, word: string) => {
    for (let i = 0; i < doc.length; i++) {
      /**
       * Check if the word is in a label or in a description
       */

      const isContained = contains(word, [
        doc[i].label.toLowerCase(),
        doc[i].description?.toLowerCase() || '',
      ]);

      /**
       * Instead of looking for an exact match in a Section | Page Type
       * we just check if the action is included in the title
       */

      if (isContained && !isScoutSection(doc[i]?.type)) {
        res.push(doc[i]);
      }

      if (isContained && isScoutSection(doc[i]?.type)) {
        res.push(doc[i]);
      }

      /**
       * Prevent recursion if type is a
       * Section | Page so we can get the entire tree
       * and not just the first level
       */
      if ((doc[i] as IScoutSectionAction)?.children)
        findNode((doc[i] as IScoutSectionAction)?.children, word.toLowerCase());
    }
  };

  findNode(nodes, search);

  /**
   * Rearrange result by their level of correctness to the search
   */
  return res.sort(a => {
    if (a.label.toLowerCase().startsWith(search)) {
      return -1;
    }
    return 0;
  });
};

export default scoutSearch;
