import { useState } from "react";
import { layoutTreeMap } from "../layoutTreeMap";

export function Playground() {
    const [widthText, setWidthText] = useState("300");
    const [heightText, setHeightText] = useState("50");
    const [horizontalBiasText, setHorizontalBiasText] = useState("1");
    const [sampleCount, setSampleCount] = useState(9);
    const [valuesText, setValuesText] = useState("5 5 4 3 2 1");
    const values = valuesText.split(/\D+/).map(n => +n);
    const [count, setCount] = useState(values.length);

    const width = +widthText;
    const height = +heightText;
    const horizontalBias = +horizontalBiasText;

    const heights = Array.from({ length: sampleCount }).map((_, i) => (i + 1) * height)

    return (
        <div className="Playground">
            <h1>Playground</h1>
            <label>Width <input type="number" value={widthText} onChange={e => setWidthText(e.target.value)} /></label>
            <label>Height <input type="number" value={heightText} onChange={e => setHeightText(e.target.value)} /></label>
            <label>Sample Count <input type="number" value={sampleCount} onChange={e => setSampleCount(e.target.valueAsNumber)} /></label>
            <label>Horizontal Bias <input type="number" step="0.1" value={horizontalBiasText} onChange={e => setHorizontalBiasText(e.target.value)} /></label>
            <label>Values <input value={valuesText} onChange={e => setValuesText(e.target.value)} /></label>
            <label>Count <input type="number" min="1" max={values.length} value={count} onChange={e => setCount(e.target.valueAsNumber)} /></label>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
                {
                    heights.map((height, i) =>
                        <div style={{ margin: 10 }}>
                            {getRatio(width, height)}
                            <TreeMap key={i} values={values} width={width} height={height} horizontalBias={horizontalBias} count={count} />
                        </div>
                    )
                }
            </div>
        </div>
    );
}

function TreeMap({ values, width, height, horizontalBias, count }) {
    let log = [];
    const totalValue = values.reduce(sum, 0);
    const dimensions = layoutTreeMap(values.slice(0, count), { width, height }, totalValue, horizontalBias, log);

    /** @type {import("react").CSSProperties} */
    const listStyle = {
        listStyle: "none",
        padding: 0,
        position: "relative",
        height,
        width,
    }

    return (
        <div>
            <ol style={listStyle}>
                {
                    dimensions.map((d, i) => {
                        /** @type {import("react").CSSProperties} */
                        const style = { ...d, position: "absolute", backgroundColor: `hsl(${i * 57}deg, 60%, 50%)` };

                        return <li key={i} style={style} />
                    })
                }
            </ol>
            <ul style={{ listStyle: "none", padding: 0, fontFamily: "monospace" }}>
                {
                    log.map((msg, i) => <li key={i}>{msg}</li>)
                }
            </ul>
        </div>
    )
}

/**
 * @param {number} a 
 * @param {number} b 
 */
function lcf(a, b) {
    let lcf = 1;
    for (let i = 2; i <= a; i++) {
        const ra = a % i;
        const rb = b % i;
        if (ra === 0 && rb === 0) {
            lcf = i;
        }
    }
    return lcf;
}

/**
 * @param {number} a 
 * @param {number} b 
 */
function getRatio(a, b) {
    let _lcf = a;
    while (_lcf > 1) {
        _lcf = lcf(a, b)
        a = a / _lcf;
        b = b / _lcf;
    }

    return `${a}:${b}`;
}

/**
 * @param {number} a
 * @param {number} b
 */
function sum(a, b) {
    return a + b;
}
