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

  values.forEach((value, i, a) => {
    const rowFixedDimension = horizontal ? valueWidth : valueHeight; // valueLength
    let worst_currentValues;
    let worst_withAddition;

    // Special case for last item
    // Compare how it would be with last item in a new row by itself vs. adding
    // to current row.
    if (i == a.length - 1) {
      let remaining;
      if (horizontal) {
        const rowWidth = value / valueHeight;
        remaining = valueWidth - rowWidth;
      }
      else {
        const rowHeight = value / valueWidth;
        remaining = valueHeight - rowHeight;
      }
      worst_currentValues = worstAspectRatio([value], remaining);
      worst_withAddition = worstAspectRatio([...row, value], rowFixedDimension);
    }
    else {
      worst_currentValues = worstAspectRatio(row, rowFixedDimension);
      worst_withAddition = worstAspectRatio([...row, value], rowFixedDimension);
    }

    if (worst_withAddition > worst_currentValues) {
      finalizeRow(row);
    }

    row.push(value);
  });

  if (row.length) {
    finalizeRow(row);
  }

  return dimensions;

  /**
   * @param {number[]} row
   */
  function finalizeRow(row) {
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

    for (const value of row) {
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
    }

    horizontal = !horizontal;

    row.length = 0;
  }
}

/**
 * Returns the worst (most-extreme) aspect ratio found in this row
 * @param {number[]} R
 * @param {number} w
 */
function worstAspectRatio(/* row */ R, /* width */ w) {
  if (!R.length)
    return Infinity;

  var w_2 = w * w;
  var s = R.reduce(sum, 0);
  var s_2 = s * s;
  var r_max = R[0];
  var r_min = R[R.length - 1];

  return Math.max(w_2 * r_min / s_2, s_2 / (w_2 * r_max));
}

/**
 * @param {number} a
 * @param {number} b
 */
function sum(a, b) {
  return a + b;
}
