
/* Main program
 * ----------------------------------------------------------------------- */

// consume and validate user input
// build giant config object
// visualize based on config object
// handle user events

// consume and validate user arguments, produce configuration object 
var config = Config(args);

console.log(config.network_data.row_nodes.length)

// deepcopy
var config_copy = jQuery.extend(true, {}, config);

// make visualization parameters using configuration object 
var params = VizParams(config_copy);

console.log('config')
console.log(config.network_data.row_nodes.length)
console.log('config_copy')
console.log(config_copy.network_data.row_nodes.length)

// make visualization using parameters  
var viz = Viz(params);
