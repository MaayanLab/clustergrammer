
// This object is a temporary hack to hold all global state for this module.
var globals = {};

/* Main program
 * ----------------------------------------------------------------------- */

// consume and validate user input
// build giant config object
// visualize based on config object
// handle user events

// consume and validate user input
var config = Config(args);

// make visualization 
var viz = Viz(config, args.network_data);

// highlight resource types - set up type/color association
var gene_search = Search(globals.network_data.row_nodes, 'name');