import React, { Component } from 'react';

import Edition from './Edition';

import { ucfirst, luminance } from './util';
import defaultColours, * as palettes from './colours';
// @ts-ignore
import editions from './editions.json';
// @ts-ignore
import availableCategories from './categories.json';

import './App.css';

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
 * @prop {boolean} showImages
 * @prop {boolean} showOptions
 * @prop {boolean} headerTop
 * @prop {string} palette
 * @prop {number} itemsPerCategory
 * @prop {number} refreshTime
 * @prop {boolean} newTab
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
      selectedEditions: ["uk"],
      mode: "tree",
      showImages: false,
      palette: "default",
      showOptions: false,
      headerTop: false,
      itemsPerCategory: 20,
      refreshTime: 10 * 60 * 1000,
      newTab: false,
    };

    /** @type {AppState} */
    this.state = {
      ...defaultState,
      ...getSavedState(),
    };

    this.onResize = this.onResize.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.handleEditionChange = this.handleEditionChange.bind(this);

    // psuedo-state
    this.optionsCount = 0;
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

    if (window['ga']) {
      // Send analytics for new edition
      window['ga']('send', 'pageview', { "dimension1": selectedEditions[0] });
    }
  }

  setSavedState (newState) {
    localStorage["state"] = JSON.stringify({ ...getSavedState(), ...newState });

    this.setState(newState);
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.showOptions && !prevState.showOptions) {
      this.optionsCount++;
    }
  }

  componentDidMount () {
    window.addEventListener("resize", this.onResize);
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.onResize);
  }

  renderHeader(colours) {
    const { selectedCategories } = this.state;

    return (
      <header className="App-header">
        <div style={{ flex: 1 }}>
          <h1 className="App-title"><a href="https://newsmap.ijmacd.com">NewsMap.JS</a></h1>
          <p className="App-intro">
            Data from <a href="https://news.google.com">Google News</a>.
            Inspried by <a href="http://newsmap.jp">newsmap.jp</a>.
            Fork me on <a href="https://github.com/ijmacd/newsmap-js">GitHub</a>.
          </p>
        </div>
        <div>
          <button style={{ margin: 8 }} onClick={() => this.setState({ showOptions: true })}>Options</button>
          <button style={{ margin: 8 }} onClick={() => this.ref && requestFullscreen(this.ref)}>Fullscreen</button>
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

  renderOptions() {
    const {
      selectedEditions,
      showImages,
      mode,
      headerTop,
      itemsPerCategory,
      newTab,
    } = this.state;

    return (
      <div className="App-shade" onClick={() => this.setState({ showOptions: false })}>
        <div className="App-modal" onClick={e => e.stopPropagation()}>
          <h1>Options</h1>
          <div className="App-modalbody">
            <div className="App-formgroup">
              <label>
                Edition
              </label>
              <select
                style={{ verticalAlign: "top", height: 120 }}
                multiple
                onChange={this.handleEditionChange}
                value={selectedEditions}
              >
                {
                  editions.map(ed => <option key={ed.value} value={ed.value}>{ed.name}</option>)
                }
              </select>
            </div>
            <div className="App-formgroup">
              <label>
                Show Images
              </label>
              <input type="checkbox" checked={showImages} onChange={e => this.setSavedState({ showImages: e.target.checked })} />
            </div>
            <div className="App-formgroup">
              <label>
                Controls on Top
              </label>
              <input type="checkbox" checked={headerTop} onChange={e => this.setSavedState({ headerTop: e.target.checked })} />
            </div>
            <div className="App-formgroup">
              <label>
                View Mode
              </label>
              <select value={mode} onChange={e => this.setSavedState({ mode: e.target.value })}>
                <option value="tree">Tree Map</option>
                <option value="tree_mixed">Tree Map (mixed)</option>
                <option value="grid">Grid</option>
              </select>
            </div>
            <div className="App-formgroup">
              <label>
                Palette:
              </label>
              {
                this.renderPalettes()
              }
            </div>
            <div className="App-formgroup">
              <label>
                Items per category:
              </label>
              <input type="number" min={0} value={itemsPerCategory} onChange={e => this.setSavedState({ itemsPerCategory: e.target.value })} />
            </div>
            <div className="App-formgroup">
              <label>
                Open in new tab
              </label>
              <input type="checkbox" checked={newTab} onChange={e => this.setSavedState({ newTab: e.target.checked })} />
            </div>
            { process.env.REACT_APP_BTC_ADDRESS && this.optionsCount >= 2 &&
              <p style={{ fontSize: 12, color: "#666", float: "left" }}>BTC: {process.env.REACT_APP_BTC_ADDRESS}</p>
            }
          </div>
          <p style={{ textAlign: "right", marginBottom: 0 }}>
            <button onClick={() => this.setState({ showOptions: false })}>Dismiss</button>
          </p>
        </div>
      </div>
    );
  }

  renderPalettes() {
    const { palette: selectedPalette } = this.state;

    return Object.entries(palettes).map(([name, palette]) => {
      if (name === "default")
        return null;

      return (
        <div
          key={name}
          className="App-palette"
          style={{ outlineColor: name === selectedPalette ? "#FFF" : null }}
          onClick={() => this.setSavedState({ palette: name })}
        >
          { Object.entries(palette).map(([cat, colour]) => (
            <div
              key={cat}
              className="App-swatch"
              style={{ backgroundColor: colour }}
              title={ucfirst(cat)}
            />
          )) }
        </div>
      );
    })
  }

  render() {
    const {
      selectedCategories,
      mode,
      showImages,
      showOptions,
      palette: selectedPalette,
      selectedEditions,
      headerTop,
      itemsPerCategory,
      refreshTime,
      newTab,
    } = this.state;

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
                availableCategories={availableCategories}
                showImages={showImages}
                colours={colours}
                selectedCategories={selectedCategories}
                itemsPerCategory={itemsPerCategory}
                refreshTime={refreshTime}
                newTab={newTab}
              />
            </div>
          ))
          }
        </div>
        { !headerTop && this.renderHeader(colours) }
        { showOptions && this.renderOptions() }
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

function requestFullscreen (el) {
  if (el.requestFullscreen) {
		el.requestFullscreen();
	} else if (el.mozRequestFullScreen) {
		el.mozRequestFullScreen();
	} else if (el.webkitRequestFullScreen) {
		el.webkitRequestFullScreen();
	}
}
