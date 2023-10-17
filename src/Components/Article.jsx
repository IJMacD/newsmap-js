import React, { useEffect, useRef, useState } from 'react';

import defaultColours from '../colours';

import './Article.css';
import { luminance } from '../util';

export default function Article ({ item, showImage, colours = defaultColours, style, onClick, newTab }) {
  const elementRef = useRef(/** @type {HTMLAnchorElement?} */(null));
  const [ fontSize, setFontSize ] = useState(10);

  const { title } = item;
  const { width, height } = style;

  // If the width or height changes, then wait 2.5 seconds for animations to
  // finish and start adjusting font size if required (bigger or smaller).
  useEffect(() => {
    let current = true;

    setTimeout(() => {
      if (current && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();

        // May shrink font size
        if (rect.width > width || rect.height > height) {
          setFontSize(fontSize => {
            const overscale = Math.min(width / rect.width, height / rect.height);
            return fontSize * overscale;
          });
        }

        // Just aim for 90% of true height
        const maxHeight = height * 0.9;

        // May grow font size
        setFontSize(calculateNewFontSize(rect.width, rect.height, width, maxHeight));
      }
    }, 2500);

    return () => { current = false; };
  }, [title, width, height]);

  // If the font size (or height or width) has just changed, try to grow font
  // size slightly.
  // If the delta is too small then just stop growing.
  // This can only make the font size bigger.
  useEffect(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();

      // Just aim for 90% of true height
      let maxHeight = height * 0.9;

      // Reduce height limit for super wide cells since they are more likely to
      // overflow suddenly.
      const ratio = width / height;
      if (ratio > 2.5) {
        maxHeight = height * 0.75;
      }

      // May grow font size
      setFontSize(calculateNewFontSize(rect.width, rect.height, width, maxHeight));
    }
  }, [fontSize, width, height]);

  const timeDelta = Date.now() - (new Date(item.publishedAt)).valueOf();

  if (showImage && item.imageURL) {
    style.backgroundImage = `url(${item.imageURL})`;
  }

  const backgroundColor = getAgedColour(colours[item.category], timeDelta / (1000 * 60 * 60));

  const source = item.sources && item.sources.length && item.sources[0] || item;

  // Dynamic padding
  const ph = width * 0.03;
  const pv = height * 0.03;

  return (
    <li className={"Article-li " + (showImage && item.imageURL ? "Article-image" : "")} style={{ ...style,  backgroundColor, color: luminance(backgroundColor) > 176 ? "#111" : "#FFF" }}>
      <a
        href={item.url}
        className="article"
        title={source.name ? `${source.name}: ${source.title}` : source.title}
        data-source={source.name}
        style={{fontSize,padding:`${pv}px ${ph}px`}}
        onClick={onClick}
        rel="noopener"
        target={newTab ? "_blank" : "_self"}
        ref={elementRef}
      >
        {source.title}
      </a>
    </li>
  );
}

/**
 * Grow only
 * @param {number} currentWidth
 * @param {number} currentHeight
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @returns
 */
function calculateNewFontSize(currentWidth, currentHeight, maxWidth, maxHeight) {
  return (/** @type {number} */ fontSize) => {

    const scale = maxHeight / currentHeight;

    // low-pass constant
    const t = 0.975;

    const targetFontSize = fontSize * scale;
    const newSize = fontSize * t + targetFontSize * (1 - t);

    const delta = (newSize - fontSize);

    // If we've spilled over, then just stop growing
    if (currentWidth > maxWidth) {
      return fontSize;
    }

    // If the delta is too small then stop growing
    if (delta/fontSize < 0.0025) {
      return fontSize;
    }

    // Otherwise grow slightly
    return newSize;
  };
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
