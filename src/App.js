import React, { Component } from 'react';
import GridMap from './GridMap';
import TreeMap from './TreeMap';
import { getNews } from './GoogleNewsRSS';
import { ucfirst } from './util';
import Article from './Article';

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
 * @prop {string} edition
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
      edition: "uk",
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
    const { value } = e.target;

    saveState({ edition: value });

    this.setState({ edition: value, categories: [] });

    this.loadAllCategories(value);

    if (window['ga']) {
      // Send analytics for new edition
      window['ga']('send', 'pageview', { "dimension1": value });
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

  handleItemClick (e, item) {
    if (e.altKey) {
      e.preventDefault();

      item.sources.push(item.sources.shift());

      item.title = item.sources[0].originalTitle;
      item.url = item.sources[0].originalURL;

      this.forceUpdate();

      return;
    }
  }

  componentDidMount () {
    this.loadAllCategories(this.state.edition);

    if (window['ga']) {
      window['ga']('send', 'pageview', { "dimension1": this.state.edition });
    }

    this.timeout = setInterval(() => this.loadAllCategories(this.state.edition), 10 * 60 * 1000);

    window.addEventListener("resize", this.onResize);
  }

  componentWillUnmount () {
    clearInterval(this.timeout);

    window.removeEventListener("resize", this.onResize);
  }

  loadAllCategories (edition) {

    const cats = availableCategories;

    cats.forEach(category => {
      getNews({ category, edition }).then(data => this.setState(oldState => {
        let { articles } = data;

        articles = articles.sort((a,b) => b.sources.length - a.sources.length);

        const weight = articles.map(a => Math.pow(Math.E, a.sources.length)).reduce((a,b) => a+b, 0);
        const newCat = { id: category, name: category, articles, weight };

        let categories = [ ...oldState.categories.filter(c => c.name !== category), newCat ];

        categories = categories.sort((a,b) => b.weight - a.weight);

        return { categories };
      }), err => {
        if (err === "CORS Error" && !this.embarrassed) {
          this.embarrassed = true;
          alert("Well this is embarrassing.\n\nI'll be honest - Google News RSS servers don't exactly play nicely with NewsMap.JS. More accurately they just don't consider CORS which would let us load the news directly. Instead I need to proxy the requests through the NewsMap.JS servers and I'm too cheap to implement the proxying properly.\n\nMy advice is to try a different news edition in the options.");
        }
        console.log(err);
      });
    });
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
    const { edition, showImages, mode } = this.state;

    return (
      <div className="App-shade" onClick={() => this.setState({ showOptions: false })}>
        <div className="App-modal" onClick={e => e.stopPropagation()}>
          <h1>Options</h1>
          <label>
            Edition
            <select value={edition} style={{ marginLeft: 10 }} onChange={this.handleEditionChange}>
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
    const Map = this.state.mode === "tree" ? TreeMap : GridMap;
    const { selectedCategories, showImages, showOptions, palette: selectedPalette } = this.state;

    const categories = this.state.categories.filter(c => selectedCategories.includes(c.id));
    const colours = palettes[selectedPalette] || defaultColours;

    return (
      <div className="App">
        <Map
          items={categories}
          itemRender={props => (
            <Article
              showImages={showImages}
              colours={colours}
              onClick={e => this.handleItemClick(e, props.item)}
              { ...props }
            />
          )}
        />
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

function luminance (c) {
  const R = parseInt(c.substr(1,2), 16);
  const G = parseInt(c.substr(3,2), 16);
  const B = parseInt(c.substr(5,2), 16);

  return (0.2126*R + 0.7152*G + 0.0722*B);
}
