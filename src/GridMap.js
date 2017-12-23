import React from 'react';

import Article from './Article';

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
                      category.articles.map((article,i) => <Article key={article.id} item={article} category={category} style={{ flex: article.sources.length }} />)
                    }
                  </ol>
                </li>
              );
            })
          }
        </ol>
    );
}