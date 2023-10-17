import React, { Component } from 'react';
import GridMap from './GridMap.jsx';
import TreeMap from './TreeMap.jsx';
import TreeMapMixed from './TreeMapMixed.jsx';
import Article from './Article.jsx';

import { getNews } from '../sources/GoogleNewsRSS.js';


/**
 * @typedef Category
 * @prop {string} id
 * @prop {string} key
 * @prop {string} name
 * @prop {any[]} articles
 */

/**
 * @typedef EditionProps
 * @prop {string} edition
 * @prop {string} mode
 * @prop {string[]} categories
 * @prop {{[category: string]: string}} colours
 * @prop {boolean} showImages
 * @prop {number} itemsPerCategory
 * @prop {number} refreshTime
 * @prop {boolean} newTab
 */

/**
 * @typedef EditionState
 * @prop {Category[]} categories
 */

/**
 * @augments Component<EditionProps, EditionState>
 */
class Edition extends Component {
  constructor (props) {
    super(props);

    /** @type {EditionState} */
    this.state = {
      categories: [],
    };

    this.handleItemClick = this.handleItemClick.bind(this);
  }

  handleItemClick (e, item) {
    if (e.altKey) {
      e.preventDefault();

      if (!item.sources) {
        return;
      }

      item.sources.push(item.sources.shift());

      item.title = item.sources[0].title;
      item.url = item.sources[0].url;

      this.forceUpdate();

      return;
    }
  }

  componentDidMount () {
    this.loadAllCategories(this.props.edition);

    this.timeout = setInterval(() => this.loadAllCategories(this.props.edition), this.props.refreshTime);
  }

  componentWillUnmount () {
    clearInterval(this.timeout);
  }

  componentDidUpdate (prevProps) {
    if (
      (this.props.itemsPerCategory !== prevProps.itemsPerCategory) ||
      !areArraysEqual(this.props.categories, prevProps.categories)
    ) {
      this.loadAllCategories(this.props.edition);
    }
  }

  /**
   * @param {string} edition
   */
  loadAllCategories (edition) {
    Promise.all(this.props.categories.map(category => getNews({ category, edition }).then(data => {
      let { category, articles, title } = data;
      const key = `${edition}_${category}`;
      return { id: category, key, name: title, articles }
    })))
    .then(categories => this.setState({ categories }), err => {
      if (err === "CORS Error" && !this.embarrassed) {
        this.embarrassed = true;
        alert("Well this is embarrassing.\n\nI'll be honest - Google News RSS servers don't exactly play nicely with NewsMap.JS. More accurately they just don't consider CORS which would let us load the news directly. Instead I need to proxy the requests through the NewsMap.JS servers and I'm too cheap to implement the proxying properly.\n\nMy advice is to try a different news edition in the options.");
      }
      console.log(err);
    });
  }

  render() {
    const Map = {"tree":TreeMap, "grid":GridMap, "tree_mixed":TreeMapMixed}[this.props.mode];
    const { showImages, colours, itemsPerCategory, newTab } = this.props;

    let items = this.state.categories.map(c => {
      const articles = c.articles.map(a => ({ ...a, weight: weight(a), category: c.id }));

      articles.sort((a,b) => b.weight - a.weight)

      if (articles.length > itemsPerCategory) {
        articles.length = itemsPerCategory;
      }

      return {
        ...c,
        articles,
        weight: articles.reduce((t, a) => t + a.weight, 0),
      };
    });

    items.sort((a,b) => b.weight - a.weight);

    if (items.length === 0) {
      return null;
    }

    return (
      <Map
        items={items}
        itemRender={props => (
          <Article
            showImage={showImages}
            colours={colours}
            onClick={e => this.handleItemClick(e, props.item)}
            newTab={newTab}
            { ...props }
          />
        )}
      />
    );
  }
}

const weight = a => 1/(Date.now() - +new Date(a.publishedAt));

export default Edition;

/**
 * @param {string[]} arrayAlpha
 * @param {string[]} arrayBravo
 */
function areArraysEqual (arrayAlpha, arrayBravo) {
  if (arrayAlpha.length != arrayBravo.length) {
    return false;
  }

  for (let i = 0; i < arrayAlpha.length; i++) {
    if (arrayAlpha[i] != arrayBravo[i]) {
      return false;
    }
  }

  return true;
}