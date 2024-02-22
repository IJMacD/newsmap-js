import React, { useContext, useLayoutEffect, useRef, useState } from 'react';

import defaultColours from '../colours';

import './Article.css';
import { luminance } from '../util';
import { SearchContext } from '../SearchContext';
import { isSearchMatching } from '../isSearchMatching';

const DEBUG_FONT_SIZE = false;

/**
 *
 * @param {object} props
 * @param {object} props.item
 * @param {boolean} props.showImage
 * @param {boolean} props.showGradient
 * @param {boolean} props.newTab
 * @param {{ [category: string]: string }} props.colours;
 * @param {{ top: number; left:number; width: number, height: number }} props.style
 * @param {() => void} props.onClick
 * @returns
 */
export default function Article({
  item,
  showImage,
  showGradient,
  colours = defaultColours,
  style,
  onClick,
  newTab
}) {
  const elementRef = useRef(/** @type {HTMLAnchorElement?} */(null));
  const [fontSize, setFontSize] = useState(10);

  const { title } = item;
  const { width, height } = style;

  const searchValue = useContext(SearchContext);

  // Dynamic padding
  const padding = getPadding(width, height);

  // If the width or height changes, then wait 2 seconds for animations to
  // finish and start adjusting font size if required (bigger or smaller).
  useLayoutEffect(() => {
    let current = true;

    setTimeout(() => {
      if (current && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();

        const paddingHeight = height - padding * 2;

        // May shrink font size
        if (rect.width > width || rect.height > paddingHeight) {
          setFontSize(fontSize => {
            const overScale = Math.min(width / rect.width, paddingHeight / rect.height);
            return fontSize * overScale;
          });
        }

        // May grow font size
        setFontSize(calculateNewFontSize(rect.width, rect.height, width, height));
      }
    }, 2000);

    return () => { current = false; };
  }, [title, width, height]);

  // If the font size (or height or width) has just changed, try to grow font
  // size slightly.
  // This effect is only able to make the font size bigger.
  useLayoutEffect(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();

      setTimeout(() => {
        setFontSize(calculateNewFontSize(rect.width, rect.height, width, height));
      }, 0);
    }
  }, [fontSize, width, height]);

  const timeDelta = Date.now() - (new Date(item.publishedAt)).valueOf();

  if (showImage && item.imageURL) {
    style.backgroundImage = `url(${item.imageURL})`;
  }

  let backgroundColor = getAgedColour(colours[item.category], timeDelta / (1000 * 60 * 60));

  const source = item.sources && item.sources.length && item.sources[0] || item;

  const matchesSearch = isSearchMatching(searchValue, item);

  if (!matchesSearch) {
    backgroundColor = "#666666";
  }

  const outline = DEBUG_FONT_SIZE ? "1px solid red" : void 0;

  const articleStyle = {
    fontSize,
    padding,
    outline,
  };

  const maxFontHeight = getMaxFontHeight(fontSize, width, height);

  const rectHeight = elementRef.current ? elementRef.current.getBoundingClientRect().height : 0;
  const paddingHeight = rectHeight - padding * 2;

  return (
    <li className={"Article-li " + (showImage && item.imageURL ? "Article-image" : "") + (showGradient ? "Article--shadow" : "")} style={{ ...style, backgroundColor, color: luminance(backgroundColor) > 176 ? "#111" : "#FFF" }}>
      {
        DEBUG_FONT_SIZE && <>
          <div style={{ position: "absolute", width: "100%", top: padding, height: maxFontHeight, borderBottom: "1px solid blue" }} />
          <div style={{ position: "absolute", width: "100%", bottom: padding, height: fontSize * 1.1, borderTop: "1px solid grey", borderBottom: "1px solid grey", fontSize: 4 }}>{(paddingHeight / (fontSize * 1.1)).toFixed()}</div>
        </>
      }
      <a
        href={item.url}
        className="article"
        title={source.name ? `${source.name}: ${source.title}` : source.title}
        data-source={source.name}
        style={articleStyle}
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
    const maxFontHeight = getMaxFontHeight(fontSize, maxWidth, maxHeight);

    const scale = maxFontHeight / currentHeight;
    const targetFontSize = fontSize * scale;

    // low-pass constant
    const t = 0.9;

    const newSize = fontSize * t + targetFontSize * (1 - t);

    const delta = (newSize - fontSize);

    // If we've spilled over, then just stop growing
    if (currentWidth > maxWidth) {
      return fontSize;
    }

    // If the delta is too small then stop growing
    // if (delta/fontSize < 0.0025) {
    //   return fontSize;
    // }
    if (delta < 0.01) {
      return fontSize;
    }

    // Otherwise grow slightly
    return newSize;
  };
}

/**
 * @param {number} fontSize
 * @param {number} maxWidth
 * @param {number} maxHeight
 */
function getMaxFontHeight(fontSize, maxWidth, maxHeight,) {
  const padding = getPadding(maxWidth, maxHeight);

  const paddingHeight = maxHeight - padding * 2;

  const lineHeight = fontSize * 1.2;

  const lines = Math.round(paddingHeight / lineHeight);

  // const linesMod = lines % 1;

  // if (linesMod < 0.5) {
  //   return Math.min(paddingHeight, Math.floor(lines + 1) * lineHeight)
  // }

  // return Math.min(paddingHeight, Math.floor(lines) * lineHeight);

  // return Math.min(paddingHeight - lineHeight, (Math.floor(lines) + 0.5) * lineHeight);

  // return (Math.floor(lines) + 0.5) * lineHeight;

  // return (lines + 0.5) * lineHeight;

  // return Math.min(paddingHeight, lines * lineHeight);

  return Math.min(paddingHeight - lineHeight, lines * lineHeight);
}

/**
 * @param {number} maxWidth
 * @param {number} maxHeight
 */
function getPadding(maxWidth, maxHeight) {
  const ph = maxWidth * 0.03;
  const pv = maxHeight * 0.03;

  const padding = Math.min(ph, pv);
  return padding;
}

function getAgedColour(base, age) {
  const k1 = 50 / 9;
  const k2 = 20 / 3;
  const c = 1 - (k1 / k2);

  const scale = k1 / (age + k2) + c;

  const b1 = parseInt(base.substr(1, 2), 16);
  const b2 = parseInt(base.substr(3, 2), 16);
  const b3 = parseInt(base.substr(5, 2), 16);

  const r = Math.floor(b1 * scale).toString(16).padStart(2, "0");
  const g = Math.floor(b2 * scale).toString(16).padStart(2, "0");
  const b = Math.floor(b3 * scale).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}
