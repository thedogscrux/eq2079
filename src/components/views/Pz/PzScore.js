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
        pzKey: propsPzs.findIndex(pz => pz.code === this.props.pzCode),
        pz: {}
      }
  }

  componentDidMount() {
    this.watchDB()
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      let pzKey = propsPzs.findIndex(pz => pz.code === nextProps.pzCode)
      this.setState({
        pzCode: nextProps.pzCode,
        pzKey: pzKey
      })
      if(pzKey==0) pzKey = '0' // workaround for firebase zero/null starting index
      this.watchDB(pzKey)
    }
  }

  // GET
  watchDB(key) {
    let pzKey = key
    if(!pzKey) pzKey = this.state.pzKey
    var self = this
    firebase.database().ref('users/' + this.props.userId + '/pzs/' + pzKey).on('value', function(snapshot) {
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
        key: {this.state.pzKey}<br/>
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
