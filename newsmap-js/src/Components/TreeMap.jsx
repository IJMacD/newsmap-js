import React, { Component } from 'react';
import { layoutTreeMap } from '../layoutTreeMap';

import './TreeMap.css';

/**
 * @typedef {import('./Edition').Category} Category
 * @typedef {import('./Edition').Article} Article
 */

/**
 * @typedef TreeMapProps
 * @property {Category[]} items
 * @property {(childProps: { key: string, item: Article, category: Category, style: import('react').CSSProperties }) => import('react').ReactNode} itemRender
 */

/**
 * @augments Component<TreeMapProps>
 */
export default class TreeMap extends Component {

  // On first render: force rerender to get real dimensions
  componentDidMount() {
    this.forceUpdate();
  }

  render() {
    // Wild guess only for first render
    let rootWidth = 1024, rootHeight = 768;
    if (this.ref) {
      rootWidth = this.ref.clientWidth;
      rootHeight = this.ref.clientHeight;
    }

    const values = this.props.items.map(cat => cat.weight);

    const dimensions = layoutTreeMap(values, { width: rootWidth, height: rootHeight });

    return (
      <ol className="TreeMap-cat-list" ref={r => this.ref = r}>
        {
          this.props.items.map((category, i) => {
            if (category.articles.length === 0) {
              return null;
            }

            const articleValues = category.articles.map(a => a.weight);
            const articleDimensions = layoutTreeMap(articleValues, dimensions[i]);

            return (
              <li key={category.key} style={dimensions[i]}>
                <ol className="TreeMap-article-list">
                  {
                    category.articles.map((article, i) => {
                      const childProps = {
                        key: article.id,
                        item: article,
                        category,
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
            );
          })
        }
      </ol>
    );
  }
}
