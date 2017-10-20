import React, { Component } from 'react'

class PzScore extends Component {
  constructor(props){
      super(props)
      this.state = {
        pzId: this.props.pzId
      }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      this.setState({
        pzId: nextProps.pzId
      });
    }
  }

  render(){
    return(
      <div className='component-wrapper'>
        <h1>Pz Score: {this.state.pzId}</h1>
        100
      </div>
    )
  }
}

export default PzScore
