
/* Main program
 * ----------------------------------------------------------------------- */

// consume and validate user input
// build giant config object
// visualize based on config object
// handle user events

// consume and validate user arguments, produce configuration object 
var config = Config(args);

console.log(config.force_square)

// make visualization using configuration object and network 
var viz = Viz(config);
