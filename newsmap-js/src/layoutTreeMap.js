/**
 *
 * @param {number[]} values
 * @param {{ width: number, height: number }} dimensions
*/
export function layoutTreeMap(values, { width, height }, totalValue = values.reduce(sum, 0), horizontalBias = 1, log = []) {
  /** @type {{top: number, left: number, width: number, height: number}[]} */
  const dimensions = [];

  const ratio = height / width;

  let valueWidth = Math.sqrt(totalValue / ratio);
  let valueHeight = valueWidth * ratio;

  const scale = width / valueWidth;

  // Will start working in the direction of the smaller dimension
  let isHorizontal = width < height;

  log.push(`Total Value: ${totalValue}`);
  log.push(`Value Dimensions: (${isHorizontal ? "horizontal" : "vertical"}) ${valueWidth.toFixed(2)} x ${valueHeight.toFixed(2)}`);

  /** @type {number[]} */
  const row = []; // currentRow

  let currentX = 0;
  let currentY = 0;

  let cumlVal = 0

  values.forEach((value, i, a) => {
    const rowFixedDimension = isHorizontal ? valueWidth : valueHeight * horizontalBias;
    let worst_currentValues;
    let worst_withAddition;
    let worst_newRowValues;

    const isLast = value + cumlVal >= totalValue;

    // Special case for last item
    // Compare how it would be with last item in a new row by itself vs. adding
    // to current row.
    if (isLast) {
      let remaining;
      if (isHorizontal) {
        const rowWidth = value / valueHeight;
        remaining = valueWidth - rowWidth;
      }
      else {
        const rowHeight = value / valueWidth;
        remaining = valueHeight - rowHeight;
      }
      worst_currentValues = worstAspectRatio(row, remaining);
      worst_newRowValues = worstAspectRatio([value], remaining);
      worst_withAddition = worstAspectRatio([...row, value], rowFixedDimension);

      log.push(`Item ${i} value=${value} fixed=${rowFixedDimension.toFixed(2)} size=${(value / rowFixedDimension).toFixed(2)} ratio=${worst_withAddition.toFixed(2)} current=${worst_currentValues.toFixed(2)} newRow=${worst_newRowValues.toFixed(2)}`)
      worst_currentValues = worst_newRowValues;
      // worst_currentValues = Math.max(worst_newRowValues, worst_currentValues);
    }
    else {
      worst_currentValues = worstAspectRatio(row, rowFixedDimension);
      worst_withAddition = worstAspectRatio([...row, value], rowFixedDimension);

      log.push(`Item ${i} value=${value} fixed=${rowFixedDimension.toFixed(2)} size=${(value / rowFixedDimension).toFixed(2)} ratio=${worst_withAddition.toFixed(2)} current=${worst_currentValues.toFixed(2)}`)
    }


    if (worst_withAddition > worst_currentValues) {
      finalizeRow(row);
      log.push(`New ratio is worse. Switching dimension (${isHorizontal ? "horizontal" : "vertical"}) ${valueWidth.toFixed(2)} x ${valueHeight.toFixed(2)}`);
    }

    row.push(value);

    cumlVal += value;
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

    if (isHorizontal) {
      rowWidth = valueWidth;
      rowHeight = rowValue / valueWidth;
      valueHeight -= rowHeight;
      currentY += rowHeight;
    }
    else {
      rowWidth = rowValue / valueHeight;
      rowHeight = valueHeight;
      valueWidth -= rowWidth;
      currentX += rowWidth;
    }

    for (const value of row) {
      let valueWidth;
      let valueHeight;

      if (isHorizontal) {
        valueWidth = value / rowHeight;
        valueHeight = rowHeight;
      }
      else {
        valueWidth = rowWidth;
        valueHeight = value / rowWidth;
      }

      dimensions.push({
        top: y * scale,
        left: x * scale,
        width: valueWidth * scale,
        height: valueHeight * scale,
      });

      if (isHorizontal) {
        x += valueWidth;
      }
      else {
        y += valueHeight;
      }
    }

    isHorizontal = !isHorizontal;

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
