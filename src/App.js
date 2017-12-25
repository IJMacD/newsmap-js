import React, { Component } from 'react';
import GridMap from './GridMap';
import TreeMap from './TreeMap';
import { getNews } from './GoogleNewsRSS';
import colours from './colours';

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

    const savedCats = localStorage["selectedCategories"];

    this.state = {
      categories: [],
      selectedCategories: (savedCats && JSON.parse(savedCats)) || availableCategories,
      mode: "tree",
    };

    this.onResize = this.onResize.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
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

    localStorage["selectedCategories"] = JSON.stringify(selectedCategories);

    this.setState({ selectedCategories });
  }

  componentDidMount () {
    this.loadAllCategories();

    this.timeout = setInterval(() => this.loadAllCategories(), 10 * 60 * 1000);

    window.addEventListener("resize", this.onResize);
  }

  componentWillUnmount () {
    clearInterval(this.timeout);

    window.removeEventListener("resize", this.onResize);
  }

  loadAllCategories () {

    const cats = availableCategories;

    cats.forEach(category => {
      getNews({ category }).then(data => this.setState(oldState => {
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
    const { selectedCategories } = this.state;

    const categories = this.state.categories.filter(c => selectedCategories.includes(c.id));

    return (
      <div className="App">
        <Map items={categories} />
        <header className="App-header">
          <div style={{ flex: 1 }}>
            <h1 className="App-title">NewsMap.JS</h1>
            <p className="App-intro">
              Data from <a href="https://news.google.com" target="_blank">Google News</a>.
              Inspried by <a href="http://newsmap.jp" target="_blank">newsmap.jp</a>.
              Fork me on <a href="https://github.com/ijmacd/newsmap-js" target="_blank">GitHub</a>.
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

/**
 *
 * @param {string} string
 */
function ucfirst (string) {
    return string.substr(0, 1).toUpperCase() + string.substr(1);
}
