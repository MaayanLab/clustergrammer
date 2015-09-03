
// This object is a temporary hack to hold all global state for this module.
var globals = {};

/* Main program
 * ----------------------------------------------------------------------- */

// consume and validate user input
// build giant config object
// visualize based on config object
// handle user events

// viz is scoped globally 
var viz = Viz(args);


// highlight resource types - set up type/color association
var gene_search = Search(globals.network_data.row_nodes, 'name');