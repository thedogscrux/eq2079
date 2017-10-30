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
      pzs: [],
      geoLoc: {
        latitude: 0,
        longitude: 0
      }
    }
  }

  componentDidMount() {
    this.watchDB()
    this.geoLoc()
  }

  componentWillUnmount() {
    this.unwatchDB()
    navigator.geolocation.clearWatch(this.watchId)
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

  getMyPos() {
    // EQ

    // PSquare

    //launch
    // BL 47.607082, -122.184317
    // TR 47.608731, -122.183145
    // get map X/Y
    if(this.state.geoLoc.latitude != 0) {
      // make all coords whole numbers
      let bottomLeftLngXOffset = parseInt((-122.184317 + 122) * 1000000)
      let bottomLeftLatYOffset = parseInt((47.607082 - 47) * 1000000)
      let topRightLngX = parseInt((-122.183145 + 122) * 1000000)
      let topRightLatY = parseInt((47.608731 - 47) * 1000000)
      let myLngX = parseInt((this.state.geoLoc.longitude + 122) * 1000000)
      let myLatY = parseInt((this.state.geoLoc.latitude - 47) * 1000000)
      // offset coords
      let lngX100 = topRightLngX - bottomLeftLngXOffset
      let latY100 = topRightLatY - bottomLeftLatYOffset
      let myMapX = myLngX - bottomLeftLngXOffset
      let myMapY = myLatY - bottomLeftLatYOffset
      // convert my XY to percent and find relative pos on map
      myMapX = parseInt((myMapX / lngX100) * 100)
      myMapY = parseInt((myMapY / latY100) * 100)
      console.log('myMapX',myMapX);
      console.log('myMapY',myMapY);

      let sizePx = 10
      let translateCenter = `translate(-${sizePx/2}px,-${sizePx/2}px)`
      return(
        <div
            className='pz'
            style={{
              bottom: myMapY + '%',
              left: myMapX + '%',
              height: sizePx + 'px',
              width: sizePx + 'px',
              transform: translateCenter,
              backgroundColor: 'rgba(255, 0, 0, .5)'
            }}
          >
        </div>
      )
    } else {
      // no coords, dont show me on map
      return
    }

  }

  getPzs() {
    let html = ''
    html = this.state.pzs.map( (pz, key) => {
      let posBottom = pz.mapPos.bottom
      let posLeft = pz.mapPos.left
      //TODO make dynamic based on num of players
      let sizePx = (20 + (pz.players * 1.9))
      let translateCenter = `translate(-${sizePx/2}px,-${sizePx/2}px)`
      return(
        <div key={key}>
          <button
            className='pz'
            style={{
              bottom: posBottom,
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

  geoLoc() {
    let config = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 1000,
      distanceFilter: 10
    }
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.setState({
          geoLoc: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null
          }
        });
      },
      (error) => this.setState({ error: error.message }),
      config
    );
  }

  render(){
    return(
      <div id='component-map' className='component-wrapper'>
        <h2>Map</h2>
        <div className='map-wrapper'>
          {this.getPzs()}
          {this.getMyPos()}
        </div>
        <div id='selected-pz'></div>
      </div>
    )
  }
}

export default Map
