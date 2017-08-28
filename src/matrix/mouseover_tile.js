var underscore = require('underscore');

module.exports = function mouseover_tile(params, inst_selection, tip, inst_arguments){

  var inst_data = inst_arguments[0];
  var args = [].slice.call(inst_arguments);
  var timeout;
  var delay = 1000;

  d3.select(inst_selection)
    .classed('hovering', true);

  underscore.each(['row','col'], function(inst_rc){

    d3.selectAll(params.root+' .'+inst_rc+'_label_group text')
      .style('font-weight', function(d) {
        var font_weight;
        var inst_found = inst_data[inst_rc+'_name'].replace(/_/g, ' ') === d.name;

        if (inst_found){
          font_weight = 'bold';
        } else {
          font_weight = 'normal';
        }
        return font_weight;
      });

  });

  args.push(inst_selection);
  clearTimeout(timeout);
  timeout = setTimeout(check_if_hovering, delay, inst_selection);


  function check_if_hovering() {


    if ( d3.select(inst_selection).classed('hovering') ){

      var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));

      if (inst_zoom === 0){

        if (params.matrix.show_tile_tooltips && tip !== null){

          d3.selectAll(params.viz.root_tips + '_tile_tip')
            .style('display','block');

          tip.show.apply(inst_selection, args);

          if (params.tile_tip_callback != null){
            var tile_info = args[0];
            params.tile_tip_callback(tile_info);
          }

        }

      }
    }
  }

};