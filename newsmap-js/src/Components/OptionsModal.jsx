import React, { useState } from 'react';
import { ucfirst } from '../util.js';
import * as palettes from '../colours.js';
import editions from '../data/editions.json';

export function OptionsModal({
  selectedEditions,
  mode,
  weightingMode,
  showGradient,
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
              {editions.map(ed => <option key={ed.value} value={ed.value}>{ed.name}</option>)}
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
              <option value="tree_mixed">Tree Map (combined)</option>
              <option value="grid">Grid</option>
            </select>
          </div>
          <div className="App-formgroup">
            <label htmlFor="sel-weighting-mode">
              Weighting Mode
            </label>
            <select id="sel-weighting-mode" value={weightingMode} onChange={e => setSavedState({ weightingMode: e.target.value })}>
              <option value="time">Time based</option>
              <option value="sources">By source count and Google News position</option>
              <option value="position">By Google News position</option>
            </select>
          </div>
          <div className="App-formgroup">
            <label>
              Palette
            </label>
            <PaletteSelect selectedPalette={selectedPalette} setPalette={(name) => setSavedState({ palette: name })} />
          </div>
          <div className="App-formgroup">
            <label>
              Square Style
            </label>
            <div>
              <label htmlFor="chk-style-flat" style={{ marginBottom: 8 }}>
                <input id="chk-style-flat" name="chk-style" type="radio" checked={!showGradient} onChange={e => setSavedState({ showGradient: !e.target.checked })} />
                Flat
              </label>
              <label htmlFor="chk-style-gradient" style={{ marginBottom: 8 }}>
                <input id="chk-style-gradient" name="chk-style" type="radio" checked={showGradient} onChange={e => setSavedState({ showGradient: e.target.checked })} />
                Gradient
              </label>
            </div>
          </div>
          <div className="App-formgroup">
            <label htmlFor="num-per-cat">
              Items per category
            </label>
            <div>
              <input id="num-per-cat" type="number" min={0} value={itemsPerCategory} onChange={e => setSavedState({ itemsPerCategory: e.target.value })} />
              <p style={{ fontStyle: "italic", fontSize: "0.8em" }}>(Max is about 70 for most editions)</p>
            </div>
          </div>
          <div className="App-formgroup">
            <label htmlFor="chk-new-tab">
              Open links in new tab
            </label>
            <input id="chk-new-tab" type="checkbox" checked={newTab} onChange={e => setSavedState({ newTab: e.target.checked })} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "end" }}>
          {
            typeof window['env']['DONATION_LINK'] === "string" && <DonationLink />
          }
          <p style={{ textAlign: "right", marginBottom: 0 }}>
            <button onClick={onClose}>Dismiss</button>
          </p>
        </div>
      </div>
    </div>
  );
}

function PaletteSelect({ selectedPalette, setPalette }) {
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
        {Object.entries(palette).map(([cat, colour]) => (
          <div
            key={cat}
            className="App-swatch"
            style={{ backgroundColor: colour }}
            title={ucfirst(cat)} />
        ))}
      </div>
    );
  });
}

function DonationLink() {
  const [showDonationLink, setShowDonationLink] = useState(false);

  const link = window['env']['DONATION_LINK'];

  return (
    <div style={{ flex: 1 }}>
      {showDonationLink ?
        <p style={{ fontSize: "0.8em" }}>
          If you find NewsMap.JS useful, donations are very much appreciated to
          help pay for associated hosting costs.{' '}
          <a href={link} target="_blank" rel="noopener">{link}</a>.
        </p> :
        <p>
          <button onClick={() => setShowDonationLink(true)} className="btn-link">
            I want to help with hosting costs.
          </button>
        </p>
      }
    </div>
  );
}
