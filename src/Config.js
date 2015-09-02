
function Config(args) {

    var config,
        defaults;

    defaults = {

        // This should be a DOM element, not a selector.
        svg_div_id: 'svg_id',
        label_overflow: {
            row: 1,
            col: 1
        },
        row_label_scale: 1,
        col_label_scale: 1,
        transpose: false,
        title_tile: false,

        // Red and blue
        tile_colors: ['#FF0000', '#1C86EE'],
        background_color: '#FFFFFF',
        super_border_color: '#F5F5F5',
        do_zoom: true,

        // Default domain is set to 0, which means that the domain will be set automatically
        input_domain: 0,
        opacity_scale: 'linear',
        resize: true,
        outer_margins: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        },
        super_labels: false,

        // Gray border around the visualization
        grey_border_width: 3,

        // the distance between labels and clustergram
        // a universal margin for the clustergram
        uni_margin: 4,
        uni_margin_row: 2
    };

    // Mixin defaults with  user-defined arguments.
    config = Utils.extend(defaults, args);

    // super label width - the labels are 20px wide if they are included
    if (config.super_labels) {
        // include super labels
        config.super_label_width = 20;
    } else {
        // do not include super labels
        config.super_label_width = 0;
    }

    // super-row/col labels
    if (!Utils.is_undefined(args.row_label) && !Utils.is_undefined(args.col_label)) {
        config.super_labels = true;
        config.super = {};
        config.super.row = args.row_label;
        config.super.col = args.col_label;
    }

    // transpose network data and super-labels
    if (config.transpose) {
        config.super.row = args.col_label;
        config.super.col = args.row_label;
    } else if (!Utils.is_undefined(args.order) && is_supported_order(args.order)) {
        config.inst_order = args.order;
    } else {
        config.inst_order = 'clust';
    }

    var row_nodes = args.network_data.row_nodes,
        col_nodes = args.network_data.col_nodes;

    config.show_dendrogram = Utils.has(row_nodes[0], 'group') || Utils.has(col_nodes[0], 'group');
    config.show_categories = Utils.has(row_nodes[0], 'cl') || Utils.has(col_nodes[0], 'cl');

    function is_supported_order(order) {
        return order === 'clust' || order === 'rank' || order === 'class';
    }

    return config;
}