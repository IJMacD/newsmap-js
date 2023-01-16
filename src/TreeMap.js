import React, { Component } from 'react';
import { layoutTreeMap } from './layoutTreeMap';

import './TreeMap.css';

/**
 * @augments Component<{ items: any[], itemRender: (any) => React.ReactNode }>
 */
export default class TreeMap extends Component {

  render () {
    let rootWidth = 768, rootHeight = 1024 - 50;
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
                    category.articles.map((article,i) => {
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
