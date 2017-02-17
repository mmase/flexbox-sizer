import $ from 'jquery';
import Grid from './Grid';

export default class Controller {
  constructor(config) {
    this._$context = $(config.context);
    this._$grids = this._$context.find(config.gridSelector);
    this._create(config);
  }

  destroy() {
    this.grids.forEach((grid) => grid.destroy());
  }

  _create(config) {
    this.grids = this._$grids.toArray().map((el, index) => new Grid($(el), index, config));
  }

  static init(config) {
    return new Controller(Object.assign({
      window,
      context: document.body,
      gridSelector: '.js-grid-main',
      maxRatio: 1.5,
    }, config));
  }
}
