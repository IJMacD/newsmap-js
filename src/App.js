import React, { Component } from 'react';
import NewsAPI from './NewsAPI';
import { getNews } from './GoogleNewsRSS';
import './App.css';

const API_KEY = "078a06bfd81a4b24bb543e909c63ea3a";
const news = NewsAPI(API_KEY);

class App extends Component {
  constructor () {
    super();

    this.state = {
      categories: [],
    };
  }

  componentDidMount () {
    // const cats = [ "business", "entertainment", "gaming", "general", "health-and-medical", "music", "politics", "science-and-nature", "sport", "technology" ];
    // cats.forEach(category => {
    //   news.getNews({ category }).then(data => this.setState(oldState => {
    //     const newCat = { id: category, name: category, articles: data.articles };
    //     return { ...oldState, categories: [ ...oldState.categories, newCat] };
    //   }))
    // });

    const cats = [ "world", "nation", "business", "technology", "entertainment", "sports", "science", "health" ];
    cats.forEach(category => {
      getNews({ category }).then(data => this.setState(oldState => {
        let { articles } = data;

        articles = articles.sort((a,b) => b.sources.length - a.sources.length);
        
        const weight = articles.map(a => a.sources.length).reduce((a,b) => a+b, 0);
        const newCat = { id: category, name: category, articles, weight };

        let categories = [ ...oldState.categories, newCat ];

        categories = categories.sort((a,b) => b.weight - a.weight);

        return { ...oldState, categories };
      }))
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">JS NewsMap</h1>
        </header>
        <ul className="App-cat-list">
          {
            this.state.categories.map(category => {
              return (
                <li key={category.id}>
                  <p>{category.name} ({category.weight})</p>
                  <ul className="App-article-list">
                    {
                      category.articles.map((article,i) => {
                        const timeDelta = Date.now() - (new Date(article.publishedAt));
                        const age = timeDelta < (10 * 60 * 1000) ? "" : (timeDelta < (60 * 60 * 1000) ? "old" : "older");
                        return <li key={i}><a href={article.url} className={`article ${category.id} ${age}`} target="_blank">{article.title} ({article.sources.length})</a></li>
                      })
                    }
                  </ul>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
}

export default App;
