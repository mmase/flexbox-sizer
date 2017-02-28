window.inst = window.flexboxSizer.init({
  breakpoints: [
    {
      width: 400,
      modifier: 0.2,
    },
    {
      width: 600,
      modifier: 0.4,
    },
    {
      width: 800,
      modifier: 0.6,
    },
    {
      width: 1000,
      modifier: 0.8,
    },
    {
      width: 1200,
      modifier: 1,
    },
  ],
});

window.grids = window.inst.grids;
