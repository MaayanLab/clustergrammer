module.exports = function ini_sidebar_params(){
  var sidebar = {};

  sidebar.wrapper = {};
  sidebar.wrapper.width = 170;

  sidebar.row_search = {};
  sidebar.row_search.box = {};
  sidebar.row_search.box.height = 34;
  sidebar.row_search.box.width = 95;

  sidebar.slider = {};
  sidebar.slider.width = 160;
  sidebar.slider.margin_left = 15;

  sidebar.key_cat = {};
  sidebar.key_cat.width = 170;
  sidebar.key_cat.margin_left = 5;

  return sidebar;
};