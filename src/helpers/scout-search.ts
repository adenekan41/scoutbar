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
  const toLowerCase = (str: string) => str?.toLowerCase();

  const search = toLowerCase(keyword).trim();

  const res: IScoutStems = [];

  const findNode = (doc: IScoutStems, word: string) => {
    for (let i = 0; i < doc.length; i++) {
      /**
       * Check if the word is in a label or in a description
       */

      const isContained = contains(word, [
        toLowerCase(doc[i].label),
        toLowerCase(doc[i]?.description || ''),
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
        /**
         * Stop searching in the children if the keyword matches excatly a section
         */
        if (
          toLowerCase(doc[i].label) === word ||
          toLowerCase(doc[i].label).startsWith(word)
        )
          break;
      }

      /**
       * Prevent recursion if type is a
       * Section | Page so we can get the entire tree
       * and not just the first level
       */
      if ((doc[i] as IScoutSectionAction)?.children)
        findNode((doc[i] as IScoutSectionAction)?.children, toLowerCase(word));
    }
  };

  findNode(nodes, search);

  /**
   * Rearrange result by their level of correctness to the search
   */
  return res.sort(a => {
    if (toLowerCase(a.label).startsWith(search)) {
      return -1;
    }
    return 0;
  });
};

export default scoutSearch;
