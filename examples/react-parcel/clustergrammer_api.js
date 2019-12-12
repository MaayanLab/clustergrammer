import fetch from 'isomorphic-fetch'
import FormData from 'isomorphic-form-data'

const clustergrammer_url = 'https://amp.pharm.mssm.edu/clustergrammer'

export async function clustergrammer_upload(tsv) {
  let formData
  if (tsv instanceof FormData) {
    formData = tsv
  } else {
    formData = new FormData()
    formData.append('file', tsv)
  }

  const response = await fetch(
    `${clustergrammer_url}/matrix_upload/`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (response.status !== 200) {
    throw new Error(`Error uploading to clustergrammer: ${await response.text()}`)
  } else {
    const link = await response.text()
    const parsed_link = /\/viz\/([0-9a-f]+)\//.exec(link)
    const id = parsed_link[1]
    return id
  }
}

export async function clustergrammer_viz_json(id) {
  const response = await fetch(`${clustergrammer_url}/get_viz_json/${id}`)

  if (response.status !== 200) {
    throw new Error(`Error getting json from clustergrammer: ${await response.text()}`)
  } else {
    return JSON.parse(await response.text())
  }
}

