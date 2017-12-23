import React, { Component } from 'react';
import GridMap from './GridMap';
import TreeMap from './TreeMap';
import { getNews } from './GoogleNewsRSS';
import './App.css';

class App extends Component {
  constructor () {
    super();

    this.state = {
      categories: [],
      mode: "tree",
    };
  }

  componentDidMount () {
    this.loadAllCategories();

    this.timeout = setInterval(() => this.loadAllCategories(), 10 * 60 * 1000);
  }

  loadAllCategories () {

    const cats = [ "world", "nation", "business", "technology", "entertainment", "sports", "science", "health" ];
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
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">NewsMap.JS</h1>
        </header>
        <Map items={this.state.categories} />
      </div>
    );
  }
}

export default App;
