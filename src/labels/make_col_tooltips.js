var d3_tip_custom = require("../tooltip/d3_tip_custom");

// col tooltip
module.exports = function make_col_tooltips(params) {
  if (params.labels.show_label_tooltips) {
    // remove old col tooltips
    d3.selectAll(params.viz.root_tips + "_col_tip").remove();

    // d3-tooltip
    var col_tip = d3_tip_custom()
      .attr("class", function () {
        var root_tip_selector = params.viz.root_tips.replace(".", "");
        var class_string =
          root_tip_selector + " d3-tip " + root_tip_selector + "_col_tip";
        return class_string;
      })
      .direction("w")
      .offset([20, 0])
      .style("display", "none")
      .html(function (d) {
        var inst_name = d.name.replace(/_/g, " ").split("#")[0];
        return "<span>" + inst_name + "</span>";
      });

    d3.select(params.viz.viz_wrapper)
      .select("svg")
      .select(params.root + " .col_zoom_container")
      .selectAll(".col_label_group")
      .select("text")
      .call(col_tip);

    d3.select(params.root + " .col_zoom_container")
      .selectAll(".col_label_group")
      .on("mouseover", function (d) {
        dispatchEvent(
          new CustomEvent("COL_MOUSEOVER", {
            detail: d,
          })
        );
      })
      .on("mouseout", function (d) {
        dispatchEvent(
          new CustomEvent("COL_MOUSEOUT", {
            detail: d,
          })
        );
      });
  }
};
