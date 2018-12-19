import React, { Component } from 'react';
import GridMap from './GridMap';
import TreeMap from './TreeMap';
import { getNews } from './GoogleNewsRSS';

import Article from './Article';


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
 * @prop {string[]} availableCategories
 * @prop {string[]} selectedCategories
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

    if (window['ga']) {
      window['ga']('send', 'pageview', { "dimension1": this.props.edition });
    }

    this.timeout = setInterval(() => this.loadAllCategories(this.props.edition), this.props.refreshTime);
  }

  componentWillUnmount () {
    clearInterval(this.timeout);
  }

  componentDidUpdate (prevProps) {
    if (this.props.itemsPerCategory !== prevProps.itemsPerCategory) {
      this.loadAllCategories(this.props.edition);
    }
  }

  loadAllCategories (edition) {

    const cats = this.props.availableCategories;

    cats.forEach(category => {
      getNews({ category, edition }).then(data => this.setState(oldState => {
        let { articles } = data;

        const key = `${edition}_${category}`;
        const newCat = { id: category, key, name: category, articles };

        let categories = [ ...oldState.categories.filter(c => c.key !== key), newCat ];

        return { categories };
      }), err => {
        if (err === "CORS Error" && !this.embarrassed) {
          this.embarrassed = true;
          alert("Well this is embarrassing.\n\nI'll be honest - Google News RSS servers don't exactly play nicely with NewsMap.JS. More accurately they just don't consider CORS which would let us load the news directly. Instead I need to proxy the requests through the NewsMap.JS servers and I'm too cheap to implement the proxying properly.\n\nMy advice is to try a different news edition in the options.");
        }
        console.log(err);
      });
    });
  }

  render() {
    const Map = this.props.mode === "tree" ? TreeMap : GridMap;
    const { selectedCategories, showImages, colours, itemsPerCategory, newTab } = this.props;
    const { categories } = this.state;

    const cats = categories.filter(c => selectedCategories.includes(c.id));

    let items = cats.map(c => {
      const articles = c.articles.map(a => ({ ...a, weight: weight(a) }));

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
