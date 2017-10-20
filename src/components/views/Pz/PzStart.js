import React, { Component } from 'react'

class PzStart extends Component {
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
        <h1>Pz Start: {this.state.pzId}</h1>
        <button>Start a New Game</button>
        <button>Join Game</button>
        <button disabled='disabled'>Game in Progress</button>
      </div>
    )
  }
}

export default PzStart
