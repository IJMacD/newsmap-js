import React from 'react';

import './Article.css';

const showImages = false;

export default function Article ({ item, category, style }) {
  const timeDelta = Date.now() - (new Date(item.publishedAt));
  const age = timeDelta < (10 * 60 * 1000) ? "" : (timeDelta < (60 * 60 * 1000) ? "old" : "older");
  const fontSize = (style.height + style.width) * 0.06;
  if (showImages) {
    style.backgroundImage = `url(${item.imageURL})`;
  }
  return (
    <li className={"Article-li " + (showImages ? "Article-image" : "")} style={style}>
      <a
        href={item.url}
        className={`article ${category.id} ${age}`}
        target="_blank"
        title={item.title}
        style={{ fontSize }}
      >
        {item.title}
      </a>
    </li>
  );
}