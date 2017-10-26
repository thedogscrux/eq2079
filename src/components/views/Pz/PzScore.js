import React, { Component } from 'react'
import { connect } from 'react-redux'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { propsPzs } from '../../../data/propsPzs.js'

const mapStateToProps = (state, props) => {
  return {
    userId: state.user.id
  }
}

class PzScore extends Component {
  constructor(props){
      super(props)
      this.state = {
        pzCode: this.props.pzCode,
        pzIndex: propsPzs.findIndex(pz => pz.code === this.props.pzCode),
        pz: {}
      }
  }

  componentDidMount() {
    this.watchDB()
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      let pzIndex = propsPzs.findIndex(pz => pz.code === nextProps.pzCode)
      this.setState({
        pzCode: nextProps.pzCode,
        pzIndex: pzIndex
      })
      //if(pzIndex==0) pzIndex = '0' // workaround for firebase zero/null starting index
      this.watchDB(pzIndex)
    }
  }

  // WATCH

  watchDB(index) {
    let pzIndex = index
    if(!pzIndex) pzIndex = this.state.pzIndex
    var self = this
    firebase.database().ref('users/' + this.props.userId + '/pzs/' + pzIndex).on('value', function(snapshot) {
      self.updateStatePz(snapshot.val())
    })

  }

  updateStatePz(pz) {
    this.setState({
      pz: pz
    })
  }

  render(){
    return(
      <div className='component-wrapper'>
        <h1>Pz Score: {this.state.pzCode}</h1>
        index: {this.state.pzIndex}<br/>
        score: {this.state.pz.score}<br/>
        attempts: {this.state.pz.attempts}
      </div>
    )
  }
}

const PzScoreContainer = connect(
  mapStateToProps
)(PzScore)

export default PzScoreContainer
