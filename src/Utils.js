
/* Utility functions
 * ----------------------------------------------------------------------- */
module.exports = {
  normal_name: function(d, max_char) {
    var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
    if (inst_name.length > max_char) {
      inst_name = inst_name.substring(0, max_char) + '..';
    }
    return inst_name;
  },
  is_supported_order: function(order) {
    return order === 'ini' || order === 'clust' || order === 'rank' || order === 'class' || order == 'alpha';
  },

  /* Returns whether or not an object has a certain property.
   */
  has: function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  },

  /* Returns true if the object is undefined.
   */
  is_undefined: function(obj) {
    return obj === void 0;
  },

  /* Mixes two objects in together, overwriting a target with a source.
   */
  extend: function(target, source) {
    target = target || {};
    for (var prop in source) {
      if (typeof source[prop] === 'object') {
        target[prop] = this.extend(target[prop], source[prop]);
      } else {
        target[prop] = source[prop];
      }
    }
    return target;
  }
};
