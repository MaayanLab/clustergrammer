function Enrichr_request(inst_cgm){

  function enrichr_icon(){

    var low_opacity = 0.7;
    var high_opacity = 1.0;
    var icon_size = 42;

    d3.select('.viz_svg').append("svg:image")
     .attr('x', 50)
     .attr('y', 2)
     .attr('width', icon_size)
     .attr('height', icon_size)
     .attr("xlink:href", "http://amp.pharm.mssm.edu/Enrichr/images/enrichr-icon.png")
     .style('opacity', low_opacity)
     .classed('enrichr_logo', true)
     .on('click', function(){
       toggle_enrichr_menu();
     })
     .on('mouseover', function(){
       d3.select(this).style('opacity', high_opacity);
     })
     .on('mouseout', function(){
       d3.select(this).style('opacity', low_opacity);
     });

    var enr_menu = d3.select(inst_cgm.params.root+' .viz_svg')
      .append('g')
      .classed('showing', false)
      .classed('enrichr_menu', true)
      .attr('transform', 'translate(85,40)')
      .style('display', 'none');

    enr_menu
      .append('rect')
      .classed('enr_menu_background', true)
      .style('width', 500)
      .style('height', 425)
      .style('opacity', 0.95)
      .style('fill', 'white')
      .style('stroke', '#A3A3A3')
      .style('stroke-width', '3px');

    enr_menu
      .append('text')
      .attr('transform', 'translate(20,30)')
      .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
      .style('font-size','18px')
      .style('font-weight', 800)
      .style('cursor', 'default')
      .text('Choose Enrichr Library');

    // clear results button
    enr_menu
      .append('text')
      .classed('enr_menu_clear', true)
      .attr('transform', 'translate(350, 30)')
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

        d3.select(this)
          .style('display', 'none');

        d3.select(inst_cgm.params.root+' .enr_lib_section')
          .selectAll('g')
          .select('circle')
          .style('fill','white');

        // clear categories
        inst_cgm.reset_cats();

      })

    var lib_section = enr_menu
      .append('g')
      .attr('transform', 'translate(20,60)')
      .style('width', 460)
      .style('height', 330)
      .classed('enr_lib_section','true');

    var possible_libraries = ['ChEA_2015','KEA_2015',
      'ENCODE_TF_ChIP-seq_2015',
      'ENCODE_Histone_Modifications_2015',
      'Disease_Perturbations_from_GEO_up',
      'Disease_Perturbations_from_GEO_down',
      'GO_Molecular_Function_2015',
      'GO_Biological_Process_2015',
      'GO_Cellular_Component_2015',
      'Reactome_2015',
      'MGI_Mammalian_Phenotype_Level_4'
      ];
    var vertical_space = 35;

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
      .style('font-size','18px')
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

  function toggle_enrichr_menu(){

    var enr_menu = d3.select(inst_cgm.params.root+' .enrichr_menu');

    if (enr_menu.classed('showing') === false){
      enr_menu
        .classed('showing', true)
        .style('display', 'block');

      d3.select(inst_cgm.params.root+' .enrichr_menu')
        .style('opacity',0)
        .transition()
        .style('opacity',1)

    d3.selectAll('.row_cat_super').style('display','none');

    } else {

      setTimeout(function(){enr_menu.style('display', 'none');}, 1000)

      d3.select(inst_cgm.params.root+' .enrichr_menu')
        .classed('showing', false)
        .style('opacity',1)
        .transition()
        .style('opacity',0)

      d3.selectAll('.row_cat_super').style('display','block');
    }

  }

  function get_enr_with_list(gene_list, library, callback_function){

    enr_obj.library = library;

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
     "url": "http://amp.pharm.mssm.edu/Enrichr/addList",
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

      var base_url = 'http://amp.pharm.mssm.edu/Enrichr/enrich?';
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

    d3.select(inst_cgm.params.root+' .enr_title').remove();

    var enr_title = d3.select(inst_cgm.params.root+' .viz_svg')
      .append('g')
      .classed('enr_title', true)
      .attr('transform', function(){

        var trans = d3.select('.row_cat_label_container')
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

  }

  function make_enr_wait_circle(){
    var pos_x = 71;
    var pos_y = 25;

     var click_circle = d3.select(inst_cgm.params.root+' .viz_svg')
        .append('circle')
        .classed('enr_wait_circle', true)
        .attr('cx',pos_x)
        .attr('cy',pos_y)
        .attr('r',22)
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

  enr_obj.enrichr_icon = enrichr_icon;
  enr_obj.post_list = post_list;
  enr_obj.get_enr = get_enr;
  enr_obj.get_enr_with_list = get_enr_with_list;
  enr_obj.enrichr_rows = enrichr_rows;
  enr_obj.enr_data_to_cats = enr_data_to_cats;

  return enr_obj;

}