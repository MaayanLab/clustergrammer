module.exports = function click_tile(inst_arguments) {
  dispatchEvent(
    new CustomEvent('TILE_MOUSEOVER', {
      detail: {
        tile: inst_arguments[0]
      }
    })
  );
};
