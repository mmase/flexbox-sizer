import $ from 'jquery';

export default class Grid {
  constructor($grid, index, config) {
    this._$grid = $grid;
    this._index = index;
    this._$window = $(config.window);
    this._maxRatio = config.maxRatio;

    this._setGridData();

    this._autoSizeGrid();
    this._bind();
  }

  destroy() {
    this._$window.off('.grid-' + this._index);
  }

  _bind() {
    this._$window.on('resize.grid-' + this._index, () => this._autoSizeGrid());
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
      const borderWidth = $item.outerWidth(true) - $item.innerWidth();

      let { height, width } = this.getBoundingClientRect();
      width -= borderWidth;
      height -= borderWidth;

      const flexWidth = $item.data('flex-grow');
      const flexHeight = Math.round(flexWidth / width * height);

      images.push({
        $item,
        flexWidth,
        borderWidth,
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
      // Because we can't always calculate the grid perfectly, we must check
      // the actual rendered height of the last image to make sure that it truly was
      // rendered close to the average row height. If it is not below the maxRatio,
      // we will insert a spacer at the end of the last row.
    const lastImageActualHeight = $grid.find('.js-grid-item-container').last().height();

    this._toggleGridSpacer($grid, !modifierExists || lastImageActualHeight / averageRowHeight > maxFallbackRatio);
      // We need to set the appropriate "sizes" with on the images
      // so the minimum required sized asset is loaded
    this._setImageSizes(images);

    $grid.addClass('grid--ready');
  }

  _getGridModifierData(images, gridWidth, maxModifier) {
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
      flexModifier = 1 + (flexGrowth * direction);
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
    images.forEach(function({ $item }) {
      const width = $item.width();

      $item.find('.js-grid__item-image').attr({
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
      let sumOfFlexWidths = currentRow.reduce(function(a, b) {
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
      const modifiedFlexWidth = flexModifier * image.flexWidth + image.borderWidth;
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

      $item.css({
        width: newFlexWidth,
        flexGrow: `${newFlexWidth}`,
      });
    });
  }

  _toggleGridSpacer($grid, spacer) {
    $grid.find('.js-grid-spacer').toggleClass('grid__item-spacer', spacer);
  }
}
