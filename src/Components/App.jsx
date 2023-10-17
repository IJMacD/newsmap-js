import React, { Component, useState } from 'react';

import Edition from './Edition.jsx';

import { ucfirst, luminance } from '../util.js';
import defaultColours, * as palettes from '../colours.js';

import editions from '../data/editions.json';
import availableCategories from '../data/categories.json';

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
      selectedEditions: ["GB_en"],
      mode: "tree",
      showImages: false,
      palette: "default",
      showOptions: false,
      headerTop: false,
      itemsPerCategory: 10,
      refreshTime: 10 * 60 * 1000,
      newTab: true,
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

function OptionsModal ({
  selectedEditions,
  mode,
  headerTop,
  itemsPerCategory,
  newTab,
  selectedPalette,
  onClose,
  onEditionChange,
  setSavedState
}) {
  return (
    <div className="App-shade" onClick={onClose}>
      <div className="App-modal App-Options" onClick={e => e.stopPropagation()}>
        <h1>Options</h1>
        <div className="App-modalbody">
          <div className="App-formgroup">
            <label htmlFor="sel-editions">
              Edition
            </label>
            <select
              id="sel-editions"
              multiple
              onChange={onEditionChange}
              value={selectedEditions}
            >
              {
                editions.map(ed => <option key={ed.value} value={ed.value}>{ed.name}</option>)
              }
            </select>
          </div>
          <div className="App-formgroup">
            <label htmlFor="chk-top-header">
              Controls on Top
            </label>
            <input id="chk-top-header" type="checkbox" checked={headerTop} onChange={e => setSavedState({ headerTop: e.target.checked })} />
          </div>
          <div className="App-formgroup">
            <label htmlFor="sel-layout-mode">
              Layout Mode
            </label>
            <select id="sel-layout-mode" value={mode} onChange={e => setSavedState({ mode: e.target.value })}>
              <option value="tree">Tree Map</option>
              <option value="tree_mixed">Tree Map (mixed)</option>
              <option value="grid">Grid</option>
            </select>
          </div>
          <div className="App-formgroup">
            <label>
              Palette
            </label>
            <PaletteSelect selectedPalette={selectedPalette} setPalette={(name) => setSavedState({ palette: name })} />
          </div>
          <div className="App-formgroup">
            <label htmlFor="num-per-cat">
              Items per category
            </label>
            <div>
              <input id="num-per-cat" type="number" min={0} value={itemsPerCategory} onChange={e => setSavedState({ itemsPerCategory: e.target.value })} />
              <p style={{fontStyle:"italic",fontSize:"0.8em"}}>(Max is about 70 for most editions)</p>
            </div>
          </div>
          <div className="App-formgroup">
            <label htmlFor="chk-new-tab">
              Open links in new tab
            </label>
            <input id="chk-new-tab" type="checkbox" checked={newTab} onChange={e => setSavedState({ newTab: e.target.checked })} />
          </div>
          {
            // @ts-ignore
            typeof import.meta.env.VITE_DONATION_LINK === "string" && <DonationLink />
          }
        </div>
        <p style={{ textAlign: "right", marginBottom: 0 }}>
          <button onClick={onClose}>Dismiss</button>
        </p>
      </div>
    </div>
  );
}

function PaletteSelect ({ selectedPalette, setPalette }) {
  return Object.entries(palettes).map(([name, palette]) => {
    if (name === "default")
      return null;

    return (
      <div
        key={name}
        className="App-palette"
        style={{ outlineColor: name === selectedPalette ? "#FFF" : void 0 }}
        onClick={() => setPalette(name)}
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
  });
}

function DonationLink () {
  const [ showDonationLink, setShowDonationLink ] = useState(false);

  // @ts-ignore
  const link = import.meta.env.VITE_DONATION_LINK;

  return (
    <div className="App-formgroup">
      <label />
      {
        showDonationLink ?
          <p>If you find NewsMap.JS useful, donations are very much appreciated to help pay for associated hosting costs.
          <a href={link} target="_blank" rel="noopener">{link}</a>.</p> :
          <p><button onClick={() => setShowDonationLink(true)} className="btn-link">I want to help with hosting costs.</button></p>
      }
    </div>
  );
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
