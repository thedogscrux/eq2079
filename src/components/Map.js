import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { staticLocMK, staticPzs } from '../data/static.js'

class Map extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedPz: {},
      pzs: []
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
    firebase.database().ref('/pzs/').off()
  }

  watchDB() {
    var self = this
    // watch launches
    // TODO: maybe watch MK?
    // watch pzs
    firebase.database().ref('/pzs/').on('value', function(snapshot) {
      if(snapshot.val()) {
        let pzs = Object.keys(snapshot.val()).map( (pz, key) => snapshot.val()[pz] )
        self.updateStatePzs(pzs)
      }
    })
  }

  updateStatePzs(pzs) {
    this.setState({ pzs: pzs })
  }

  selectPz(pzId) {
    let pz = staticPzs[pzId]
    let html =
    `<div>Name: ${pz.name}</div>
    <div>Status: ${pz.status}</div>
    <div>Players: ${pz.players}</div>`
    document.getElementById('selected-pz').innerHTML = html
  }

  getPzs() {
    let html = ''
    //html = staticPzs.map( (pz, key) => {
    html = this.state.pzs.map( (pz, key) => {
      let posTop = pz.mapPos.top
      let posLeft = pz.mapPos.left
      //TODO make dynamic based on num of players
      let sizePx = (20 + (pz.players * 1.9))
      let translateCenter = `translate(-${sizePx/2}px,-${sizePx/2}px)`
      return(
        <div key={key}>
          <button
            className='pz'
            style={{
              top: posTop,
              left: posLeft,
              height: sizePx + 'px',
              width: sizePx + 'px',
              transform: translateCenter
            }}
            onClick={() => this.selectPz(key)}
          ></button>
        </div>
      )
    })
    return html
  }

  render(){
    return(
      <div id='component-map' className='component-wrapper'>
        <h2>Map</h2>
        Your location: 00.00, 00.00<br/>
        <div className='map-wrapper'>
          {this.getPzs()}
        </div>
        <div id='selected-pz'></div>
      </div>
    )
  }
}

export default Map
