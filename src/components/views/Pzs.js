import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import PzStart from './Pz/PzStart'
import PzScore from './Pz/PzScore'

import pz1 from '../pzs/pz1/Pz1'
import pz2 from '../pzs/pz2/Pz2'

const pzMap = {
  pz1,
  pz2
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

const Pzs = ({ match }) => (
  <div>
    <Route path={`${match.url}/:pzId`} component={Pz}/>
  </div>
)

export default Pzs

export {
  Pz
}
