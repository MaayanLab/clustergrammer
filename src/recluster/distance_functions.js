module.exports = {

  'euclidean': function(v1, v2) {
      var total = 0;
      for (var i = 0; i < v1.length; i++) {
        total = total + Math.pow(v2[i] - v1[i], 2);
      }
    return Math.sqrt(total);
   },
   'cosine': function(vecA, vecB) {

      function vec_dot_product(vecA, vecB) {
      var product = 0;
      for (var i = 0; i < vecA.length; i++) {
        product = product + vecA[i] * vecB[i];
      }
      return product;
      }

      function vec_magnitude(vec) {
      var sum = 0;
      for (var i = 0; i < vec.length; i++) {
        sum = sum + vec[i] * vec[i];
      }
      return Math.sqrt(sum);
      }

      var cos_sim = vec_dot_product(vecA, vecB) / (vec_magnitude(vecA) * vec_magnitude(vecB));
      var cos_dist = 1 - cos_sim;

    return cos_dist;
  }
};