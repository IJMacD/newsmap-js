/**
 * @typedef {{id: string;category: string;title: string;imageURL: string;publishedAt: string;url: string;sources: {id: string;title: string;name: string;url: string;}[];}} NewsItem
 */
/**
 * @param {import('./SearchContext').SearchContextValue} searchValue
 * @param {NewsItem} item
 * @returns {boolean}
 */
export function isSearchMatching(searchValue, item) {
  if (!searchValue.enabled) {
    return true;
  }

  if (searchValue.regex) {
    try {
      const re = new RegExp(searchValue.text, searchValue.caseSensitive ? "" : "i");

      if (searchValue.includeHeadline) {
        if (re.test(item.title)) {
          return true;
        }
      }

      if (searchValue.includeSource) {
        return re.test(item.sources[0].name);
      }

      return false;
    }
    catch (e) {
      return true;
    }
  }

  if (searchValue.caseSensitive) {
    if (searchValue.includeHeadline) {
      if (item.title.includes(searchValue.text)) {
        return true;
      }
    }

    if (searchValue.includeSource) {
      return item.sources[0].name.includes(searchValue.text);
    }

    return false;
  }

  try {
    const stripped = searchValue.text.replace(/[.[\]()^$|-]/g, s => `\\${s}`);

    const re = new RegExp(stripped, "i");

    if (searchValue.includeHeadline) {
      if (re.test(item.title)) {
        return true;
      }
    }

    if (searchValue.includeSource) {
      return re.test(item.sources[0].name);
    }

  }
  catch (e) {
    return true;
  }

  return false;
}
