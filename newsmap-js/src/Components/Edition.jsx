import React, { useEffect, useState } from 'react';
import GridMap from './GridMap.jsx';
import TreeMap from './TreeMap.jsx';
import TreeMapMixed from './TreeMapMixed.jsx';
import Article from './Article.jsx';

import { useCategoryItems } from './useCategoryItems.js';


/**
 * @typedef Source
 * @prop {string} id
 * @prop {string} title
 * @prop {string} name
 * @prop {string} url
 */

/**
 * @typedef Article
 * @prop {string} id
 * @prop {string} category
 * @prop {string} title
 * @prop {string} url
 * @prop {string} publishedAt
 * @prop {string} imageURL
 * @prop {Source[]} sources
 * @prop {number} weight
 */

/**
 * @typedef Category
 * @prop {string} id
 * @prop {string} key
 * @prop {string} name
 * @prop {number} loadedAt
 * @prop {Article[]} articles
 * @prop {number} weight
 */

/**
 * @param {object} props
 * @param {string} props.edition
 * @param {"tree"|"grid"|"tree_mixed"} props.mode
 * @param {"time"|"sourceCount"|"sources"|"position"} props.weightingMode
 * @param {string[]} props.categories
 * @param {{[category: string]: string}} props.colours
 * @param {boolean} props.showImages
 * @param {boolean} props.showGradient
 * @param {number} props.itemsPerCategory
 * @param {number} props.refreshTime
 * @param {boolean} props.newTab
 * @param {(article: Article, e: import('react').MouseEvent) => void} props.onArticleClick
 */
function Edition({
  edition,
  categories,
  mode,
  weightingMode,
  showImages,
  showGradient,
  colours,
  itemsPerCategory,
  newTab,
  refreshTime,
  onArticleClick,
}) {
  let items = useCategoryItems(categories, refreshTime, edition, itemsPerCategory, weightingMode);

  // Fast visual update
  // (Article sizes update every 60 seconds, doesn't refetch)
  useFastVisualRefresh(weightingMode === "time", 60 * 1000);

  if (items.length === 0) {
    return null;
  }

  const Map = {
    "tree": TreeMap,
    "grid": GridMap,
    "tree_mixed": TreeMapMixed,
  }[mode];

  return (
    <Map
      items={items}
      itemRender={props => (
        <Article
          showImage={showImages}
          showGradient={showGradient}
          colours={colours}
          newTab={newTab}
          onClick={e => onArticleClick(props.item, e)}
          {...props}
        />
      )}
    />
  );
}

export default Edition;

/**
 * Forces re-render every `timeout` milliseconds
 * @param {boolean} enable
 */
function useFastVisualRefresh(enable, timeout = 10 * 1000) {
  const [, setCounter] = useState(0);

  useEffect(() => {
    if (enable) {
      const interval = setInterval(() => {
        setCounter(counter => counter + 1);
      }, timeout);
      return () => clearInterval(interval);
    }
  }, [enable, timeout]);
}


