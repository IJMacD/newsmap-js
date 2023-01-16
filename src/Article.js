import React, { useEffect, useRef, useState } from 'react';

import defaultColours from './colours';

import './Article.css';
import { luminance } from './util';

export default function Article ({ item, showImage, colours = defaultColours, style, onClick, newTab }) {
  /** @type {import('react').MutableRefObject<HTMLAnchorElement>} */
  const ref = useRef();
  const [ fontSize, setFontSize ] = useState(10);

  const { title } = item;
  const { width, height } = style;

  useEffect(() => {
    setFontSize(1);
  }, [title, width, height]);

  useEffect(() => {
    if (ref) {
      const range = document.createRange();
      range.selectNodeContents(ref.current.firstChild);
      const rect = range.getBoundingClientRect();
      const scale = height / rect.height;
      const targetSize = fontSize * scale;

      if (fontSize * 1.5 < targetSize) {
        const newSize = fontSize * 0.9 + targetSize * 0.1;
        setFontSize(newSize);
      }
    }
  }, [fontSize, height]);

  const timeDelta = Date.now() - (new Date(item.publishedAt)).valueOf();

  if (showImage && item.imageURL) {
    style.backgroundImage = `url(${item.imageURL})`;
  }

  const backgroundColor = getAgedColour(colours[item.category], timeDelta / (1000 * 60 * 60));

  const source = item.sources && item.sources.length && item.sources[0] || item;

  return (
    <li className={"Article-li " + (showImage && item.imageURL ? "Article-image" : "")} style={style}>
      <a
        href={item.url}
        className="article"
        title={source.name ? `${source.name}: ${source.title}` : source.title}
        data-source={source.name}
        style={{ backgroundColor, fontSize, color: luminance(backgroundColor) > 176 ? "#111" : "#FFF" }}
        onClick={onClick}
        rel="noopener"
        target={newTab ? "_blank" : "_self"}
        ref={ref}
      >
        {source.title}
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

  const r = Math.floor(b1 * scale).toString(16).padStart(2,"0");
  const g = Math.floor(b2 * scale).toString(16).padStart(2,"0");
  const b = Math.floor(b3 * scale).toString(16).padStart(2,"0");

  return `#${r}${g}${b}`;
}
