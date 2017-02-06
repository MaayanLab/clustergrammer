function ini_hzome(root_id){

  // save gene data to global variable
  gene_data = {};

  function get_mouseover(root_tip, gene_symbol){

    console.log('get_mouseover: gene_symbol')
    console.log(gene_symbol)

    // not sure if this is necessary
    if ( d3.select(root_tip + '_row_tip').classed(gene_symbol) ){
     get_request(root_tip, gene_symbol);
    }

   // get_request(root_tip, gene_symbol);

  }

  function get_request(root_tip, gene_symbol){

    var base_url = 'https://amp.pharm.mssm.edu/Harmonizome/api/1.0/gene/';
    var url = base_url + gene_symbol;

    console.log('gene_symbol')
    console.log(gene_symbol)
    console.log('url')
    console.log(url)

    $.get(url, function(data) {

      data = JSON.parse(data);

      // save data for repeated use
      gene_data[gene_symbol] = {}
      gene_data[gene_symbol].name = data.name;
      gene_data[gene_symbol].description = data.description;

      console.log(gene_data)

      set_tooltip(data, root_tip, gene_symbol);

      return data;

    });
  }

  function set_tooltip(data, root_tip, gene_symbol){

    if (data.name != undefined){

      console.log(data.description)

      d3.selectAll(root_tip + '_row_tip')
        .html(function(){
            var sym_name = gene_symbol + ': ' + data.name;
            var full_html = '<p>' + sym_name + '</p>' +  '<p>' +
              data.description + '</p>';
            return full_html;
        });
    }
  }


  function gene_info(root_tips, gene_info){

    var gene_symbol = gene_info.name;

    console.log(gene_symbol)

    if (_.has(gene_data, gene_symbol)){
      var inst_data = gene_data[gene_symbol];
      set_tooltip(inst_data, root_tip, gene_symbol);
    } else{
      setTimeout(get_mouseover, 250, root_tips, gene_symbol);
    }

  }

  hzome = {}

  hzome.gene_info = gene_info;
  hzome.gene_data = gene_data;
  hzome.get_mouseover = get_mouseover;
  hzome.get_request = get_request;

  return hzome;

}
