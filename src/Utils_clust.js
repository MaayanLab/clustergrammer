var underscore = require('underscore');

/* Utility functions
 * ----------------------------------------------------------------------- */
module.exports = {
  normal_name: function(d) {
    var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
    return inst_name;
  },
  is_supported_order: function(order) {
    return order === 'ini' || order === 'clust' || order === 'rank_var' || order === 'rank' || order === 'class' || order == 'alpha';
  },

  /* Returns whether or not an object has a certain property.
   */
  has: function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  },

  property: function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  },

  // Convenience version of a common use case of `map`: fetching a property.
  pluck: function(arr, key) {
    var self = this;
    // Double check that we have lodash or underscore available
    if (window._) {
      // Underscore provides a pluck function. Use that.
      if (typeof underscore.pluck === 'function') {
        return underscore.pluck(arr, key);
      } else if (typeof underscore.map === 'function') {
        // Lodash does not have a pluck function.
        // Use underscore.map with the property function defined above.
        return underscore.map(arr, self.property(key));
      }
    } else if (arr.map && typeof arr.map === 'function') {
      // If lodash or underscore not available, check to see if the native arr.map is available.
      // If so, use it with the property function defined above.
      return arr.map(self.property(key));
    }
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
