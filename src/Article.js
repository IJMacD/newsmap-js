import React from 'react';

import colours from './colours';

import './Article.css';

const showImages = false;

export default function Article ({ item, category, style }) {
  const timeDelta = Date.now() - (new Date(item.publishedAt)).valueOf();
  // Magic numbers calculated in: https://docs.google.com/spreadsheets/d/1Oht-quZFTpJQN-6aavqzmTVerkHPI46jbx3Sx0nUrEo/edit?usp=sharing
  const fontSize = 0.9874774687 * Math.pow(style.height * style.width, 0.5349172175) * Math.pow(item.title.length, -0.5462199166);

  if (showImages) {
    style.backgroundImage = `url(${item.imageURL})`;
  }

  const backgroundColor = getAgedColour(colours[category.id], timeDelta / (1000 * 60 * 60));

  return (
    <li className={"Article-li " + (showImages ? "Article-image" : "")} style={style}>
      <a
        href={item.url}
        className="article"
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