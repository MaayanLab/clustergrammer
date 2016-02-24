def load_l1000cds2(self, l1000cds2):
  import scipy
  import numpy as np
  
  # process gene set result 
  if 'upGenes' in l1000cds2['input']['data']:

    # add the names from all the results 
    all_results = l1000cds2['result']

    # grab col nodes - input sig and drugs 
    self.dat['nodes']['col'] = []

    for i in range(len(all_results)):
      inst_result = all_results[i]
      self.dat['nodes']['col'].append(inst_result['name']+'#'+str(i))

      self.dat['node_info']['col']['value'].append(inst_result['score'])

      for type_overlap in inst_result['overlap']:
        self.dat['nodes']['row'].extend( inst_result['overlap'][type_overlap] )


    self.dat['nodes']['row'] = sorted(list(set(self.dat['nodes']['row'])))

    # initialize the matrix 
    self.dat['mat'] = scipy.zeros([ len(self.dat['nodes']['row']), len(self.dat['nodes']['col']) ])

    # fill in the matrix with l10000 data 
    ########################################

    # fill in gene sigature as first column 
    for i in range(len(self.dat['nodes']['row'])):

      inst_gene = self.dat['nodes']['row'][i]

      # get gene index 
      inst_gene_index = self.dat['nodes']['row'].index(inst_gene)

      # if gene is in up add 1 otherwise add -1 
      if inst_gene in l1000cds2['input']['data']['upGenes']:
        self.dat['node_info']['row']['value'].append(1)
      else:
        self.dat['node_info']['row']['value'].append(-1)

    # save the name as a class
    for i in range(len(self.dat['nodes']['col'])):  
      self.dat['node_info']['col']['cl'].append(self.dat['nodes']['col'][i])

    # swap keys for aggravate and reverse 
    if l1000cds2['input']['aggravate'] == False:
      # reverse gene set
      up_type = 'up/dn'
      dn_type = 'dn/up'
    else:
      # mimic gene set
      up_type = 'up/up'
      dn_type = 'dn/dn'

    # loop through drug results 
    for inst_result_index in range(len(all_results)):

      inst_result = all_results[inst_result_index]

      # for non-mimic if up/dn then it should be negative since the drug is dn 
      # for mimic if up/up then it should be positive since the drug is up
      for inst_dn in inst_result['overlap'][up_type]:

        # get gene index 
        inst_gene_index = self.dat['nodes']['row'].index(inst_dn)

        # save -1 to gene row and drug column 
        if up_type == 'up/dn':
          self.dat['mat'][ inst_gene_index, inst_result_index ] = -1 
        else:
          self.dat['mat'][ inst_gene_index, inst_result_index ] = 1 
       
      # for non-mimic if dn/up then it should be positive since the drug is up 
      # for mimic if dn/dn then it should be negative since the drug is dn 
      for inst_up in inst_result['overlap'][dn_type]:

        # get gene index
        inst_gene_index = self.dat['nodes']['row'].index(inst_up)

        # save 1 to gene row and drug column 
        if dn_type == 'dn/up':
          self.dat['mat'][ inst_gene_index, inst_result_index ] = 1
        else:
          self.dat['mat'][ inst_gene_index, inst_result_index ] = -1


  # process a characteristic direction vector result
  else:
    all_results = l1000cds2['result']

    # get gene names 
    self.dat['nodes']['row'] = l1000cds2['input']['data']['up']['genes'] + l1000cds2['input']['data']['dn']['genes']

    # save gene expression values 
    tmp_exp_vect = l1000cds2['input']['data']['up']['vals'] + l1000cds2['input']['data']['dn']['vals']
    for i in range(len(self.dat['nodes']['row'])):
      self.dat['node_info']['row']['value'].append(tmp_exp_vect[i])

    # gather result names 
    for i in range(len(all_results)):

      inst_result = all_results[i]
      # add result to list 
      self.dat['nodes']['col'].append(inst_result['name']+'#'+str(i))
      self.dat['node_info']['col']['cl'].append(inst_result['name'])

      # reverse signature, score [1,2]
      if l1000cds2['input']['aggravate'] == False:
        self.dat['node_info']['col']['value'].append( inst_result['score']-1 )
      else:
        self.dat['node_info']['col']['value'].append( 1 - inst_result['score'] )

      # concat up and down lists 
      inst_vect = inst_result['overlap']['up'] + inst_result['overlap']['dn']
      inst_vect = np.transpose(np.asarray(inst_vect))

      inst_vect = inst_vect.reshape(-1,1)

      # initialize or add to matrix 
      if type(self.dat['mat']) is list:
        self.dat['mat'] = inst_vect
      else:
        self.dat['mat'] = np.hstack(( self.dat['mat'], inst_vect))