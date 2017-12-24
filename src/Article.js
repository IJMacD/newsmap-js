import React from 'react';

import './Article.css';

const showImages = false;

const colours = {
  "world":          ["#9c1f1f", 156,  31,  31],
  "nation":         ["#9c891f", 156, 137,  31],
  "business":       ["#449c1f",  68, 156,  31],
  "technology":     ["#1f9c66",  31, 156, 102],
  "sports":         ["#1f689c",  31, 104, 156],
  "entertainment":  ["#421f9c",  66,  31, 156],
  "health":         ["#9c1f8b", 156,  31, 139],
  "science":        ["#68429c", 104,  66, 156],
};

export default function Article ({ item, category, style }) {
  const timeDelta = Date.now() - (new Date(item.publishedAt)).valueOf();
  const fontSize = (style.height + style.width) * 0.06;

  if (showImages) {
    style.backgroundImage = `url(${item.imageURL})`;
  }

  const backgroundColor = getAgedColour(colours[category.id], timeDelta / (1000 * 60 * 60));

  return (
    <li className={"Article-li " + (showImages ? "Article-image" : "")} style={style}>
      <a
        href={item.url}
        className="article"
        target="_blank"
        title={item.title}
        style={{ backgroundColor, fontSize }}
      >
        {item.title}
      </a>
    </li>
  );
}

function getAgedColour(base, age) {
  const k1 = 50 / 9;
  const k2 = 20 / 3;
  const c = 1 - (k1 / k2);

  const scale = k1 / (age + k2) + c;

  const r = (base[1] * scale).toFixed();
  const g = (base[2] * scale).toFixed();
  const b = (base[3] * scale).toFixed();

  return `rgb(${r},${g},${b})`;
}