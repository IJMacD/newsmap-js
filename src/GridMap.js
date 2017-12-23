import React from 'react';

import './GridMap.css';

export default function (props) {
    return (
        <ol className="GridMap-cat-list">
          {
            props.items.map(category => {
              return (
                <li key={category.id} style={{flex: category.weight}}>
                  <ol className="GridMap-article-list">
                    {
                      category.articles.map((article,i) => {
                        const timeDelta = Date.now() - (new Date(article.publishedAt));
                        const age = timeDelta < (10 * 60 * 1000) ? "" : (timeDelta < (60 * 60 * 1000) ? "old" : "older");
                        return <li key={article.id} style={{ flex: article.sources.length }}><a href={article.url} className={`article ${category.id} ${age}`} target="_blank">{article.title} ({article.sources.length})</a></li>
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