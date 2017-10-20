import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import PzStart from './PzStart'
import PzScore from './PzScore'

import pz1 from '../../pzs/pz1/Pz1'
import pz2 from '../../pzs/pz2/Pz2'
import pz3 from '../../pzs/pz3/Pz3'

const pzMap = {
  pz1,
  pz2,
  pz3
}

class Pz extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pzId: this.props.match.params.pzId
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      this.setState({
        pzId: nextProps.match.params.pzId
      });
    }
  }

  render(){
    const PzId = pzMap[this.state.pzId]

    return(
      <div>
        <PzStart pzId={this.state.pzId} />
        <PzScore pzId={this.state.pzId} />
        <PzId />
      </div>
    )
  }
}


export default Pz
