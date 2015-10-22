
/* Main program
 * ----------------------------------------------------------------------- */

// consume and validate user input
// build giant config object
// visualize based on config object
// handle user events

// consume and validate user arguments, produce configuration object 
var config = Config(args);

// make visualization parameters using configuration object 
var params = VizParams(config);

// make visualization using parameters  
var viz = Viz(params);
