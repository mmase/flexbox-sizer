import $ from 'jquery';

export default class Grid {
  constructor($grid, index, { window, maxRatio, breakpoints }) {
    this._$grid = $grid;
    this._index = index;
    this._$window = $(window);
    this._maxRatio = maxRatio;
    this._breakpoints = breakpoints;

    this.refresh();
    this._bind();
  }

  refresh() {
    this._setGridData();
    this._autoSizeGrid();
  }

  destroy() {
    this._$window.off('refresh-grids.grid-' + this._index);
    this._$window.off('.grid-' + this._index);
  }

  _bind() {
    this._$window.on('refresh-grids.grid-' + this._index, () => this.refresh());
    this._$window.on('resize.grid-' + this._index, () => this._autoSizeGrid());
  }

  _getBreakpointModifier(gridWidth) {
    const { modifier } = this._breakpoints.reduce((minBreakpoint, cur) => {
      return cur.width >= gridWidth && cur.width < minBreakpoint.width ? cur : minBreakpoint;
    }, { width: Infinity, modifier: 1 });

    return modifier;
  }

  _autoSizeGrid() {
    const gridWidth = this._$grid.width();

    this._recalcWidths(this._$grid, gridWidth);
  }

  _setGridData() {
    this._gridData = this._getGridData(this._$grid);
  }

  _getGridData($grid) {
    const images = [];

    $grid.find('.js-grid-item-container').each(function() {
      const $item = $(this);
      const height = $item.data('height') || $item.height();
      const width = $item.data('width') || $item.width();
      const nonContentWidth = $item.outerWidth(true) - width;
      const flexWidth = $item.data('flex-grow');
      const flexHeight = Math.round(flexWidth * height / width);

      images.push({
        $item,
        flexWidth,
        nonContentWidth,
        flexHeight,
      });
    });

    return images;
  }

  _recalcWidths($grid, gridWidth) {
    const images = this._gridData;
    const maxModifier = 2;
    const maxFallbackRatio = 2.5;
    const { flexModifier, averageRowHeight } = this._getGridModifierData(images, gridWidth, maxModifier);
    const modifierExists = flexModifier < maxModifier;

    this._adjustWidths(images, modifierExists ? flexModifier : 1);

    // @todo: needs tests
    // The grid isn't always calculated perfectly, so check the actual rendered height of the last image to make sure that it
    // truly was rendered close to the average row height. If it is not below the maxRatio, insert a spacer at the end of the last row.
    // Remove the grid spacer before measuring whether the last row is correctly rendered, otherwise flapping will occur.
    this._toggleGridSpacer($grid, false);
    const lastImageActualHeight = $grid.find('.js-grid-item-container').last().height();
    this._toggleGridSpacer($grid, !modifierExists || lastImageActualHeight / averageRowHeight > maxFallbackRatio);

    // We need to set the appropriate "sizes" with on the images
    // so the minimum required sized asset is loaded
    this._setImageSizes(images);

    $grid.addClass('grid--ready');
  }

  _getGridModifierData(images, gridWidth, maxModifier) {
    const breakpointModifier = this._getBreakpointModifier(gridWidth);
    // The flexModifier starts at 1, which initially renders the grid images with
    // the flex-grow value provided by the server. This function oscillates
    // this modifier by the flexGrowth value until the while loop is satisfied;
    // ultimately creating a last row of average height.
    let flexModifier = 1;
    let flexGrowth = 0;
    let last = 2;
    let averageRowHeight = 1;
    let direction = -1;
    let rest;
    let rowHeights;

    while (last / averageRowHeight > this._maxRatio && flexModifier < maxModifier) {
      direction *= -1;
      flexModifier = (1 + (flexGrowth * direction)) * breakpointModifier;
      rowHeights = this._getRowHeights(images, gridWidth, flexModifier);
      [last, ...rest] = rowHeights.reverse();
      averageRowHeight = rest.reduce((sum, height) => sum + height, 0) / rest.length;
      flexGrowth += .005;
    }

    return {
      averageRowHeight,
      flexModifier,
    };
  }

  _setImageSizes(images) {
    images.forEach(({ $item }) => {
      const width = $item.width();

      $item.find('img').attr({
        sizes: width + 'px',
        'data-sizes': width + 'px',
      });
    });
  }

  _getRowHeights(images, gridWidth, flexModifier) {
    return this._getGridDimensions(images, gridWidth, flexModifier).map((images) => {
      return images[0].height;
    });
  }

  _getGridDimensions(images, gridWidth, flexModifier) {
    let gridDimensions = [];
    let currentRow = [];
    let remaining = gridWidth;

    function finalizeCurrentRow() {
      let rowDimensions = [];
      let sumOfFlexWidths = currentRow.reduce((a, b) => {
        return a + b.modifiedFlexWidth;
      }, 0);

      const scaleRatio = gridWidth / sumOfFlexWidths;

      if (currentRow.length) {
        currentRow.forEach((image) => {
          const width = image.modifiedFlexWidth * scaleRatio;
          const height = image.modifiedFlexHeight * scaleRatio;

          rowDimensions.push({
            width,
            height,
          });
        });

        gridDimensions.push(rowDimensions);
      }

      currentRow = [];
    }

    images.forEach((image) => {
      const modifiedFlexWidth = flexModifier * image.flexWidth + image.nonContentWidth;
      const modifiedFlexHeight = flexModifier * image.flexHeight;

      if (remaining >= modifiedFlexWidth) {
        remaining -= modifiedFlexWidth;
      }
      else {
        finalizeCurrentRow();
        remaining = gridWidth - modifiedFlexWidth;
      }

      currentRow.push({
        modifiedFlexWidth,
        modifiedFlexHeight,
      });
    });

    finalizeCurrentRow();

    return gridDimensions;
  }

  _adjustWidths(images, flexModifier) {
    images.forEach(({ $item, flexWidth }) => {
      const newFlexWidth = flexModifier * flexWidth;

      $item.width(newFlexWidth);

      $item.css('flexGrow', `${newFlexWidth}`);
    });
  }

  _toggleGridSpacer($grid, spacer) {
    $grid.find('.js-grid-spacer').toggleClass('grid__item-spacer', spacer);
  }
}
