/* Represents sidebar with controls.
 */
function Sidebar(viz, params) {

  var row_order_controls = '' +
    '<div class="viz_medium_text">Row Order</div>' +
    ' <div id="toggle_col_order" class="btn-group" data-toggle="buttons">' +
    '   <label class="btn btn-primary active order_name" id="clust_row">' +
    '     <input type="radio" name="options" autocomplete="off" checked > Cluster' +
    '   </label>' +
    '   <label class="btn btn-primary order_name"  id="rank_row">' +
    '     <input type="radio" name="options" autocomplete="off"> Rank' +
    '   </label>' +
    '</div>';

  var parts = params.sidebar.sidebar_wrapper.split(' ');
  var sidebar_class = parts[parts.length-1].replace('.', '');

  var sidebar = d3
    .select(params.root)
    .append('div')
    .attr('id', sidebar_class)
    .style('float', 'left');

  sidebar.html(row_order_controls);


  // 1. Recreate sidebar in JavaScript from HTML.
  // 2. Rename all IDs to classes.
  //    Don't forget load_clustergram.js
  // 3. Move behavior in load_clustergram.js to sidebar.js
  //    Example of advanced behavior:
  //
  //    if (params.use_controls) {
  //       sidebar.select(params.root).append('div').....

}
