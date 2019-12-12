import React from 'react'
import clustergrammer from 'clustergrammer'

// 1) ensure it starts with a letter not a number
// 2) sufficiently random as to *hopefully* not collide
//    with the next iteration (or other components)
const randomId = () => `f${Math.random().toString(16).substring(2)}`

export class Clustergrammer extends React.Component {
  clustergrammer = () => {
    if (this.ref !== undefined) {
      clustergrammer({
        root: `#${this.ref.id}`,
        network_data: { ...this.props },
      })
    }
  }

  componentDidUpdate = () => {
    this.clustergrammer()
  }

  set_ref = (ref) => {
    if (ref) this.ref = ref
    this.clustergrammer()
  }

  render() {
    return (
      <div
        id={randomId()}
        style={{
          width: '800px',
          height: '600px'
        }}
        ref={this.set_ref}
      ></div>
    )
  }
}
