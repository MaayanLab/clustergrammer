/* DownSampling module
*/

function DownSampling(params, min_rect_height){
  function calc_ds_matrix(params, min_rect_height){
    var ini_num_rows = params.network_data.row_nodes.length;

    // calc the increase in rect size required 
    // first get the current size of the rectangle 
    var ini_rect_height = params.matrix.rect_height;
    var reduce_num_rows_by = min_rect_height/ini_rect_height;

    var col_nodes = params.network_data.col_nodes;

    var new_num_rows = Math.floor(ini_num_rows/reduce_num_rows_by);

    // get cluster height
    var clust_height = params.viz.clust.dim.height;
    // initialize scale
    var y_scale = d3.scale.ordinal().rangeBands([0,clust_height]);
    // define domain 
    y_scale.domain(_.range(new_num_rows));

    // get new rangeBand to calculate new y position 
    var tile_height = y_scale.rangeBand();

    var ini_tile_height = params.matrix.y_scale.rangeBand();

    var increase_ds = 1;

    var ds_factor = 2*ini_tile_height/tile_height * increase_ds;

    // use crossfilter to calculate new links 
    //////////////////////////////////////////

    // load data into crossfilter  
    var cfl = crossfilter(params.network_data.links);

    // downsample dimension - define the key that will be used to do the reduction
    var dim_ds = cfl.dimension(function(d){
      // merge together rows into a smaller number of rows 
      var row_num = Math.floor(d.y/tile_height);
      var col_name = col_nodes[d.target].name;
      var inst_key = 'row_'+row_num + '_' + col_name;
      return inst_key;
    })

    // define reduce functions 
    function reduceAddAvg(p,v) {
      ++p.count
      if (v.value > 0){
        p.sum_up += v.value;
      } else {
        p.sum_dn += v.value;
      }
      p.value_up = p.sum_up/p.count;
      p.value_dn = p.sum_dn/p.count;

      // make new row name 
      p.name = 'row_'+ String(Math.floor(v.y/tile_height)) + '_' + col_nodes[v.target].name;

      p.source = Math.floor(v.y/tile_height);
      p.target = v.target;
      return p;
    }
    function reduceRemoveAvg(p,v) {
      --p.count
      if (v.value > 0){
        p.sum_up -= v.value;
      } else {
        p.sum_dn -= v.value;
      }
      p.value_up = p.sum_up/p.count;
      p.value_dn = p.sum_dn/p.count;

      p.name = 'no name';
      p.target = 0;
      p.source = 0;
      return p;
    }
    function reduceInitAvg() {
      return {count:0, sum_up:0, sum_dn:0, avg:0, name:'',source:0,target:0};
    }

    // gather tmp version of new links 
    var tmp_red = dim_ds
                  .group()
                  .reduce(reduceAddAvg, reduceRemoveAvg, reduceInitAvg)
                  .top(Infinity);

    // initialize array of new_links
    var new_links = [];

    // gather data from reduced sum 
    new_links = _.pluck(tmp_red, 'value');

    // define compound color scale 
    var color_scale = d3.scale.linear().domain([-1,1])
      .range([params.matrix.tile_colors[1], params.matrix.tile_colors[0]]);


    // redefine matrix 
    /////////////////////////
    var matrix = []; 

      _.each(_.range(new_num_rows), function(tmp, row_index) {
        matrix[row_index] = {};
        matrix[row_index].name = row_index;
        matrix[row_index].row_data = d3.range(col_nodes.length).map(
          function(col_index) {
            return {
              pos_x: col_index,
              pos_y: row_index,
              value: 0,
              value_up: 0,
              value_dn: 0,
              highlight:0
            } ;
          });
      });

      _.each(new_links, function(link) {
        // transfer additional link information is necessary
        matrix[link.source].row_data[link.target].value = link.value;
        matrix[link.source].row_data[link.target].row_name = link.row_name;
        matrix[link.source].row_data[link.target].col_name = link.col_name;
        // if (link.value_up && link.value_dn) {
          matrix[link.source].row_data[link.target].value_up = link.value_up;
          matrix[link.source].row_data[link.target].value_dn = link.value_dn;
        // }
        
      });

      return {
        'matrix':matrix, 
        'y_scale':y_scale, 
        'tile_height':tile_height,
        'color_scale':color_scale,
        'ds_factor':ds_factor
      };
  }

  function draw_ds_matrix(params, ds_data){
    var ds_matrix = ds_data.matrix;
    var y_scale = ds_data.y_scale;
    var tile_height = ds_data.tile_height;
    var color_scale = ds_data.color_scale;
    var ds_factor = ds_data.ds_factor;

    d3.selectAll('.horz_lines').remove();

    // update bound data on rows 
    var ds_clust = d3.select(params.root+' .clust_group')
      .selectAll('.row')
      .data(ds_matrix, function(d){return d.name;});

    // remove old rows - all old rows will be removed in downsampling 
    ds_clust
      .exit()
      .remove();

    // enter new rows 
    ds_clust
      .enter()
      .append('g')
      .attr('class','row')
      .attr('transform', function(d, i){
        return 'translate(0,'+y_scale(i)+')';
      })
      .each(enter_ds_row);

    function enter_ds_row(ini_inp_row_data){
      var inp_row_data = ini_inp_row_data.row_data;

      // remove zero values to make visualization fater 
      var row_data = _.filter(inp_row_data, function(num){
        return num.value_up !==0 || num.value_dn !==0 ;
      });

      row_data = inp_row_data;

      // generate tiles in the current row 
      var tile = d3.select(this)
        .selectAll('rect')
        .data(row_data)
        .enter()
        .append('rect')
        .attr('class', 'tile row_tile')
        .attr('width', params.matrix.rect_width)
        .attr('height', tile_height)
        .style('fill', function(d){
          var abs_val_up = Math.abs(d.value_up);
          var abs_val_dn = Math.abs(d.value_dn);
          var inst_value = (abs_val_up - abs_val_dn) / (abs_val_up + abs_val_dn);
          return color_scale(inst_value);
        });

        // do not include mouseover events on ds_tiles 

        tile
          .style('fill-opacity', function(d){
            var val_updn = Math.abs(d.value_up)+Math.abs(d.value_dn);
            var output_opacity = params.matrix.opacity_scale(val_updn*ds_factor);
            return output_opacity
          });

        tile
          .attr('transform', function(d,i){
            var x_pos = params.matrix.x_scale(i) + 0.5*params.viz.border_width;
            var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
            return 'translate('+x_pos+','+y_pos+')';
          });
    }
  }

  return {
    calc_ds_matrix: calc_ds_matrix,
    draw_ds_matrix: draw_ds_matrix 
  };

}