import $ from 'jquery';
import Grid from '../../..';

describe('Grid', function() {
  beforeEach(function() {
    loadFixtures('grid.html');

    this.$context = $('.js-project');
    this.$window = $('.js-window');
    this.$grid = this.$context.find('.js-grid-main');
    this.$gridItems = this.$grid.find('.js-grid-item-container');
  });

  afterEach(function() {
    this._grid.destroy();
  });

  describe('.init', function() {
    it('creates an array of grids found in the context', function() {
      this._grid = Grid.init({
        context: this.$context[0],
        window: this.$window[0],
      });

      expect(this._grid.grids).toHaveLength(1);
    });

    it('bind a window resize handler for every grid found in the context', function() {
      this._grid = Grid.init({
        context: this.$context[0],
        window: this.$window[0],
      });

      spyOn(this._grid.grids[0], '_autoSizeGrid');

      this.$window.trigger('resize');

      expect(this._grid.grids[0]._autoSizeGrid).toHaveBeenCalled();
    });
  });

  describe('rendering', function() {
    it('resizes the grid so the height of the last row is acceptable', function() {
      const maxRatio = 1.5;

      let rowHeights;

      function getRowHeights($items) {
        return {
          first: $items.first().height(),
          last: $items.last().height(),
        };
      }

      // Uncomment when PhantomJS supports flexbox
      // rowHeights = getRowHeights(this.$gridItems);
      // expect(rowHeights.last / rowHeights.first).toBeGreaterThan(maxRatio);

      this._grid = Grid.init({
        context: this.$context[0],
        window: this.$window[0],
        maxRatio,
      });

      rowHeights = getRowHeights(this.$gridItems);
      expect(rowHeights.last / rowHeights.first).toBeLessThan(maxRatio);
    });
  });

  describe('breakpoints', function() {
    it('uses default flex-grow when no breakpoints are provided', function() {
      this._grid = Grid.init({
        context: this.$context[0],
        window: this.$window[0],
        breakpoints: [],
      });

      const expectedBeforeResize = 140;
      const expectedAfterResize = 133;

      expect(this.$gridItems.eq(0).width()).toBeLessThan(expectedBeforeResize);

      this.$grid.width(600);
      this.$window.trigger('resize');

      expect(this.$gridItems.eq(0).width()).toBe(expectedAfterResize);
    });

    it('uses a scaled flex-grow when breakpoints are provided', function() {
      this._grid = Grid.init({
        context: this.$context[0],
        window: this.$window[0],
        breakpoints: [{
          width: this.$grid.width(),
          modifier: .1,
        }],
      });

      const expectedBeforeResize = 140;
      const expectedAfterResize = 3;

      expect(this.$gridItems.eq(0).width()).toBeLessThan(expectedBeforeResize);

      this.$grid.width(600);
      this.$window.trigger('resize');

      expect(this.$gridItems.eq(0).width()).toBe(expectedAfterResize);
    });
  });
});
