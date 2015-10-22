function update_network(args){

  console.log('updating the network')

  var config = Config(args);
  var params = VizParams(config);
  console.log(params.super_label_scale);
  console.log(params.show_tooltips);

}