module.exports = function click_tile(inst_arguments) {
  dispatchEvent(
    new CustomEvent('TILE_CLICK', {
      detail: {
        tile: inst_arguments[0]
      }
    })
  );
};
