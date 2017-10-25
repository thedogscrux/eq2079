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
      pzCode: this.props.match.params.pzCode
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      this.setState({
        pzCode: nextProps.match.params.pzCode
      });
    }
  }

  render(){
    const PzCode = pzMap[this.state.pzCode]

    return(
      <div>
        <PzStart pzCode={this.state.pzCode} />
        <PzScore pzCode={this.state.pzCode} />
        <PzCode />
      </div>
    )
  }
}


export default Pz
