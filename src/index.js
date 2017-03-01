import $ from 'jquery';
import Grid from './Grid';

export default class Controller {
  constructor(config) {
    this.grids = $(config.context).find(config.gridSelector).toArray().map((el, index) => new Grid($(el), index, config));
  }

  // TODO: Needs tests
  refresh() {
    this.grids.forEach((grid) => grid.refresh());
  }

  destroy() {
    this.grids.forEach((grid) => grid.destroy());
  }

  static init(config) {
    return new Controller(Object.assign({
      window,
      context: document.body,
      gridSelector: '.js-grid-main',
      maxRatio: 1.5,
      breakpoints: [
        {
          width: 1325,
          modifier: 220 / 260,
        },
        {
          width: 1024,
          modifier: 170 / 260,
        },
        {
          width: 768,
          modifier: 130 / 260,
        },
        {
          width: 540,
          modifier: 90 / 260,
        },
      ],
    }, config));
  }
}
