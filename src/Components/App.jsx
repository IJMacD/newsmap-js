import React, { Component } from 'react';

import Edition from './Edition.jsx';

import { ucfirst, luminance } from '../util.js';
import defaultColours, * as palettes from '../colours.js';

import editions from '../data/editions.json';
import availableCategories from '../data/categories.json';

import './App.css';
import { OptionsModal } from './OptionsModal.jsx';

/**
 * @typedef Category
 * @prop {string} id
 * @prop {string} name
 * @prop {any[]} articles
 * @prop {number} weight
 */

/**
 * @typedef AppState
 * @prop {Category[]} categories
 * @prop {string[]} selectedCategories
 * @prop {string[]} selectedEditions
 * @prop {"tree"|"grid"|"tree_mixed"} mode
 * @prop {"time"|"sources"|"position"} weightingMode
 * @prop {boolean} showImages
 * @prop {boolean} showOptions
 * @prop {boolean} headerTop
 * @prop {string} palette
 * @prop {number} itemsPerCategory
 * @prop {number} refreshTime
 * @prop {boolean} newTab
 * @prop {boolean} wakeLock
 */

/**
 * @augments Component<{}, AppState>
 */
class App extends Component {
  constructor (props) {
    super(props);

    /** @type {AppState} */
    const defaultState = {
      categories: [],
      selectedCategories: availableCategories,
      selectedEditions: ["GB_en"],
      mode: "tree",
      showImages: false,
      palette: "default",
      showOptions: false,
      headerTop: false,
      itemsPerCategory: 10,
      refreshTime: 10 * 60 * 1000,
      newTab: true,
      wakeLock: false,
      weightingMode: "time"
    };

    /** @type {AppState} */
    this.state = {
      ...defaultState,
      ...getSavedState(),
    };

    this.onResize = this.onResize.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.handleEditionChange = this.handleEditionChange.bind(this);

    this.wakeLockRef = null;
  }

  onResize () {
    this.forceUpdate();
  }

  onCategoryChange (e) {
    let { selectedCategories } = this.state;
    const { checked, value } = e.target;

    if (e.nativeEvent.altKey) {
      if (selectedCategories.length === 1 && selectedCategories[0] === value) {
        selectedCategories = availableCategories;
      } else {
        selectedCategories = [ value ];
      }
    } else if (checked) {
      selectedCategories = [ ...selectedCategories, value ];
    } else {
      selectedCategories = selectedCategories.filter(c => c !== value );
    }

    this.setSavedState({ selectedCategories });
  }

  handleEditionChange (e) {
    const { options } = e.target;

    const selectedEditions = Array.from(options).filter(o => o.selected).map(o => o.value);

    this.setSavedState({ selectedEditions });

    this.setState({ categories: [] });
  }

  setSavedState (newState) {
    localStorage["state"] = JSON.stringify({ ...getSavedState(), ...newState });

    this.setState(newState);
  }

  componentDidMount () {
    window.addEventListener("resize", this.onResize);

    // this.refreshInterval = setInterval(() => {
    //   this.forceUpdate();
    // }, 5 * 60 * 1000);
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.onResize);

    // clearInterval(this.refreshInterval);
  }

  componentDidUpdate () {
    if (this.state.wakeLock) {
      if (!this.wakeLockRef) {
        navigator.wakeLock.request("screen").then(sentinel => {
          this.wakeLockRef = sentinel;

          // Keep UI up to date if system released wakeLock
          sentinel.addEventListener("release", () => {
            this.setState({ wakeLock: false });
          })
        }, err => {
          // Couldn't acquire wakeLock
          this.setState({ wakeLock: false });
        });
      }
    }
    else {
      if (this.wakeLockRef) {
        this.wakeLockRef.release();
        this.wakeLockRef = null;
      }
    }
  }

  renderHeader(colours) {
    const { selectedCategories, wakeLock } = this.state;

    return (
      <header className="App-header">
        <div style={{ flex: 1 }}>
          <h1 className="App-title"><a href="https://newsmap.ijmacd.com">NewsMap.JS</a></h1>
          <p className="App-intro">
            Data from <a href="https://news.google.com">Google News</a>.
            Inspired by <a href="http://newsmap.jp">newsmap.jp</a>.
            Fork me on <a href="https://github.com/ijmacd/newsmap-js">GitHub</a>.
          </p>
        </div>
        <div style={{margin: 4}}>
          <button style={{ margin: 4 }} onClick={() => this.setState({ showOptions: true })}>Options</button>
          <button style={{ margin: 4 }} onClick={() => this.ref && requestFullscreen(this.ref)}>Fullscreen</button>
          {
            "wakeLock" in navigator &&
            <label style={{ margin: 4 }}><input type="checkbox" checked={wakeLock} onChange={(e) => this.setState({ wakeLock: e.target.checked })} /> Keep Screen On</label>
          }
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
      selectedCategories,
      mode,
      showOptions,
      palette: selectedPalette,
      selectedEditions,
      headerTop,
      itemsPerCategory,
      refreshTime,
      newTab,
      weightingMode,
    } = this.state;

    const showImages = false;

    const colours = palettes[selectedPalette] || defaultColours;

    const showEditionName = selectedEditions.length > 1;

    return (
      <div className="App">
        { headerTop && this.renderHeader(colours) }
        <div className="App-EditionContainer" ref={r => this.ref = r}>
          { selectedEditions.map(ed => (
            <div
              key={ed}
              style={{ height: showEditionName ? "calc(100% - 1em)" : "100%", flex: 1 }}
              className="App-Edition"
            >
              { showEditionName && <p style={{ color: "white", margin: 0, fontWeight: "bold", height: "1em" }}>{(findEdition(ed)||{}).name}</p> }
              <Edition
                edition={ed}
                mode={mode}
                showImages={showImages}
                colours={colours}
                categories={selectedCategories}
                itemsPerCategory={itemsPerCategory}
                refreshTime={refreshTime}
                newTab={newTab}
                weightingMode={weightingMode}
              />
            </div>
          ))
          }
        </div>
        { !headerTop && this.renderHeader(colours) }
        { showOptions &&
          <OptionsModal
            selectedEditions={this.state.selectedEditions}
            mode={this.state.mode}
            weightingMode={weightingMode}
            headerTop={this.state.headerTop}
            itemsPerCategory={this.state.itemsPerCategory}
            newTab={this.state.newTab}
            selectedPalette={this.state.palette}
            onClose={() => this.setState({ showOptions: false })}
            onEditionChange={this.handleEditionChange.bind(this)}
            setSavedState={this.setSavedState.bind(this)}
          />
        }
      </div>
    );
  }
}

export default App;

function getSavedState () {
  return typeof localStorage["state"] !== "undefined" ? JSON.parse(localStorage["state"]) : {};
}

function findEdition (id) {
  return editions.find(e => e.value === id);
}

/**
 * @param {HTMLElement} el
 */
function requestFullscreen (el) {
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
