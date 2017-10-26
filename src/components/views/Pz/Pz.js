import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import PzStart from './PzStart'
import PzScore from './PzScore'

import { propsPzs } from '../../../data/propsPzs.js'

import pz1 from '../../pzs/pz1/Pz1'
import pz2 from '../../pzs/pz2/Pz2'
import pz3 from '../../pzs/pz3/Pz3'

const pzMap = {
  pz1,
  pz2,
  pz3
}

const mapStateToProps = (state, props) => {
  return {
    user: state.user
  }
}

class Pz extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pzCode: this.props.match.params.pzCode,
      pzIndex: propsPzs.findIndex(pz => pz.code === this.props.match.params.pzCode),
      pz: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      let pzIndex = propsPzs.findIndex(pz => pz.code === nextProps.match.params.pzCode)
      this.setState({
        pzCode: nextProps.match.params.pzCode,
        pzIndex: pzIndex
      });
      if(pzIndex==0) pzIndex = '0' // workaround for firebase zero/null starting index
      this.watchDB(pzIndex)
    }
  }

  componentDidMount() {
    this.watchDB()
  }

  componentWillUnmount() {
    this.unwatchDB()
  }

  // WATCH

  unwatchDB() {
    firebase.database().ref('/pzs/' +  this.state.pzIndex).off()
  }

  watchDB(index) {
    let pzIndex = index
    if(!pzIndex) pzIndex = this.state.pzIndex
    var self = this
    firebase.database().ref('/pzs/' +  pzIndex).on('value', function(snapshot){
      self.updateStatePz(snapshot.val())
    })
  }

  updateStatePz(value) {
    this.setState({ pz: value })
  }

  render(){
    const PzCode = pzMap[this.state.pzCode]
    let content = null
    if(this.props.user.pzs[this.state.pzIndex].attempts >= 1) {
      content = <PzScore pzCode={this.state.pzCode} pzIndex={this.state.pzIndex} pzStatus={this.state.pz.status} pzPlayerIDs={this.state.pz.players} />
    } else {
      if(this.state.pz.status == 'active') {
        content = <PzCode />
      } else {
        content = <PzStart pzCode={this.state.pzCode} pzIndex={this.state.pzIndex} pzStatus={this.state.pz.status} pzPlayerIDs={this.state.pz.players}/>
      }
    }
    return(
      <div>
        {content}
      </div>
    )
  }
}

const PzContainer = connect(
  mapStateToProps
)(Pz)

export default PzContainer
