/**
 * Capitalise the first character of a string
 * @param {string} string
 */
export function ucfirst (string) {
  return string.substr(0, 1).toUpperCase() + string.substr(1);
}

/**
 * Make string url-safe
 * @param {string} string
 */
export function urlize (string) {
  return string
      .toLowerCase()
      .replace(/[ .]/g, "-")
      .replace(/-+/g, "-")
      .replace(/[^a-z0-9-]/gi, "");
}

/**
 * Return numerical luminance 0-255 from hex colour
 * @param {string} c Hex Colour #RRGGBB
 */
export function luminance (c) {
  const R = parseInt(c.substr(1,2), 16);
  const G = parseInt(c.substr(3,2), 16);
  const B = parseInt(c.substr(5,2), 16);

  return (0.2126*R + 0.7152*G + 0.0722*B);
}
