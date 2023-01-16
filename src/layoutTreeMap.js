/**
 *
 * @param {number[]} values
 * @param {{ width: number, height: number }} dimensions
 */
export function layoutTreeMap(values, { width, height }) {
  const dimensions = [];

  const ratio = height / width;
  const totalValue = values.reduce(sum, 0);

  let valueWidth = Math.sqrt(totalValue / ratio);
  let valueHeight = valueWidth * ratio;

  const scale = width / valueWidth;

  let horizontal = width < height;
  /** @type {number[]} */
  const row = []; // currentRow

  let currentX = 0;
  let currentY = 0;

  values.forEach(value => {
    const w = horizontal ? valueWidth : valueHeight; // valueLength
    const worst_n = worst(row, w);
    const worst_y = worst([...row, value], w);

    if (worst_y > worst_n) {
      layoutRow(row);
      row.length = 0;
    }

    row.push(value);
  });

  if (row.length) {
    layoutRow(row);
  }

  return dimensions;

  /**
   * @param {number[]} row
   */
  function layoutRow(row) {
    let rowValue = row.reduce(sum, 0);
    let rowWidth;
    let rowHeight;
    let x = currentX;
    let y = currentY;

    if (!horizontal) {
      rowWidth = rowValue / valueHeight;
      rowHeight = valueHeight;
      valueWidth -= rowWidth;
      currentX += rowWidth;
    }
    else {
      rowWidth = valueWidth;
      rowHeight = rowValue / valueWidth;
      valueHeight -= rowHeight;
      currentY += rowHeight;
    }

    row.forEach((/** @type {number} */ value) => {
      let valueWidth;
      let valueHeight;

      if (!horizontal) {
        valueWidth = rowWidth;
        valueHeight = value / rowWidth;
      }
      else {
        valueWidth = value / rowHeight;
        valueHeight = rowHeight;
      }

      dimensions.push({
        top: y * scale,
        left: x * scale,
        width: valueWidth * scale,
        height: valueHeight * scale,
      });

      if (!horizontal) {
        y += valueHeight;
      }
      else {
        x += valueWidth;
      }
    });

    horizontal = !horizontal;
  }

  /**
   * @param {number[]} R
   * @param {number} w
   */
  function worst(/* row */ R, /* width */ w) {
    if (!R.length)
      return Infinity;

    var w_2 = w * w, s = R.reduce(sum, 0), s_2 = s * s, r_max = R[0], r_min = R[R.length - 1];

    return Math.max(w_2 * r_min / s_2, s_2 / (w_2 * r_max));
  }

  /**
   * @param {number} a
   * @param {number} b
   */
  function sum(a, b) {
    return a + b;
  }
}
