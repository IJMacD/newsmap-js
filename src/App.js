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
 * @prop {boolean} headerTop
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
      headerTop: false,
    };

    /** @type {AppState} */
    this.state = {
      ...defaultState,
      ...getSavedState(),
    };

    this.onResize = this.onResize.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.handleEditionChange = this.handleEditionChange.bind(this);
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
        </div>
        <div className="App-category-chooser">
        {
          availableCategories.map(cat => {
            const active = selectedCategories.includes(cat);
            const colour = active ? colours[cat] : "#999";
            return (
              <label
                key={cat}
                className="App-category-key"
                style={{ backgroundColor: colour, color: luminance(colour) > 128 ? "#111" : "#FFF" }}
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
    const { selectedEditions, showImages, mode, headerTop } = this.state;

    return (
      <div className="App-shade" onClick={() => this.setState({ showOptions: false })}>
        <div className="App-modal" onClick={e => e.stopPropagation()}>
          <h1>Options</h1>
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
    } = this.state;

    const colours = palettes[selectedPalette] || defaultColours;

    const showEditionName = selectedEditions.length > 1;

    return (
      <div className="App">
        { headerTop && this.renderHeader(colours) }
        <div style={{ display: "flex", height: "calc(100% - 48px)" }}>
          { selectedEditions.map(ed => (
            <div
              key={ed}
              style={{ height: showEditionName ? "calc(100% - 1em)" : "100%", flex: 1 }}
            >
              { showEditionName && <p style={{ color: "white", margin: 0, fontWeight: "bold", height: "1em" }}>{(findEdition(ed)||{}).name}</p> }
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
