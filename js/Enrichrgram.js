var genes_were_found = {};
enr_obj = {};

function check_setup_enrichr(inst_cgm){

  var has_enrichrgram = _.has(inst_cgm.params.network_data, 'enrichrgram');

  var make_enrichrgram = false;
  if (has_enrichrgram){
    make_enrichrgram = inst_cgm.params.network_data.enrichrgram;
  }

  // Toggle Enrichrgram function
  if (has_enrichrgram === false){

    // check with Hzome whether rows are genes
    ////////////////////////////////////////////
    genes_were_found[inst_cgm.params.root] = false;

    var all_rows = inst_cgm.params.network_data.row_nodes_names;
    var max_num_genes = 20;

    if (all_rows.length > 20){
      all_rows = all_rows.slice(0,20);
    }

    var wait_unit = 500;
    var wait_time = 0;

    _.each(all_rows, function(inst_name){
      setTimeout(check_gene_request, wait_time, inst_cgm, inst_name, run_ini_enrichr);
      wait_time = wait_time + wait_unit;
    });

  } else if (make_enrichrgram) {

    // make enrichrgram without checking with Hzome
    /////////////////////////////////////////////////
    run_ini_enrichr(inst_cgm);

    genes_were_found[inst_cgm.params.root] = true;

  }

}

function run_ini_enrichr(inst_cgm){

  var inst_root = inst_cgm.params.root;

  var has_enrichrgram = _.has(inst_cgm.params.network_data, 'enrichrgram');

  var make_enrichrgram = false;
  if (has_enrichrgram){
    make_enrichrgram = inst_cgm.params.network_data.enrichrgram;
  }

  if (genes_were_found[inst_root] || make_enrichrgram){

    if (d3.select(inst_root + ' .enrichr_logo').empty()){

      // set up Enrichr category import
      enr_obj[inst_root] = Enrichrgram(inst_cgm);
      enr_obj[inst_root].enrichr_icon();

      // set up Enrichr export in dendro modal
      //////////////////////////////////////////

      // only display for rows
      var enrichr_section = d3.selectAll(inst_root + ' .dendro_info')
        .select('.modal-body')
        .append('div')
        .classed('enrichr_export_section', true)
        .style('margin-top', '10px');
        // .style('display','none');

      enrichr_section
        .append('text')
        .text('Send genes to ');

      enrichr_section
        .append('a')
        .html('Enrichr')
        .on('click', function(){

          var group_string = d3.select(inst_root + ' .dendro_text input').attr('value');

          // replace all instances of commas with new line
          var gene_list = group_string.replace(/, /g, '\n');

          ///////////////
          // clean list
          ///////////////
          var enrichr_info = {list: gene_list, description: 'Clustergrammer gene-cluster list' , popup: true};

          // defined globally - will improve
          send_to_Enrichr(enrichr_info);

        });

    }

  }

}

function check_gene_request(inst_cgm, gene_symbol, run_ini_enrichr){

  if (gene_symbol.indexOf(' ') > 0){
    gene_symbol = gene_symbol.split(' ')[0];
  } else if (gene_symbol.indexOf('_') > 0){
    gene_symbol = gene_symbol.split('_')[0];
  }


  var base_url = 'https://amp.pharm.mssm.edu/Harmonizome/api/1.0/gene/';
  var url = base_url + gene_symbol;

  if (genes_were_found[inst_cgm.params.root] === false){

    // make sure value is non-numeric
    if (isNaN(gene_symbol)){

      $.get(url, function(data) {

        data = JSON.parse(data);

        if (data.name != undefined){
          genes_were_found[inst_cgm.params.root] = true;
        }

        run_ini_enrichr(inst_cgm, gene_symbol);

      });

    }
  }

}

function Enrichrgram(inst_cgm){

  var inst_root = inst_cgm.params.root;

  function enrichr_icon(){

    var low_opacity = 0.7;
    var high_opacity = 1.0;
    var icon_size = 42;
    var d3_tip_custom = inst_cgm.d3_tip_custom();

    // var enrichr_description = 'Perform enrichment analysis on your gene-list <br>'+
    //                           'using Enrichr to find biological information that is unique to your list.'
    var enrichr_description = 'Perform enrichment analysis, using Enrichr, to find biological <br>'+
                              'information specific to your set (or subset) of genes. <br><br>' +
                              'Select a subset of genes for analysis by cropping the matrix using: the brush-cropping tool in the sidebar, or the crop buttons on the dendrogram.'
    // d3-tooltip
    var enr_tip = d3_tip_custom()
      .attr('class', function(){
        var root_tip_selector = inst_cgm.params.viz.root_tips.replace('.','');
        var class_string = root_tip_selector + '_enr_tip d3-tip';
        return class_string;
      })
      .direction('se')
      .style('display', 'none')
      .offset([-10,-5])
      .html(function(d){
        return enrichr_description;
      });

    var enr_logo = d3.select(inst_root+' .viz_svg').append("svg:image")
     .attr('x', 50)
     .attr('y', 2)
     .attr('width', icon_size)
     .attr('height', icon_size)
     .attr("xlink:href", "https://amp.pharm.mssm.edu/Enrichr/images/enrichr-icon.png")
     .style('opacity', low_opacity)
     .classed('enrichr_logo', true)
     .attr('id', function(){
      var inst_id = 'enrichr_menu_button_' + inst_cgm.params.root.replace('#','');
      return inst_id;
     })
     .on('click', function(){
       toggle_enrichr_menu();
     })
     .on('mouseover', function(){

      var is_showing = d3.select(inst_cgm.params.root+' .enrichr_menu')
                         .classed('showing');

      if (is_showing === false){
        // show tooltip
        d3.selectAll( inst_cgm.params.viz.root_tips + '_enr_tip')
          .style('opacity', 1)
          .style('display', 'block');

         enr_tip.show();
      }

     })
     .on('mouseout', function(){

      // hide tooltip
      d3.selectAll( inst_cgm.params.viz.root_tips + '_enr_tip')
        .style('opacity', 0)
        .style('display', 'block');

       enr_tip.hide();
     })
     .call(enr_tip);

    var enr_menu = d3.select(inst_cgm.params.root+' .viz_svg')
      .append('g')
      .classed('showing', false)
      .classed('enrichr_menu', true)
      .attr('transform', 'translate(85,40)')
      .style('display', 'none');

    enr_menu
      .append('rect')
      .classed('enr_menu_background', true)
      .attr('width', 475)
      .attr('height', 500)
      .attr('opacity', 0.95)
      .attr('fill', 'white')
      .attr('stroke', '#A3A3A3')
      .attr('stroke-width', '3px');

    enr_menu
      .append('text')
      .attr('transform', 'translate(20,30)')
      .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
      .attr('font-size','18px')
      .attr('font-weight', 800)
      .attr('cursor', 'default')
      .text('Choose Enrichr Library');

    // clear results button
    enr_menu
      .append('text')
      .classed('enr_menu_clear', true)
      .attr('transform', 'translate(345, 30)')
      .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
      .style('font-size','18px')
      .style('font-weight', 800)
      .style('cursor', 'default')
      .text('Clear Results')
      .style('fill', 'red')
      .style('opacity', 0.75)
      .style('display', 'none')
      .on('click', function(){


        // reset enrichr menu
        toggle_enrichr_menu();

        // clear enrichr results and run resizing
        clear_enrichr_results(true);

      })

    var lib_section = enr_menu
      .append('g')
      .attr('transform', 'translate(20,60)')
      .style('width', 460)
      .style('height', 370)
      .classed('enr_lib_section','true');

    var possible_libraries = [
      'ChEA_2016',
      'KEA_2015',
      'ENCODE_TF_ChIP-seq_2015',
      'ENCODE_Histone_Modifications_2015',
      'Disease_Perturbations_from_GEO_up',
      'Disease_Perturbations_from_GEO_down',
      'GO_Molecular_Function_2015',
      'GO_Biological_Process_2015',
      'GO_Cellular_Component_2015',
      'Reactome_2016',
      'KEGG_2016',
      'MGI_Mammalian_Phenotype_Level_4',
      'LINCS_L1000_Chem_Pert_up',
      'LINCS_L1000_Chem_Pert_down',
      ];

    var vertical_space = 30;

    enr_menu
      .append('rect')
      .classed('enr_menu_line', true)
      .attr('height', '2px')
      .attr('width', '435px')
      .style('stroke-width', '3px')
      .style('opacity', 0.3)
      .style('fill','black')
      .attr('transform', 'translate(20, 465)');

    var enr_export_container = enr_menu
      .append('g')
      .classed('enr_export_container', true)
      .attr('transform', 'translate(20, 487)');

    enr_export_container
      .append('text')
      .style('font-size','16px')
      .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
      .style('cursor', 'default')
      .text('Export gene list to ');

    enr_export_container
      .append('text')
      .style('font-size','16px')
      .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
      .style('cursor', 'default')
      .text('Enrichr')
      .style('fill','#337ab7')
      .attr('transform', 'translate(135, 0)')
      .on('click', function(){

        // get gene list and send to Enrichr
        var gene_list = inst_cgm.params.network_data.row_nodes_names.join('\n');

        var enrichr_info = {list: gene_list, description: 'Clustergrammer gene list' , popup: true};

        // defined globally - will improve
        enrich(enrichr_info);

      })

    var lib_groups = lib_section
      .selectAll('g')
      .data(possible_libraries)
      .enter()
      .append('g')
      .attr('transform', function(d,i){
        var vert =  i*vertical_space
        var transform_string = 'translate(0,'+ vert+')';
        return transform_string;
      })

    lib_groups
      .append('circle')
      .attr('cx', 10)
      .attr('cy', -6)
      .attr('r', 7)
      .style('stroke', '#A3A3A3')
      .style('stroke-width', '2px')
      .style('fill','white')

    lib_groups
      .append('text')
      .attr('transform', 'translate(25,0)')
      .style('font-size','16px')
      .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
      .style('cursor', 'default')
      .text(function(d){
        return d.replace(/_/g, ' ');
      });

    lib_groups
      .on('click', function(d){

        d3.select(inst_cgm.params.root+' .enr_lib_section')
          .selectAll('g')
          .select('circle')
          .style('fill','white');

        // indicate that library was selected
        d3.select(this)
          .select('circle')
          .style('fill','red')

        // turn on clear sign
        d3.select(inst_cgm.params.root+' .enr_menu_clear')
          .transition()
          .delay(1000)
          .style('display', 'block');

        // request enrichment results from Enrichr
        enr_obj.enrichr_rows(d, update_viz_callback, 10);

        make_enr_wait_circle();
        animate_wait();

        setTimeout(toggle_enrichr_menu, 500);
      })

  }

  function clear_enrichr_results(run_resize_viz){

    d3.select(inst_cgm.params.root+ ' .enr_menu_clear')
      .style('display', 'none');

    // unselect library
    d3.select(inst_cgm.params.root+' .enr_lib_section')
      .selectAll('g')
      .select('circle')
      .style('fill','white');

    // clear categories
    inst_cgm.reset_cats(run_resize_viz);

    // remove title and bars
    d3.select(inst_cgm.params.root+' .enr_title').remove();
    d3.selectAll(inst_cgm.params.root+' .enrichr_bars').remove();

  }

  function toggle_enrichr_menu(){

    var enr_menu = d3.select(inst_cgm.params.root+' .enrichr_menu');

    if (enr_menu.classed('showing') === false){

      // show menu
      ///////////////////////
      enr_menu
        .classed('showing', true)
        .style('display', 'block');

      d3.select(inst_cgm.params.root+' .enrichr_menu')
        .style('opacity',0)
        .transition()
        .style('opacity',1)

      d3.selectAll('.row_cat_super').style('display','none');

      // hide tooltip
      d3.selectAll( inst_cgm.params.viz.root_tips + '_enr_tip')
        .style('opacity', 0)
        .style('display', 'none');

    } else {

      // hide menu
      ///////////////////////
      setTimeout(function(){enr_menu.style('display', 'none');}, 1000)

      d3.select(inst_cgm.params.root+' .enrichr_menu')
        .classed('showing', false)
        .style('opacity',1)
        .transition()
        .style('opacity',0)

      d3.selectAll('.row_cat_super').style('display','block');
    }

  }

  function get_enr_with_list(ini_gene_list, library, callback_function){

    // clean gene list
    var gene_list = []
    _.each(ini_gene_list, function(gene_symbol){
      if (gene_symbol.indexOf(' ') > 0){
        gene_symbol = gene_symbol.split(' ')[0];
      } else if (gene_symbol.indexOf('_') > 0){
        gene_symbol = gene_symbol.split('_')[0];
      }
      gene_list.push(gene_symbol)
    })

    enr_obj.library = library;
    enr_obj.gene_list = gene_list;

    enr_obj.post_list(gene_list, function(){

      if (typeof callback_function != 'undefined'){
        enr_obj.get_enr(library, callback_function);
      } else {
        enr_obj.get_enr(library);
      }

    });
  }

  function post_list(gene_list, callback_function){

    var gene_list_string = gene_list.join('\n');

    var form = new FormData();
    var response;

    form.append("list", gene_list_string);

    form.append("description", "clustergrammer");

    var settings = {
     "async": true,
     "crossDomain": true,
     "url": "https://amp.pharm.mssm.edu/Enrichr/addList",
     "method": "POST",
     "processData": false,
     "contentType": false,
     "mimeType": "multipart/form-data",
     "data": form
    }

    if (typeof callback_function === 'undefined'){
      callback_function = confirm_save;
    }

    $.ajax(settings)
     .done(function(response){
      response = JSON.parse(response);
      enr_obj.user_list_id = response.userListId;

      // make get request
      setTimeout(callback_function, 500, response);
      // callback_function(response);
     });
  }

  function confirm_save(response){
    console.log('saved user_list_id '+String(enr_obj.user_list_id));
  }

  function get_enr(library, callback_function){

    if (enr_obj.user_list_id !== null){
      var form = new FormData();

      var base_url = 'https://amp.pharm.mssm.edu/Enrichr/enrich?';
      var library_string = 'backgroundType=' + String(library);
      var list_id_string = 'userListId=' + String(enr_obj.user_list_id);

      var full_url = base_url + library_string + '&' + list_id_string;

      // get request
      var settings = {
       "async": true,
       "crossDomain": true,
       "url": full_url,
       "method": "GET",
       "processData": false,
       "contentType": false,
       "mimeType": "multipart/form-data",
       "data": form
      }

      $.ajax(settings)
        .done(function (response, textStatus, jqXHR) {

          response = JSON.parse(response);
          enr_obj.enr_data = response;

          // parse enr_data to cat_data format
          /////////////////////////////////////
          // enr_obj.cat_data = enr_obj.enr_data
          enr_obj.enr_data_to_cats();

          if (typeof callback_function != 'undefined'){
            callback_function(enr_obj);
          }
          d3.select(inst_cgm.params.root+' .enr_wait_circle').remove();

        })
        .fail(function( jqXHR, textStatus, errorThrown ){

          enr_obj.get_tries = enr_obj.get_tries + 1;

          if (enr_obj.get_tries < 2){
            // enr_obj.get_enr(library, callback_function);
            setTimeout( enr_obj.get_enr, 500, library_string, callback_function )
          } else {
            console.log('did not get response from Enrichr - need to remove wait circle')
            d3.select(inst_cgm.params.root+' .enr_wait_circle').remove();
          }

        });

    } else {
      console.log('no user_list_id defined')
    }
  }

  function enrichr_rows(library, callback_function, num_terms){

    // set up a variable number of terms

    enr_obj.library = library;
    var gene_list = inst_cgm.params.network_data.row_nodes_names;
    enr_obj.get_enr_with_list(gene_list, library, callback_function)

  }

  function enr_data_to_cats(){

    var library_name = _.keys(this.enr_data)[0];

    var enr_terms = this.enr_data[library_name];

    // keep the top 10 enriched terms
    enr_terms = enr_terms.slice(0,10);

    cat_data = []

    _.each(enr_terms, function(inst_term){

      inst_data = {};
      inst_data['cat_title'] = inst_term[1];
      inst_data['cats'] = [];
      inst_data['pval'] = inst_term[2];

      // keep the combined score
      inst_data['combined_score'] = inst_term[4]

      cat_details = {};
      cat_details.cat_name = 'true';
      cat_details.members = inst_term[5]

      // there are only two categories for Enrichr: true/false
      inst_data['cats'].push(cat_details)

      cat_data.push(inst_data);
    });

    this.cat_data = cat_data;

  }

  function animate_wait() {

    var repeat_time = 700;
    var max_opacity = 0.8;
    var min_opacity = 0.2

    d3.select(inst_cgm.params.root+' .enr_wait_circle')
      .transition()
      .ease('linear')
      .style('opacity', min_opacity)
      .transition()
      .ease('linear')
      .duration(repeat_time)
      .style('opacity', max_opacity)
      .transition()
      .ease('linear')
      .duration(repeat_time)
      .style('opacity', min_opacity)
      .each("end", animate_wait);
  }

  function update_viz_callback(enr_obj){

    inst_cgm.update_cats(enr_obj.cat_data);

    // Enrichrgram title
    ////////////////////
    d3.select(inst_cgm.params.root+' .enr_title').remove();

    var enr_title = d3.select(inst_cgm.params.root+' .viz_svg')
      .append('g')
      .classed('enr_title', true)
      .attr('transform', function(){

        var trans = d3.select(inst_cgm.params.root+' .row_cat_label_container')
                      .attr('transform').split('(')[1].split(')')[0];
        x_offset = Number(trans.split(',')[0]) - 10;

        return 'translate('+ String(x_offset)+', 0)';

      });

    enr_title
      .append('rect')
      .attr('width', inst_cgm.params.viz.cat_room.row)
      .attr('height', 25)
      .attr('fill', 'white');

    var library_string = enr_obj.library.substring(0,40);
    enr_title
      .append('text')
      .attr('transform', 'translate(0, 17)')
      .text(library_string.replace(/_/g, ' '))
      .style('font-size', '15px')
      .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif');

    var extra_y_room = 1.25;
    var unit_length = extra_y_room * inst_cgm.params.viz.cat_room.symbol_width;
    var bar_width = unit_length * 0.9;

    // Enrichr bars
    ///////////////////////////////
    d3.selectAll(inst_cgm.params.root+' .enrichr_bars').remove();

    var bar_height = inst_cgm.params.viz.clust.margin.top - 35;
    var max_score = enr_obj.cat_data[0].combined_score;
    var bar_scale = d3.scale.linear()
                      .domain([0, max_score])
                      .range([0, bar_height]);

    d3.select(inst_cgm.params.root+' .row_cat_label_bar_container')
      .selectAll()
      .data(inst_cgm.params.viz.all_cats.row)
      .enter()
      .append('rect')
      .classed('enrichr_bars', true)
      .attr('height', bar_width +'px')
      .attr('fill', 'red')
      .attr('width', function(d){
        var enr_index = d.split('-')[1];
        var inst_comb_score = enr_obj.cat_data[enr_index].combined_score;
        var bar_lenth = bar_scale(inst_comb_score);
        var bar_length_string = bar_lenth + 'px'
        return bar_length_string;
      })
      .attr('opacity', 0.4)
      .attr('transform', function(d){
        var inst_y = unit_length * (parseInt( d.split('-')[1], 10 ) -0.75 );
        return 'translate(0,'+inst_y+')';
      });

  }

  function make_enr_wait_circle(){
    var pos_x = 72;
    var pos_y = 25;

     var click_circle = d3.select(inst_cgm.params.root+' .viz_svg')
        .append('circle')
        .classed('enr_wait_circle', true)
        .attr('cx',pos_x)
        .attr('cy',pos_y)
        .attr('r',23)
        .style('stroke','#666666')
        .style('stroke-width','3px')
        .style('fill','white')
        .style('fill-opacity',0)
        .style('opacity', 0);
  }

  // example of how to check gene list
  // http://amp.pharm.mssm.edu/Enrichr/view?userListId=1284420

  var enr_obj = {};
  enr_obj.user_list_id = null;
  enr_obj.enr_data = null;
  enr_obj.cat_data = null;
  enr_obj.get_tries = 0;
  enr_obj.library = null;
  enr_obj.gene_list = null;

  enr_obj.enrichr_icon = enrichr_icon;
  enr_obj.post_list = post_list;
  enr_obj.get_enr = get_enr;
  enr_obj.get_enr_with_list = get_enr_with_list;
  enr_obj.enrichr_rows = enrichr_rows;
  enr_obj.enr_data_to_cats = enr_data_to_cats;
  enr_obj.update_viz_callback = update_viz_callback;
  enr_obj.clear_enrichr_results = clear_enrichr_results;

  return enr_obj;

}