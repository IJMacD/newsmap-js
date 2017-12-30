import React, { Component } from 'react';
import NoSleep from 'nosleep.js';

import GridMap from './GridMap';
import TreeMap from './TreeMap';
import { getNews } from './GoogleNewsRSS';
import { ucfirst } from './util';

import colours from './colours';
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

class App extends Component {
  constructor () {
    super();

    const defaultState = {
      categories: [],
      selectedCategories: availableCategories,
      edition: "uk",
      mode: "tree",
      showImages: false,
      noSleep: false,
      noSleepPrepared: false,
    };

    this.state = {
      ...defaultState,
      ...getSavedState(),
    };

    this.noSleep = new NoSleep();

    this.onResize = this.onResize.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.handleEditionChange = this.handleEditionChange.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.prepareNoSleep = this.prepareNoSleep.bind(this);

    document.addEventListener('click', this.prepareNoSleep, false);
  }

  prepareNoSleep () {
    this.noSleep.enable();
    this.noSleep.disable();
    document.removeEventListener('click', this.prepareNoSleep, false);
    this.setState({ noSleepPrepared: true });
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
  }

  handleImageChange (e) {
    const newState = { showImages: e.target.checked };

    saveState(newState);
    this.setState(newState);
  }

  componentDidMount () {
    this.loadAllCategories(this.state.edition);

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

        return { ...oldState, categories };
      }), err => console.log(err))
    });
  }

  render() {
    const Map = this.state.mode === "tree" ? TreeMap : GridMap;
    const { selectedCategories, edition, showImages, noSleep, noSleepPrepared } = this.state;

    const categories = this.state.categories.filter(c => selectedCategories.includes(c.id));

    return (
      <div className="App">
        <Map items={categories} showImages={showImages} />
        <header className="App-header">
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline" }}>
              <h1 className="App-title">NewsMap.JS</h1>
              <select value={edition} style={{ marginLeft: 10 }} onChange={this.handleEditionChange}>
                {
                  editions.map(ed => <option key={ed.value} value={ed.value}>{ed.name}</option>)
                }
              </select>
              <label style={{ marginLeft: 7 }}>
                <input type="checkbox" checked={showImages} onChange={this.handleImageChange} />
                Images
              </label>
              { noSleepPrepared &&
                <label style={{ marginLeft: 7 }}>
                  <input type="checkbox" checked={noSleep} onChange={() => this.setState({ noSleep: !noSleep })} />
                  No Sleep
                </label>
              }
            </div>
            <p className="App-intro">
              Data from <a href="https://news.google.com">Google News</a>.
              Inspried by <a href="http://newsmap.jp">newsmap.jp</a>.
              Fork me on <a href="https://github.com/ijmacd/newsmap-js">GitHub</a>.
            </p>
          </div>
          <div className="App-category-chooser">
          {
            availableCategories.map(cat => (
              <label
                key={cat}
                className="App-category-key"
                style={{ backgroundColor: colours[cat][0] }}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={this.onCategoryChange}
                  value={cat} />
                {ucfirst(cat)}
              </label>
            ))
          }
          </div>
        </header>
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
