import React from "react";

/**
 * @typedef SearchContextValue
 * @prop {boolean} enabled
 * @prop {string} text
 * @prop {"highlight"|"filter"} mode
 * @prop {boolean} regex
 * @prop {boolean} caseSensitive
 * @prop {boolean} includeHeadline
 * @prop {boolean} includeSource
 */

/** @type {SearchContextValue} */
export const defaultSearchContextValue = {
    enabled: false,
    text: "",
    mode: "highlight",
    regex: false,
    caseSensitive: false,
    includeHeadline: true,
    includeSource: false,
};

export const SearchContext = React.createContext(defaultSearchContextValue);