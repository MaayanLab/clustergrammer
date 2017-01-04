
/*
Example files
*/

var hzome = ini_hzome();

make_clust('mult_view.json');

var about_string = 'Zoom, scroll, and click buttons to interact with the clustergram. <a href="http://amp.pharm.mssm.edu/clustergrammer/help"> <i class="fa fa-question-circle" aria-hidden="true"></i> </a>';

function make_clust(inst_network){

    d3.json('json/'+inst_network, function(network_data){

      // define arguments object
      var args = {
        root: '#container-id-1',
        'network_data': network_data,
        'about':about_string,
        'row_tip_callback':hzome.gene_info,
        'col_tip_callback':test_col_callback,
        'tile_tip_callback':test_tile_callback,
        'dendro_callback':dendro_callback,
        'undo_crop_callback':undo_crop_callback,
        'sidebar_width':150
      };

      resize_container(args);

      d3.select(window).on('resize',function(){
        resize_container(args);
        cgm.resize_viz();
      });

      cgm = Clustergrammer(args);

      d3.select(cgm.params.root + ' .wait_message').remove();

      check_setup_enrichr(cgm);

      // // Enrichr categories
      // //////////////////////
      // enr_obj = Enrichr_request(cgm);
      // enr_obj.enrichr_icon();

  });

}

function undo_crop_callback(inst_names){
  console.log('undoing the crop and clearing enrichr results');

  if (enr_obj.gene_list !=null){

    var num_sent_to_enr = enr_obj.gene_list.length;
    var num_in_curr_view = inst_names.row.length;
    console.log('num genes sent to Enrichr: ' + String(num_sent_to_enr))
    console.log('num genes in current view: ' + String(num_in_curr_view))

    if (num_in_curr_view > num_sent_to_enr){
      enr_obj.clear_enrichr_results();
    }

  }
}

function test_tile_callback(tile_data){
  var row_name = tile_data.row_name;
  var col_name = tile_data.col_name;

}

function test_col_callback(col_data){
  var col_name = col_data.name;
}

function dendro_callback(inst_selection){

  var inst_rc;
  var inst_data = inst_selection.__data__;

  // toggle enrichr export section
  if (inst_data.inst_rc === 'row'){
    d3.select('.enrichr_export_section')
      .style('display', 'block');
  } else {
    d3.select('.enrichr_export_section')
      .style('display', 'none');
  }

}

function resize_container(args){

  var screen_width = window.innerWidth;
  var screen_height = window.innerHeight - 20;

  d3.select(args.root)
    .style('width', screen_width+'px')
    .style('height', screen_height+'px');
}
