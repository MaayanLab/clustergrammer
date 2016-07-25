function gene_info(gene_symbol){

  var base_url = 'http://localhost:9000/clustergrammer/gene_info/';
  var url = base_url + gene_symbol;

  $.get(url, function(data) {

    data = JSON.parse(data);

    d3.select('.row_tip')
      .html(function(){

          var sym_name = gene_symbol + ': ' + data.name;
          var full_html = '<p>' + sym_name + '</p>' +  '<p>' +
            data.description + '</p>';
          return full_html;

      });

  });

}
