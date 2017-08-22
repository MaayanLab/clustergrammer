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

function vec_diff_value(vec, val){
  var vec_sub = [];
  for (var i = 0; i < vec.length; i++){
    vec_sub.push( vec[i] - val );
  }
  return vec_sub;
}

function vec_mean(vec){
  var sum = 0;
  var mean;
  for (var i = 0; i < vec.length; i++){
    sum = sum + vec[i];
  }

  mean = sum / vec.length;

  return mean;
}

module.exports = {

  'euclidean': function(v1, v2) {
      var total = 0;
      for (var i = 0; i < v1.length; i++) {
        total = total + Math.pow(v2[i] - v1[i], 2);
      }
    return Math.sqrt(total);
   },
   'cosine': function(vecA, vecB) {

      var cos_sim = vec_dot_product(vecA, vecB) / (vec_magnitude(vecA) * vec_magnitude(vecB));

      var cos_dist = 1 - cos_sim;

    return cos_dist;
  },
  'correlation': function(vecA, vecB){

    var vecA_mean = vec_mean(vecA);
    var vecB_mean = vec_mean(vecB);

    var vecA_diff_mean = vec_diff_value(vecA, vecA_mean);
    var vecB_diff_mean = vec_diff_value(vecB, vecB_mean);

    var cor_sim = vec_dot_product(vecA_diff_mean, vecB_diff_mean) / ( vec_magnitude(vecA_diff_mean) * vec_magnitude(vecB_diff_mean) );
    var cor_diff = 1 - cor_sim;

    return cor_diff;
  }
};