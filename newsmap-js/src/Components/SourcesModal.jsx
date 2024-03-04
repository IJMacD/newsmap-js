import React, { useEffect, useRef } from 'react';

/**
 * @param {object} props
 * @param {import('./Edition').Article} props.article
 * @param {boolean} props.newTab
 * @param {() => void} props.onClose
 */
export function SourcesModal({
  article,
  newTab,
  onClose,
}) {

  const bodyRef = useRef(/** @type {HTMLDivElement?} */(null));

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.querySelector("a")?.focus();
    }
  }, []);

  return (
    <div className="App-shade" onClick={onClose}>
      <div className="App-modal App-Options" onClick={e => e.stopPropagation()}>
        <h1>Sources</h1>
        <div className="App-modalbody" ref={bodyRef}>
          {
            article.sources.map(source => (
              <a
                key={source.id}
                className="SourcesModal-Source"
                href={source.url}
                target={newTab ? "_blank" : undefined}
                rel="noopener"
                tabIndex={0}
              >
                <section>
                  <h1>{source.title}</h1>
                  <p>{source.name}</p>
                </section>
              </a>
            ))
          }
        </div>
        <p style={{ textAlign: "right", marginBottom: 0 }}>
          <button onClick={onClose}>Dismiss</button>
        </p>
      </div>
    </div>
  );
}
