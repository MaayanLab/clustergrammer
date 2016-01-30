
/* Main program
 * ----------------------------------------------------------------------- */

// consume and validate user input
// build giant config object
// visualize based on config object
// handle user events

// consume and validate user arguments, produce configuration object 
var config = Config(args);

// deepcopy
var config_copy = jQuery.extend(true, {}, config);

// make visualization parameters using configuration object 
var params = Params(config_copy);

// make visualization using parameters  
var viz = Viz(params);
