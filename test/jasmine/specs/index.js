import $ from 'jquery';
import Grid from '../../..';

describe('Grid', function() {
  beforeEach(function() {
    loadFixtures('grid.html');

    this.$context = $('.js-project');
    this.$window = $('.js-window');
    this.$grid = this.$context.find('.js-grid-main');
  });

  afterEach(function() {
    this._grid.destroy();
  });

  describe('last row rendering', function() {
    it('resizes the grid so the height of the last row is acceptable', function() {
      const maxRatio = 1.5;
      const $gridItems = this.$grid.find('.js-grid-item-container');

      let rowHeights;

      function getRowHeights($items) {
        return {
          first: $items.first().height(),
          last: $items.last().height(),
        };
      }

      // rowHeights = getRowHeights($gridItems);
      // expect(rowHeights.last / rowHeights.first).toBeGreaterThan(maxRatio);

      this._grid = Grid.init(this.$context, this.$window, maxRatio);

      rowHeights = getRowHeights($gridItems);
      expect(rowHeights.last / rowHeights.first).toBeLessThan(maxRatio);
    });
  });
});
