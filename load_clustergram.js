
// load network 
    d3.json('kin_harmonogram.json', function(network_data){

      // define the outer margins of the visualization 
      var outer_margins = {
          'top':5,
          'bottom':33,
          'left':225,
          'right':2
        };

      // define callback function for clicking on tile 
      function click_tile_callback(tile_info){
        console.log('my callback')
        console.log('clicking on ' + tile_info.row + ' row and ' + tile_info.col + ' col with value ' + String(tile_info.value))
      };

      // define callback function for clicking on group 
      function click_group_callback(group_info){
        console.log('running user defined click group callback')
        console.log(group_info.type);
        console.log(group_info.nodes);
        console.log(group_info.info);
      };

      // define arguments object 
      var arguments_obj = {
        'network_data': network_data,
        'svg_div_id': 'svg_div',
        'row_label':'Row-Data-Name',
        'col_label':'Column-Data-Name',
        'outer_margins': outer_margins,
        // 'opacity_scale':'log',
        'input_domain':7,
        'col_overflow':0.3
        // 'transpose':true,
        // 'zoom':false,
        // 'tile_colors':['#ED9124','#1C86EE'],
        // 'background_color':'orange',
        // 'title_tile': true,
        // 'click_tile': click_tile_callback,
        // 'click_group': click_group_callback
        // 'resize':false
        // 'order':'rank'
      };

      // make clustergram: pass network_data and the div name where the svg should be made 
      d3_clustergram.make_clust( arguments_obj );
    });

    // slider script - col 
    $(function() {
      $( "#slider_col" ).slider({
        value:0.5,
        min: 0,
        max: 1,
        step: 0.1,
        slide: function( event, ui ) {
          $( "#amount" ).val( "$" + ui.value );
          var inst_index = ui.value*10;

          // save slider value to global variable 
          d3_clustergram.params.group_level.col = ui.value*10 ;

          // change group size of col 
          d3.selectAll('.col_class_rect')
            .style('fill', function(d){
              return d3_clustergram.params.group_colors.col[d.group[inst_index]];
            });
        }
      });
      $( "#amount" ).val( "$" + $( "#slider_col" ).slider( "value" ) );
    });

    // slider script - row
    $(function() {
      $( "#slider_row" ).slider({
        value:0.5,
        min: 0,
        max: 1,
        step: 0.1,
        slide: function( event, ui ) {
          $( "#amount" ).val( "$" + ui.value );
          var inst_index = ui.value*10;

          // save slider value to global variable 
          d3_clustergram.params.group_level.row = ui.value*10 ;

          // change group size of row
          d3.selectAll('.row_class_rect')
            .style('fill', function(d){
              return d3_clustergram.params.group_colors.row[d.group[inst_index]];
            });
        }
      });
      $( "#amount" ).val( "$" + $( "#slider_row" ).slider( "value" ) );
    });
