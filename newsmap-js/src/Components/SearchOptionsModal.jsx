import React from 'react';
import { defaultSearchContextValue } from '../SearchContext';

/**
 * @typedef {import('../SearchContext').SearchContextValue} SearchContextValue
 */

/**
 * @param {object} props
 * @param {SearchContextValue} props.searchValue
 * @param {(value: SearchContextValue) => void} props.setSearchValue
 * @param {() => void} props.onClose
 */
export function SearchOptionsModal({
  searchValue,
  setSearchValue,
  onClose,
}) {
  function setSearchOption(newOptions) {
    // Auto-enable/disable if we're setting text
    const enabled = typeof newOptions.text === "undefined" ?
      searchValue.enabled : (!!newOptions.text);

    setSearchValue({ ...searchValue, enabled, ...newOptions });
  }

  let isInvalidRegex = false;

  if (searchValue.regex) {
    try {
      RegExp(searchValue.text);
    }
    catch (e) {
      isInvalidRegex = true;
    }
  }

  return (
    <div className="App-shade" onClick={onClose}>
      <div className="App-modal App-Options" onClick={e => e.stopPropagation()}>
        <h1>Search</h1>
        <div className="App-modalbody">
          <div className="App-formgroup">
            <label htmlFor="chk-enabled">
              Enabled
            </label>
            <input id="chk-enabled" type="checkbox" checked={searchValue.enabled} onChange={e => setSearchOption({ enabled: e.target.checked })} />
          </div>
          <div className="App-formgroup">
            <label>
              Mode
            </label>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ flexBasis: 28 }}>
                <input name="radio-search-mode" type="radio" value="highlight" checked={searchValue.mode === "highlight"} onChange={e => setSearchOption({ mode: e.target.checked ? "highlight" : "filter" })} />
                Highlight
              </label>
              <label style={{ flexBasis: 28 }}>
                <input name="radio-search-mode" type="radio" value="filter" checked={searchValue.mode === "filter"} onChange={e => setSearchOption({ mode: e.target.checked ? "filter" : "highlight" })} />
                Filter
              </label>
            </div>
          </div>
          <div className="App-formgroup">
            <label htmlFor="text-search-input">
              Term
            </label>
            <div>
              <input id="text-search-input" value={searchValue.text} onChange={e => setSearchOption({ text: e.target.value })} />
              {isInvalidRegex && <p style={{ color: "#FF4444", fontSize: "0.8em", fontStyle: "italic", margin: "8px 0" }}>Invalid Regex</p>}
            </div>
          </div>
          <div className="App-formgroup">
            <label htmlFor="chk-case-sensitive">
              Case-Sensitive
            </label>
            <input id="chk-case-sensitive" type="checkbox" checked={searchValue.caseSensitive} onChange={e => setSearchOption({ caseSensitive: e.target.checked })} />
          </div>
          <div className="App-formgroup">
            <label htmlFor="chk-regex">
              Regex
            </label>
            <input id="chk-regex" type="checkbox" checked={searchValue.regex} onChange={e => setSearchOption({ regex: e.target.checked })} />
          </div>
          <div className="App-formgroup">
            <label>
              Search in
            </label>
            <div>
              <label htmlFor="chk-headlines" style={{ display: "block", marginBottom: 8 }}>
                <input id="chk-headlines" type="checkbox" checked={searchValue.includeHeadline} onChange={e => setSearchOption({ includeHeadline: e.target.checked })} />
                Headline
              </label>
              <label htmlFor="chk-sources" style={{ display: "block", marginBottom: 8 }}>
                <input id="chk-sources" type="checkbox" checked={searchValue.includeSource} onChange={e => setSearchOption({ includeSource: e.target.checked })} />
                Source Name
              </label>
            </div>
          </div>
          <div className="App-formgroup">
            <label>

            </label>
            <button onClick={() => setSearchValue(defaultSearchContextValue)}>Clear Search</button>
          </div>
        </div>
        <p style={{ textAlign: "right", marginBottom: 0 }}>
          <button onClick={onClose}>Dismiss</button>
        </p>
      </div>
    </div>
  );
}
