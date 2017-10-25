import React, { Component } from 'react'

class PzStart extends Component {
  constructor(props){
      super(props)
      this.state = {
        pzCode: this.props.pzCode
      }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      this.setState({
        pzCode: nextProps.pzCode
      });
    }
  }

  render(){
    return(
      <div className='component-wrapper'>
        <h1>Pz Start: {this.state.pzCode}</h1>
        <button>Start a New Game</button>
        <button>Join Game</button>
        <button disabled='disabled'>Game in Progress</button>
      </div>
    )
  }
}

export default PzStart
