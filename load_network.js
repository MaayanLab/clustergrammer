
// load network 
d3.json('example_network.json', function(network_data){

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
	  // 'tile_colors':['#ED9124','#1C86EE'],
	  // 'title_tile': true,
	  // 'click_tile': click_tile_callback,
	  // 'click_group': click_group_callback
	  // 'resize':false
	  // 'order':'rank'
	};

	// make clustergram: pass network_data and the div name where the svg should be made 
	d3_clustergram.make_clust( arguments_obj );

});


