import React, { Component } from 'react';

import Edition from './Edition.jsx';

import { ucfirst, luminance } from '../util.js';
import defaultColours, * as palettes from '../colours.js';

import editions from '../data/editions.json';
import availableCategories from '../data/categories.json';

import './App.css';
import { OptionsModal } from './OptionsModal.jsx';
import { SearchContext, defaultSearchContextValue } from '../SearchContext.js';
import { SearchOptionsModal } from './SearchOptionsModal.jsx';
import { SourcesModal } from './SourcesModal.jsx';

const defaultRefreshTime = 10 * 60 * 1000;

/**
 * @typedef Category
 * @prop {string} id
 * @prop {string} name
 * @prop {any[]} articles
 * @prop {number} weight
 */

/**
 * @typedef AppProps
 * @property {number} [refreshTime]
 * @property {string} [donationLink]
 */

/**
 * @typedef AppState
 * @prop {Category[]} categories
 * @prop {string[]} selectedCategories
 * @prop {string[]} selectedEditions
 * @prop {"tree"|"grid"|"tree_mixed"} mode
 * @prop {"time"|"sources"|"position"} weightingMode
 * @prop {boolean} showImages
 * @prop {boolean} showGradient
 * @prop {boolean} showOptions
 * @prop {boolean} showSearchOptions
 * @prop {boolean} headerTop
 * @prop {string} palette
 * @prop {number} itemsPerCategory
 * @prop {boolean} newTab
 * @prop {boolean} enableSourcesModal
 * @prop {boolean} wakeLock
 * @prop {import('../SearchContext.js').SearchContextValue} searchValue
 * @prop {import('./Edition.jsx').Article?} selectedArticle
 */

/**
 * @augments Component<AppProps, AppState>
 */
class App extends Component {
  /**
   * @param {AppProps} props
   */
  constructor(props) {
    super(props);

    /** @type {AppState} */
    const defaultState = {
      categories: [],
      selectedCategories: availableCategories,
      selectedEditions: ["GB_en"],
      mode: "tree",
      showImages: false,
      showGradient: true,
      palette: "default",
      showOptions: false,
      showSearchOptions: false,
      headerTop: false,
      itemsPerCategory: 10,
      newTab: true,
      enableSourcesModal: false,
      wakeLock: false,
      weightingMode: "time",
      searchValue: defaultSearchContextValue,
      selectedArticle: null,
    };

    /** @type {AppState} */
    this.state = {
      ...defaultState,
      ...getSavedState(),
      ...getQueryState(),
    };

    // Save selected Edition in case it has come from the query params
    // Will cause "Can't call setState on a component that is not yet mounted"
    // error.
    this.setSavedState({ selectedEditions: this.state.selectedEditions });

    this.onResize = this.onResize.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.handleEditionChange = this.handleEditionChange.bind(this);

    this.visibilityChangeCallback = () => {
      if (this.wakeLockRef !== null && document.visibilityState === "visible") {
        this.getWakeLock();
      }
    };

    this.wakeLockRef = null;

    this.keyupListener = (/** @type {KeyboardEvent} */ e) => {
      if (e.key === "Escape") {
        this.cancelModals();
      }
    };

    this.historyListener = (/** @type {PopStateEvent} */ e) => {
      this.setState({
        ...this.state,
        ...e.state,
      });
    };
  }

  onResize() {
    this.forceUpdate();
  }

  onCategoryChange(e) {
    let { selectedCategories } = this.state;
    const { checked, value } = e.target;

    if (e.nativeEvent.altKey) {
      if (selectedCategories.length === 1 && selectedCategories[0] === value) {
        selectedCategories = availableCategories;
      } else {
        selectedCategories = [value];
      }
    } else if (checked) {
      selectedCategories = [...selectedCategories, value];
    } else {
      selectedCategories = selectedCategories.filter(c => c !== value);
    }

    this.setSavedState({ selectedCategories });
  }

  handleEditionChange(editions) {
    this.setSavedState({ selectedEditions: editions });

    this.setState({ categories: [] });
  }

  setSavedState(newState) {
    localStorage["state"] = JSON.stringify({ ...getSavedState(), ...newState });

    this.setState(newState);
  }

  componentDidMount() {
    window.addEventListener("resize", this.onResize);

    document.addEventListener("visibilitychange", this.visibilityChangeCallback);

    document.addEventListener("keyup", this.keyupListener);

    window.addEventListener("popstate", this.historyListener);

    if (window['gtag']) {
      this.trackingTimeout = setInterval(() => {
        window['gtag']('event', 'refresh');
      }, this.props.refreshTime || defaultRefreshTime);
    }

    this.updatePage(true);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);

    document.removeEventListener("visibilitychange", this.visibilityChangeCallback);

    document.removeEventListener("keyup", this.keyupListener);

    window.removeEventListener("popstate", this.historyListener);

    clearInterval(this.trackingTimeout);
  }

  getWakeLock() {
    navigator.wakeLock.request("screen").then(sentinel => {
      this.wakeLockRef = sentinel;
    }, err => {
      // Couldn't acquire wakeLock
      this.setState({ wakeLock: false });
    });
  }

  componentDidUpdate() {
    if (this.state.wakeLock) {
      if (!this.wakeLockRef) {
        this.getWakeLock();
      }
    }
    else {
      if (this.wakeLockRef) {
        this.wakeLockRef.release();
        this.wakeLockRef = null;
      }
    }

    this.updatePage();
  }

  /**
   * @param {import('./Edition.jsx').Article} article
   * @param {import('react').MouseEvent} e
   */
  handleArticleClick(article, e) {
    if (this.state.enableSourcesModal) {
      e.preventDefault();
      this.setState({ selectedArticle: article });
    }
  }

  cancelModals() {
    this.setState({
      showOptions: false,
      showSearchOptions: false,
      selectedArticle: null,
    });
  }

  updatePage(replace = false) {
    // const searchParams = new URLSearchParams();

    // searchParams.set("edition", this.state.selectedEditions.join(","));

    const searchParams = "edition=" + this.state.selectedEditions.join(",");

    // if (this.state.searchValue.enabled) {
    //   searchParams.set("q", this.state.searchValue.text);
    // }

    // // If options are open, don't update URL as we type. Instead, retain the
    // // current value
    // if (this.state.showSearchOptions) {
    //   const currentParams = new URLSearchParams(window.location.search);
    //   const q = currentParams.get("q");
    //   if (q) {
    //     searchParams.set("q", q);
    //   }
    //   else {
    //     searchParams.delete("q");
    //   }
    // }

    const url = `?${searchParams}`;

    const historyState = {
      selectedEditions: this.state.selectedEditions,
      // searchValue: this.state.searchValue,
    };

    if (window.location.search === url || replace) {
      history.replaceState(historyState, "", url);
    }
    else {
      history.pushState(historyState, "", url);
    }

    const titleParts = [
      "NewsMap.JS",
      editions.filter(ed => this.state.selectedEditions.includes(ed.value)).map(ed => ed.name).join(", "),
    ];

    if (this.state.searchValue.enabled) {
      titleParts.push(this.state.searchValue.text);
    }

    document.title = titleParts.join(" - ");
  }

  renderHeader(colours) {
    const { selectedCategories, wakeLock, searchValue } = this.state;

    return (
      <header className="App-header">
        <div className="App-header-config">
          <div className="App-header-config-topline">
            <h1 className="App-title" style={{ flex: 1 }}><a href="https://newsmap.ijmacd.com">NewsMap.JS</a></h1>
            <div className="App-header-controls">
              <button style={{ margin: 4 }} onClick={() => this.setState({ showOptions: true })}>Options</button>
              <button style={{ margin: 4 }} onClick={() => this.ref && requestFullscreen(this.ref)}>Fullscreen</button>
              <button style={{ margin: 4, outline: searchValue.enabled ? "2px solid red" : void 0 }} onClick={() => this.setState({ showSearchOptions: true })}>{searchValue.enabled ? "Search Active" : "Search"}</button>
            </div>
            {
              "wakeLock" in navigator &&
              <label style={{ margin: 4 }}><input type="checkbox" checked={wakeLock} onChange={(e) => this.setState({ wakeLock: e.target.checked })} /> Keep Screen On</label>
            }
          </div>
          <p className="App-intro">
            Data from <a href="https://news.google.com">Google News</a>.
            Inspired by <a href="http://newsmap.jp">newsmap.jp</a>.
            Fork me on <a href="https://github.com/ijmacd/newsmap-js">GitHub</a>.
          </p>
        </div>
        <div className="App-category-chooser">
          {
            availableCategories.map(cat => {
              const active = selectedCategories.includes(cat);
              const backgroundColor = active ? colours[cat] : "#777";
              const color = active ? (luminance(backgroundColor) > 128 ? "#111" : "#FFF") : "#555";

              return (
                <label
                  key={cat}
                  className="App-category-key"
                  style={{ backgroundColor, color }}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={this.onCategoryChange}
                    value={cat} />
                  {ucfirst(cat)}
                </label>
              )
            })
          }
        </div>
      </header>
    );
  }

  render() {
    const {
      refreshTime
    } = this.props;

    const {
      selectedCategories,
      mode,
      showGradient,
      showOptions,
      showSearchOptions,
      palette: selectedPalette,
      selectedEditions,
      headerTop,
      itemsPerCategory,
      newTab,
      enableSourcesModal,
      weightingMode,
      selectedArticle,
    } = this.state;

    const showImages = false;

    const colours = palettes[selectedPalette] || defaultColours;

    const showEditionName = selectedEditions.length > 1;

    return (
      <div className={`App ${headerTop ? "App-header-top" : "App-header-bottom"}`}>
        {headerTop && this.renderHeader(colours)}
        <SearchContext.Provider value={this.state.searchValue}>
          <div className="App-EditionContainer" ref={r => this.ref = r}>
            {selectedEditions.map(ed => (
              <div
                key={ed}
                style={{ height: showEditionName ? "calc(100% - 1rem)" : "100%", flex: 1 }}
                className="App-Edition"
              >
                {showEditionName && <p style={{ color: "white", margin: 0, fontWeight: "bold", height: "1rem", fontSize: "0.8rem" }}>{(findEdition(ed) || {}).name}</p>}
                <Edition
                  edition={ed}
                  mode={mode}
                  showImages={showImages}
                  showGradient={showGradient}
                  colours={colours}
                  categories={selectedCategories}
                  itemsPerCategory={itemsPerCategory}
                  refreshTime={refreshTime || defaultRefreshTime}
                  newTab={newTab}
                  weightingMode={weightingMode}
                  onArticleClick={this.handleArticleClick.bind(this)}
                />
              </div>
            ))
            }
            {enableSourcesModal && selectedArticle &&
              <SourcesModal
                article={selectedArticle}
                newTab={newTab}
                onClose={() => this.setState({ selectedArticle: null })}
              />
            }
          </div>
        </SearchContext.Provider>
        {!headerTop && this.renderHeader(colours)}
        {showOptions &&
          <OptionsModal
            selectedEditions={this.state.selectedEditions}
            mode={this.state.mode}
            weightingMode={weightingMode}
            headerTop={this.state.headerTop}
            showGradient={this.state.showGradient}
            itemsPerCategory={this.state.itemsPerCategory}
            newTab={this.state.newTab}
            enableSourcesModal={this.state.enableSourcesModal}
            selectedPalette={this.state.palette}
            onClose={() => this.setState({ showOptions: false })}
            onEditionChange={this.handleEditionChange.bind(this)}
            setSavedState={this.setSavedState.bind(this)}
            donationLink={this.props.donationLink}
          />
        }
        {showSearchOptions &&
          <SearchOptionsModal
            searchValue={this.state.searchValue}
            setSearchValue={searchValue => this.setSavedState({ searchValue })}
            onClose={() => this.setState({ showSearchOptions: false })}
          />
        }
      </div>
    );
  }
}

export default App;

function getSavedState() {
  return typeof localStorage["state"] !== "undefined" ? JSON.parse(localStorage["state"]) : {};
}

function findEdition(id) {
  return editions.find(e => e.value === id);
}

/**
 * @param {HTMLElement} el
 */
function requestFullscreen(el) {
  if (el.requestFullscreen) {
    el.requestFullscreen();
    // @ts-ignore
  } else if (el.mozRequestFullScreen) {
    // @ts-ignore
    el.mozRequestFullScreen();
    // @ts-ignore
  } else if (el.webkitRequestFullScreen) {
    // @ts-ignore
    el.webkitRequestFullScreen();
  }
}

function getQueryState() {
  const queryState = {};

  const queryParams = new URLSearchParams(location.search);

  const edition = queryParams.get("edition");
  if (edition) {
    const queryEditions = edition.split(",").filter(e => editions.some(ed => ed.value === e));
    if (queryEditions.length) {
      queryState.selectedEditions = queryEditions;
    }
  }

  const searchValue = defaultSearchContextValue;
  const q = queryParams.get("q");
  if (q) {
    searchValue.text = q;
    searchValue.enabled = true;

    queryState.searchValue = searchValue;
  }

  return queryState;
}