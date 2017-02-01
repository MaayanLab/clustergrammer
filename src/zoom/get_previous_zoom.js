module.exports = function get_previous_zoom(params){
  var prev_zoom = {};

  var inst_trans = d3.select(params.root+' .clust_group')
    .attr('transform');

  if (inst_trans != null){

    // prevent from crashing if no scaling was done
    if (inst_trans.indexOf('scale') > 0){
      prev_zoom.zoom_x = parseFloat(inst_trans.split('scale')[1].replace('(','')
                                    .replace(')','').split(',')[0]);

      prev_zoom.zoom_y = parseFloat(inst_trans.split('scale')[1].replace('(','')
                                    .replace(')','').split(',')[1]);
    } else {
      prev_zoom.zoom_x = 1;
      prev_zoom.zoom_y = 1;
    }

  } else {
    prev_zoom.zoom_x = 1;
    prev_zoom.zoom_y = 1;
  }

  return prev_zoom;

};