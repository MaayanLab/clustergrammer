function gene_info(gene_symbol){

  var base_url = 'http://localhost:9000/clustergrammer/gene_info/';
  var url = base_url + gene_symbol;

  $.get(url, function(data) {

    data = JSON.parse(data);

    // console.log(_.keys(data))
    // console.log(data.name)
    console.log(data.name)
    console.log(data.description)


  });

}
