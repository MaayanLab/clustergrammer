var utils = require('../Utils_clust');
/* Transpose network.
 */
module.exports = function (net) {
  var tnet = {},
      inst_link,
      i;

  tnet.row_nodes = net.col_nodes;
  tnet.col_nodes = net.row_nodes;
  tnet.links = [];

  for (i = 0; i < net.links.length; i++) {
    inst_link = {};
    inst_link.source = net.links[i].target;
    inst_link.target = net.links[i].source;
    inst_link.value = net.links[i].value;

    // Optional highlight.
    if (utils.has(net.links[i], 'highlight')) {
      inst_link.highlight = net.links[i].highlight;
    }
    if (utils.has(net.links[i], 'value_up')) {
      inst_link.value_up = net.links[i].value_up;
    }
    if (utils.has(net.links[i], 'value_dn')) {
      inst_link.value_dn = net.links[i].value_dn;
    }
    if (utils.has(net.links[i], 'info')) {
      inst_link.info = net.links[i].info;
    }
    tnet.links.push(inst_link);
  }

  return tnet;
};
