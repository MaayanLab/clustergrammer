import Clustergrammer from '../src/main.js';
import data from './data.json';

function generateData() {
  const rowCount = 300;
  const colCount = 100;
  const nGroupDepth = 10;
  const linkCount = 10000;
  const network_data = {
    row_nodes: Array(rowCount)
      .fill(0)
      .map((_, i) => ({
        name: `ROW-${i}`,
        clust: i,
        group: Array(nGroupDepth)
          .fill(0)
          .map((_, d) => parseInt(i / 2 ** d + ''))
      })),
    col_nodes: Array(colCount)
      .fill(0)
      .map((_, i) => ({
        name: `COL-${i}`,
        clust: i,
        group: Array(nGroupDepth)
          .fill(0)
          .map((_, d) => parseInt(i / 2 ** d + ''))
      })),
    links: Array(linkCount)
      .fill(0)
      .map((_) => ({
        source: Math.floor(Math.random() * rowCount),
        target: Math.floor(Math.random() * colCount),
        value: Math.round(Math.random())
      }))
  };
  return network_data;
}

const network_data = generateData();
const clust1 = Clustergrammer({
  root: '#clustExample1',
  network_data: network_data
});
window.clust1 = clust1;

const clust2 = Clustergrammer({
  root: '#clustExample2',
  network_data: data,
  tile_colors: ['#2F80ED', '#2F80ED']
});
window.clust2 = clust2;
