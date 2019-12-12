import React from 'react'
import ReactDOM from 'react-dom'
import { Clustergrammer } from './react_clustergrammer'
import {
  clustergrammer_upload,
  clustergrammer_viz_json
} from './clustergrammer_api'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      viz_json: null,
    }
  }

  set_file_ref = (ref) => {
    if (ref) this.file_ref = ref
  }

  reset = () => {
    this.setState({ viz_json: null })
  }

  submit = async () => {
    if (this.file_ref === undefined) throw new Error('Not ready')
    const file = this.file_ref.files[0]
    const upload_id = await clustergrammer_upload(file)
    const viz_json = await clustergrammer_viz_json(upload_id)
    this.setState({ viz_json })
  }

  render() {
    return (
      <div>
        {this.state.viz_json === null ? (
          <div>
            <input ref={this.set_file_ref} type="file" />
            <button onClick={this.submit}>Submit</button>
          </div>
        ) : (
          <div>
            <Clustergrammer
              {...this.state.viz_json}
            />
            <button onClick={this.reset}>Reset</button>
          </div>
        )}
      </div>
    )
  }
}

const el = document.createElement('div')
document.body.appendChild(el)
ReactDOM.render(<App />, el)
