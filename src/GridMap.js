import React from 'react';

import './GridMap.css';

export default function (props) {
    return (
        <ol className="GridMap-cat-list">
          {
            props.items.map(category => {
              return (
                <li key={category.key} style={{flexGrow: category.weight*1e8}}>
                  <ol className="GridMap-article-list">
                    {
                      category.articles.map((article,i) => {
                        const childProps = {
                          key: article.id,
                          item: article,
                          category,
                          style: {
                            flexGrow: article.sources.length,
                          },
                        };

                        return props.itemRender(childProps);
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
