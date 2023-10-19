import React, { useContext, useEffect, useRef, useState } from 'react';
import GridMap from './GridMap.jsx';
import TreeMap from './TreeMap.jsx';
import TreeMapMixed from './TreeMapMixed.jsx';
import Article from './Article.jsx';

import { getNews } from '../sources/GoogleNewsRSS.js';
import { ucfirst } from '../util.js';
import { SearchContext } from '../SearchContext.js';
import { isSearchMatching } from '../isSearchMatching.js';


/**
 * @typedef Category
 * @prop {string} id
 * @prop {string} key
 * @prop {string} name
 * @prop {number} loadedAt
 * @prop {any[]} articles
 */

/**
 * @param {object} props
 * @param {string} props.edition
 * @param {"tree"|"grid"|"tree_mixed"} props.mode
 * @param {"time"|"sources"|"position"} props.weightingMode
 * @param {string[]} props.categories
 * @param {{[category: string]: string}} props.colours
 * @param {boolean} props.showImages
 * @param {number} props.itemsPerCategory
 * @param {number} props.refreshTime
 * @param {boolean} props.newTab
 */
function Edition ({
  edition,
  categories,
  mode,
  weightingMode,
  showImages,
  colours,
  itemsPerCategory,
  newTab,
  refreshTime
}) {
  let items = useCategoryItems(categories, refreshTime, edition, itemsPerCategory, weightingMode);

  const searchValue = useContext(SearchContext);

  if (searchValue.mode === "filter") {
    items = items.map(item => {
      const articles = item.articles.filter(item => isSearchMatching(searchValue, item));

      return {
        ...item,
        articles,
        weight: articles.length === 0 ? 0 : item.weight,
      }
    });
  }

  if (items.length === 0) {
    return null;
  }

  const Map = {
    tree: TreeMap,
    grid: GridMap,
    tree_mixed: TreeMapMixed,
  }[mode];

  return (
    <Map
      items={items}
      itemRender={props => (
        <Article
          showImage={showImages}
          colours={colours}
          newTab={newTab}
          { ...props }
        />
      )}
    />
  );
}

const weightByTime = a => 1/(Date.now() - +new Date(a.publishedAt));
const weightBySourcesPosition = (a, i) => a.sources.length / (i + 1);
const weightByPosition = (a, i) => 1 / (i + 1);

export default Edition;

/**
 * @param {string[]} categories
 * @param {number} refreshTime
 * @param {string} edition
 * @param {number} itemsPerCategory
 * @param {"time"|"sources"|"position"} weightMode
 */
function useCategoryItems(categories, refreshTime, edition, itemsPerCategory, weightMode = "time") {
  const [categoryData, setCategoryData] = useState(/** @type {{ [id: string]: Category }} */({}));
  const loaderRef = useRef(/** @type {((cancellable: { current: boolean; }) => void)?} */(null));

  // Rebind function with current props
  loaderRef.current = (cancellable) => loadStaleCategories(cancellable);

  /**
   * @param {{ current: boolean; }} [cancellable]
   */
  async function loadStaleCategories (cancellable) {
    const now = Date.now();

    const todoList = categories.filter(id => {
      const cat = categoryData[id];
      if (!cat) return true;
      return (cat.loadedAt + refreshTime) < now;
    });

    if (todoList.length === 0) {
      return;
    }

    // @ts-ignore
    if (import.meta.env.DEV) {
      console.log(`Loading: ${todoList.join()}`);
    }

    try {
      const loadedCategories = await Promise.all(
        todoList.map(category => getNews({ category, edition }).then(data => {
          let { category, articles, title } = data;
          const key = `${edition}_${category}`;

          return {
            id: category,
            key,
            name: title,
            articles,
            loadedAt: now,
          };
        }))
      );

      if (!cancellable || cancellable.current) {
        setCategoryData(categoryData => {
          const newCategoryData = { ...categoryData };
          for (const cat of loadedCategories) {
            newCategoryData[cat.id] = cat;
          }
          return newCategoryData;
        });
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (loaderRef.current) {
      let cancellable = { current: true };

      loaderRef.current(cancellable);

      return () => { cancellable.current = false; };
    }
  }, [edition, categories]);

  useEffect(() => {
    let cancellable = { current: true };

    // Every minute check for stale categories with current function
    const id = setInterval(() => {
      if (loaderRef.current) {
        loaderRef.current(cancellable);
      }
    }, 60 * 1000);

    return () => { clearInterval(id); cancellable.current = false; };
  }, []);

  /** @type {Category[]} */
  const loadedCategories = categories.map(categoryID => categoryData[categoryID] ||
    // Dummy category while it loads
    {
      id: categoryID,
      key: `${edition}_${categoryID}`,
      name: ucfirst(categoryID),
      articles: [],
      loadedAt: 0,
    }
  );

  const weight = weightMode === "time" ? weightByTime : (
    weightMode === "sources" ? weightBySourcesPosition :
    weightByPosition
  );

  let items = loadedCategories.map(c => {
    const articles = c.articles.map((a, i) => ({ ...a, weight: weight(a, i), category: c.id }));

    articles.sort((a, b) => b.weight - a.weight);

    if (articles.length > itemsPerCategory) {
      articles.length = itemsPerCategory;
    }

    return {
      ...c,
      articles,
      // Show immediate feedback even if still loading
      weight: articles.length === 0 ?
        // will be filled in later
        NaN :
        articles.reduce((t, a) => t + a.weight, 0),
    };
  });

  // Reserve dummy space for loading category
  const loadedItems = items.filter(it => it.weight);
  if (loadedItems.length > 0 && loadedItems.length < items.length) {
    const averageWeight = loadedItems.reduce((sum, it) => sum + it.weight, 0) / loadedItems.length;
    for (const item of items) {
      if (isNaN(item.weight)) item.weight = averageWeight;
    }
  }

  items.sort((a, b) => b.weight - a.weight);

  return items;
}
