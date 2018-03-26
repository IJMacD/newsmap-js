import React, { Component } from 'react';
import Edition from './Edition';
import { ucfirst, luminance } from './util';

import defaultColours, * as palettes from './colours';
import editions from './editions.json';

import './App.css';

const availableCategories = [
  "world",
  "nation",
  "business",
  "technology",
  "entertainment",
  "sports",
  "science",
  "health"
];

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
 * @prop {"tree"|"grid"} mode
 * @prop {boolean} showImages
 * @prop {boolean} showOptions
 * @prop {string} palette
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
    };

    /** @type {AppState} */
    this.state = {
      ...defaultState,
      ...getSavedState(),
    };

    this.onResize = this.onResize.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.handleEditionChange = this.handleEditionChange.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.handleModeChange = this.handleModeChange.bind(this);
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

    saveState({ selectedCategories });

    this.setState({ selectedCategories });
  }

  handleEditionChange (e) {
    const { options } = e.target;

    const selectedEditions = Array.from(options).filter(o => o.selected).map(o => o.value);

    saveState({ selectedEditions });

    this.setState({ selectedEditions, categories: [] });

    if (window['ga']) {
      // Send analytics for new edition
      window['ga']('send', 'pageview', { "dimension1": selectedEditions[0] });
    }
  }

  handleImageChange (e) {
    const newState = { showImages: e.target.checked };

    saveState(newState);
    this.setState(newState);
  }

  handlePaletteChange (palette) {
    const newState = { palette };

    saveState(newState);
    this.setState(newState);
  }

  handleModeChange (e) {
    const newState = { mode: e.target.value };

    saveState(newState);
    this.setState(newState);
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
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline" }}>
            <h1 className="App-title"><a href="https://newsmap.ijmacd.com">NewsMap.JS</a></h1>
            <button style={{ marginLeft: 7 }} onClick={() => this.setState({ showOptions: true })}>Options</button>
          </div>
          <p className="App-intro">
            Data from <a href="https://news.google.com">Google News</a>.
            Inspried by <a href="http://newsmap.jp">newsmap.jp</a>.
            Fork me on <a href="https://github.com/ijmacd/newsmap-js">GitHub</a>.
          </p>
        </div>
        <div className="App-category-chooser">
        {
          availableCategories.map(cat => {
            const colour = colours[cat];
            return (
              <label
                key={cat}
                className="App-category-key"
                style={{ backgroundColor: colour, color: luminance(colour) > 128 ? "#111" : "#FFF" }}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
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
    const { selectedEditions, showImages, mode } = this.state;

    return (
      <div className="App-shade" onClick={() => this.setState({ showOptions: false })}>
        <div className="App-modal" onClick={e => e.stopPropagation()}>
          <h1>Options</h1>
          <label>
            Edition
            <select
              style={{ marginLeft: 10, verticalAlign: "top" }}
              multiple
              onChange={this.handleEditionChange}
              value={selectedEditions}
            >
              {
                editions.map(ed => <option key={ed.value} value={ed.value}>{ed.name}</option>)
              }
            </select>
          </label>
          <label>
            Show Images
            <input type="checkbox" checked={showImages} onChange={this.handleImageChange} />
          </label>
          <label>
            View Mode
            <select value={mode} style={{ marginLeft: 10 }} onChange={this.handleModeChange}>
              <option value="tree">Tree Map</option>
              <option value="grid">Grid</option>
            </select>
          </label>
          <label>
            Palette:
            {
              this.renderPalettes()
            }
          </label>
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
          style={{ outlineColor: name === selectedPalette ? "#FFF" : false }}
          onClick={() => this.handlePaletteChange(name)}
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
    const { selectedCategories, mode, showImages, showOptions, palette: selectedPalette, selectedEditions } = this.state;

    const colours = palettes[selectedPalette] || defaultColours;

    const showEditionName = selectedEditions.length > 1;

    return (
      <div className="App">
        <div style={{ display: "flex", height: "calc(100% - 50px)" }}>
          { selectedEditions.map(ed => (
            <div
              key={ed}
              style={{ height: showEditionName ? "calc(100% - 1em)" : "100%", flex: 1 }}
            >
              { showEditionName && <p style={{ color: "white", margin: 0, fontWeight: "bold" }}>{(findEdition(ed)||{}).name}</p> }
              <Edition
                edition={ed}
                mode={mode}
                availableCategories={availableCategories}
                showImages={showImages}
                colours={colours}
                selectedCategories={selectedCategories}
              />
            </div>
          ))
          }
        </div>
        { this.renderHeader(colours) }
        { showOptions && this.renderOptions() }
      </div>
    );
  }
}

export default App;

function getSavedState () {
  return typeof localStorage["state"] !== "undefined" ? JSON.parse(localStorage["state"]) : {};
}

function saveState (state) {
  localStorage["state"] = JSON.stringify({ ...getSavedState(), ...state });
}

function findEdition (id) {
  return editions.find(e => e.value === id);
}
