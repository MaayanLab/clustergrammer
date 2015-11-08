// load clustergram function
function make_clust(inst_network){  

  $(function() {

      // load network
      d3.json('json/'+inst_network, function(network_data){

        global_network_data = network_data;

        // define the outer margins of the visualization
        var outer_margins = {
            'top':5,
            'bottom':33,
            'left':195,
            'right':2
          };

        var outer_margins_expand = {
            'top':5,
            'bottom':33,
            'left':5,
            'right':2
          };

        // define callback function for clicking on tile
        function click_tile_callback(tile_info){
          console.log('tile callback');
          console.log('clicking on ' + tile_info.row + ' row and ' + tile_info.col + ' col with value ' + String(tile_info.value))
        }

        // define callback function for clicking on group
        function click_group_callback(group_info){
          console.log('running user defined click group callback');
          console.log(group_info.type);
          console.log(group_info.nodes);
          console.log(group_info.info);
        }

        // row/col callback function
        function click_label(label_info, label_type){
          console.log( label_type+' label callback function '+ label_info)
        }

        // define arguments object
        var arguments_obj = {
          'network_data': network_data,
          'svg_div_id': 'svg_div',
          'row_label':'Row-Data-Name',
          'col_label':'Column-Data-Name',
          'outer_margins': outer_margins,
          'outer_margins_expand': outer_margins_expand,
          // 'outline_colors':['black','yellow'],
          // 'tile_click_hlight':true,
          // 'show_tooltips':true,
          // 'click_tile': click_tile_callback,
          // 'click_label':click_label,
          // 'highlight_color':'yellow',
          'super_label_scale':1.25,
          // 'transpose':true,
          // 'ini_expand':true
          // 'col_label_scale':0.8,
          // 'row_label_scale':0.8
          // 'force_square':1
          // 'opacity_scale':'log',
          // 'input_domain':2,
          // 'do_zoom':false,
          // 'tile_colors':['#ED9124','#1C86EE'],
          // 'background_color':'orange',
          // 'tile_title': true,
          // 'click_group': click_group_callback
          // 'resize':false
          // 'order':'rank'
        };

        d3.select('#wait_message').style('display','none');

        // make clustergram: pass network_data and the div name where the svg should be made
        // tmp make d3c a global variable so that it can be updated with new data 
        var d3c = d3_clustergram(arguments_obj);

        global_params = d3c.params;

        ini_sliders();

        // filter scale - only initialize once 
        $( "#slider_filter" ).slider({
          value:1,
          min: 1,
          max: 9,
          step: 1,
          stop: function( event, ui ) {
            $( "#amount" ).val( "$" + ui.value );
            var inst_filt = $( "#slider_filter" ).slider( "value" ); 

            d3.select('#filter_value').text('filter row/column: value : '+inst_filt);
            var inst_name = 'default_example_f'+inst_filt+'.json';

            update_clust(inst_name);
          }
        });
        $( "#amount" ).val( "$" + $( "#slider_filter" ).slider( "value" ) );

        // reused functions 
        function ini_sliders(){
          // col groups
          $( "#slider_col" ).slider({
            value:0.5,
            min: 0,
            max: 1,
            step: 0.1,
            slide: function( event, ui ) {
              $( "#amount" ).val( "$" + ui.value );
              var inst_index = ui.value*10;
              d3c.change_groups('col',inst_index)
            }
          });
          $( "#amount" ).val( "$" + $( "#slider_col" ).slider( "value" ) );

          // row groups
          $( "#slider_row" ).slider({
            value:0.5,
            min: 0,
            max: 1,
            step: 0.1,
            slide: function( event, ui ) {
              $( "#amount" ).val( "$" + ui.value );
              var inst_index = ui.value*10;
              d3c.change_groups('row',inst_index)
            }
          });
          $( "#amount" ).val( "$" + $( "#slider_row" ).slider( "value" ) );

          // opacity scale
          $( "#slider_opacity" ).slider({
            value:0.2,
            min: 0.0,
            max: 1.0,
            step: 0.1,
            slide: function( event, ui ) {
              $( "#amount" ).val( "$" + ui.value );
              var inst_index = ui.value;
              d3c.opacity_slider(inst_index)
            }
          });
          $( "#amount" ).val( "$" + $( "#slider_opacity" ).slider( "value" ) );

          $('#gene_search_box').autocomplete({
            source: d3c.get_genes()
          });

          // submit genes button
          $('#gene_search_box').keyup(function(e) {
            if (e.keyCode === 13) {
              var search_gene = $('#gene_search_box').val();
              d3c.find_gene(search_gene);
            }
          });

          $('#submit_gene_button').off().click(function() {
            var gene = $('#gene_search_box').val();
            d3c.find_gene(gene);
          });

          $('#toggle_order .btn').off().click(function(evt) {
            var order_id = $(evt.target).find('input').attr('id').replace('_button', '');
            d3c.reorder(order_id);
          });
        }

        function update_clust(network_name) {

          function enable_slider(){
            $('#slider_filter').slider('enable');  
          }

          // disable the slider to prevent the user from making changes too
          // quickly
          $('#slider_filter').slider('disable');

          // reenable after update is finished 
          setTimeout(enable_slider, 3000);

          d3.json('json/'+network_name, function(network_data){

            // define the outer margins of the visualization
            var outer_margins = {
                'top':5,
                'bottom':33,
                'left':195,
                'right':2
              };

            var outer_margins_expand = {
                'top':5,
                'bottom':33,
                'left':5,
                'right':2
              };

            var inst_order = d3.select('#toggle_order')
              .select('.active')
              .select('input')
              .attr('id').split('_')[0];

            // define arguments object
            var arguments_obj = {
              'network_data': network_data,
              'svg_div_id': 'svg_div',
              'row_label':'Row-Data-Name',
              'col_label':'Column-Data-Name',
              'outer_margins': outer_margins,
              'outer_margins_expand': outer_margins_expand,
              // 'outline_colors':['black','yellow'],
              // 'show_tooltips':true,
              // 'highlight_color':'red',
              'super_label_scale':1.25,
              'order':inst_order
            };


            d3c.update_network(arguments_obj);

            ini_sliders();

          })
        }

    }); // end d3.json 

  }); // end closure 

} // end make_clust


// choose example here
make_clust('default_example_f1.json');
// make_clust('bar_example.json');
// make_clust('kin_sub_example.json');
// make_clust('harmonogram_example.json');

function downsample(params){
  console.log('downsampling')

  var ini_num_rows = params.network_data.row_nodes.length;

  var reduce_by = 2;

  var col_nodes = params.network_data.col_nodes;

  new_num_rows = ini_num_rows/reduce_by;

  // get cluster height
  var clust_height = params.viz.clust.dim.height;
  // initialize scale
  var y_scale = d3.scale.ordinal().rangeBands([0,clust_height]);
  // define domain 
  y_scale.domain(_.range(new_num_rows));

  // get new rangeBand to calculate new y position 
  var tile_height = y_scale.rangeBand();

  var ini_tile_height = params.matrix.y_scale.rangeBand();

  var increase_ds = 1.5;

  var ds_factor = ini_tile_height/tile_height * increase_ds;

  // get data from global_network_data
  var links = params.network_data.links;

  // use crossfilter to calculate new links 

  // load data into crossfilter  
  var cfl = crossfilter(links);

  // downsample dimension - define the key that will be used to do the reduction
  var dim_ds = cfl.dimension(function(d){
    // merge together rows into a smaller number of rows 
    var row_num = Math.floor(d.y/tile_height);
    var col_name = d.name.split('_');
    var inst_key = 'row_'+row_num + '_' + col_name;
    return inst_key;
  })

  // initialize array of new_links
  var new_links = [];

  // define reduce functions 
  function reduceAddAvg(p,v) {
    ++p.count
    p.sum += v.value;
    p.value = p.sum/p.count;

    // make 
    p.name = 'row_'+ String(Math.floor(v.y)) + '_' + col_nodes[v.target].name;

    p.source = Math.floor(v.y/tile_height);
    p.target = v.target;
    return p;
  }
  function reduceRemoveAvg(p,v) {
    --p.count
    p.sum -= v.value;
    p.value = p.sum/p.count;
    p.name = 'no name';
    p.target = 0;
    p.source = 0;
    return p;
  }
  function reduceInitAvg() {
    return {count:0, sum:0, avg:0, name:'',source:0,target:0};
  }

  // gather tmp version of new links 
  var tmp_red = dim_ds
                .group()
                .reduce(reduceAddAvg, reduceRemoveAvg, reduceInitAvg)
                .top(Infinity);

  // gather data from reduced sum 
  new_links = _.pluck(tmp_red, 'value');



  // add new tiles 
  /////////////////////////

  // exit old elements 
  d3.selectAll('.tile')
    .data(new_links, function(d){return d.name;})
    .exit()
    .remove();

  d3.selectAll('.horz_lines').remove();

  // enter new elements 
  //////////////////////////
  d3.select('#clust_group')
    .selectAll('.tile')
    .data(new_links, function(d){return d.name;})
    .enter()
    .append('rect')
    .style('fill-opacity',0)
    .attr('class','tile ds_tile')
    .attr('width', params.matrix.rect_width)
    .attr('height', tile_height)
    .attr('transform', function(d) {
      return 'translate(' + params.matrix.x_scale(d.target) + ','+y_scale(d.source)+')';
    })
    .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
    })
    .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.sum*ds_factor));
        return output_opacity;
    });

}