def main(self):
  self.dat = {}
  self.dat['nodes'] = {}
  self.dat['nodes']['row'] = []
  self.dat['nodes']['col'] = []
  self.dat['mat'] = []

  self.dat['node_info'] = {}
  for inst_rc in self.dat['nodes']:
    self.dat['node_info'][inst_rc] = {}
    self.dat['node_info'][inst_rc]['ini'] = []
    self.dat['node_info'][inst_rc]['clust'] = []
    self.dat['node_info'][inst_rc]['rank'] = []
    self.dat['node_info'][inst_rc]['info'] = []
    self.dat['node_info'][inst_rc]['cat'] = []
    self.dat['node_info'][inst_rc]['value'] = []

  self.viz = {}
  self.viz['row_nodes'] = []
  self.viz['col_nodes'] = []
  self.viz['links'] = []  

  self.sim = {}