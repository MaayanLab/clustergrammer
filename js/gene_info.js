// save gene data
gene_data = {};

function gene_info(gene_info){
  var gene_symbol = gene_info.name;

  if (_.has(gene_data, gene_symbol)){
    var inst_data = gene_data[gene_symbol];
    set_tooltip(inst_data)
  } else{
    setTimeout(hzome_get_request, 500, gene_symbol);
  }

  function hzome_get_request(gene_symbol){

    if ( d3.select('.row_tip').classed(gene_symbol) ){

      // var base_url = 'http://amp.pharm.mssm.edu/Harmonizome/api/1.0/gene/'
      // var base_url = 'http://cleopatra.1425mad.mssm.edu:31731/Harmonizome/api/1.0/gene/'
      var base_url = 'https://amp.pharm.mssm.edu/clustergrammer/gene_info/'

      var url = base_url + gene_symbol;

      $.get(url, function(data) {
        data = JSON.parse(data);

        // save data for repeated use
        gene_data[gene_symbol] = {}
        gene_data[gene_symbol].name = data.name;
        gene_data[gene_symbol].description = data.description;

        set_tooltip(data);

      });

    }

  }

  function set_tooltip(data){

    if (data.name != undefined){
      d3.selectAll('.row_tip')
        .html(function(){
            var sym_name = gene_symbol + ': ' + data.name;
            var full_html = '<p>' + sym_name + '</p>' +  '<p>' +
              data.description + '</p>';
            return full_html;
        });
    }
  }

}
