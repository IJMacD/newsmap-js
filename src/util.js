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