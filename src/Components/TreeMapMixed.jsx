import React, { Component } from 'react';
import { layoutTreeMap } from '../layoutTreeMap';

import './TreeMap.css';

/**
 * @augments Component<{ items: any[], itemRender: (any) => React.ReactNode }>
 */
export default class TreeMapMixed extends Component {

  // On first render: force rerender to get real dimensions
  componentDidMount () {
    this.forceUpdate();
  }

  render () {
    // Wild guess only for first render
    let rootWidth = 1024, rootHeight = 768;
    if (this.ref) {
      rootWidth = this.ref.clientWidth;
      rootHeight = this.ref.clientHeight;
    }

    const articleMix = [];
    this.props.items.forEach(cat => {
      cat.articles.forEach(a => articleMix.push(a));
    });
    articleMix.sort((a,b) => b.weight - a.weight);

    const dimensions = layoutTreeMap([1], { width: rootWidth, height: rootHeight });

    const articleValues = articleMix.map(a => a.weight);
    const articleDimensions = layoutTreeMap(articleValues, dimensions[0]);

    if (articleMix.length === 0) {
      return null;
    }

    return (
      <ol className="TreeMap-cat-list" ref={r => this.ref = r}>
        {(
          <li key={this.props.items[0].key} style={dimensions[0]}>
            <ol className="TreeMap-article-list">
              {
                articleMix.map((article,i) => {
                  const childProps = {
                    key: article.category+":"+article.id,
                    item: article,
                    category: article.category,
                    style: {
                      ...articleDimensions[i],
                      position: "absolute",
                    },
                  };

                  return this.props.itemRender(childProps);
                })
              }
            </ol>
          </li>
        )}
      </ol>
    );
  }
}

