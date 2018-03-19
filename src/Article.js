import React from 'react';

import colours from './colours';

import './Article.css';


export default function Article ({ item, category, showImages, style, onClick }) {
  const timeDelta = Date.now() - (new Date(item.publishedAt)).valueOf();
  let fontSize;

  if (style.height && style.width) {
    // Magic numbers calculated in: https://docs.google.com/spreadsheets/d/1Oht-quZFTpJQN-6aavqzmTVerkHPI46jbx3Sx0nUrEo/edit?usp=sharing
    fontSize = 0.9874774687 * Math.pow(style.height * style.width, 0.5349172175) * Math.pow(item.title.length, -0.5462199166);
  }

  if (showImages) {
    style.backgroundImage = `url(${item.imageURL})`;
  }

  const backgroundColor = getAgedColour(colours[category.id], timeDelta / (1000 * 60 * 60));

  return (
    <li className={"Article-li " + (showImages ? "Article-image" : "")} style={style}>
      <a
        href={item.url}
        className="article"
        title={`${item.sources[0].name}: ${item.title}`}
        data-source={item.sources[0].name}
        style={{ backgroundColor, fontSize }}
        onClick={onClick}
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

  const b1 = parseInt(base.substr(1,2), 16);
  const b2 = parseInt(base.substr(3,2), 16);
  const b3 = parseInt(base.substr(5,2), 16);

  const r = (b1 * scale).toFixed();
  const g = (b2 * scale).toFixed();
  const b = (b3 * scale).toFixed();

  return `rgb(${r},${g},${b})`;
}
