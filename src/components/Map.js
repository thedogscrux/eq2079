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
      },
      selectedPzID: null
    }
  }

  componentDidMount() {
    this.watchDB()
    this.watchGeoLoc()
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

  watchGeoLoc() {
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

  // HTML

  getMyPos() {
    // EQ
    // BL 47.543736, -122.328962
    // TR 47.545308, -122.327849
    // PSquare

    //launch
    // BL 47.607082, -122.184317
    // TR 47.608731, -122.183145
    // get map X/Y
    if(this.state.geoLoc.latitude != 0) {
      // make all coords whole numbers
      let bottomLeftLngXOffset = parseInt((-122.328962 + 122) * 1000000)
      let bottomLeftLatYOffset = parseInt((47.543736 - 47) * 1000000)
      let topRightLngX = parseInt((-122.327849 + 122) * 1000000)
      let topRightLatY = parseInt((47.545308 - 47) * 1000000)
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
      // in case my pos is off map
      myMapX = (myMapX <= 0) ? 2 : myMapX
      myMapX = (myMapX >= 100) ? 98 : myMapX
      myMapY = (myMapY <= 0) ? 2 : myMapY
      myMapY = (myMapY >= 100) ? 98 : myMapY
      // TODO add my coords to firebase for MK to see
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
              backgroundColor: 'rgba(0, 0, 255, .5)'
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
      let sizePx = (pz.players) ? (20 + (pz.players.length * 2.9)) : 10
      let translateCenter = `translate(-${sizePx/2}px,-${sizePx/2}px)`
      let bgColor = null
      if(pz.status === 'active') {
        bgColor = 'rgba(255, 0, 0, .5)'
      } else if(pz.status === 'loading') {
        bgColor = 'rgba(255, 255, 0, .5)'
      } else {
        bgColor = 'rgba(0, 255, 0, .5)'
      }
      return(
        <div key={key}>
          <button
            className='pz'
            style={{
              bottom: posBottom,
              left: posLeft,
              height: sizePx + 'px',
              width: sizePx + 'px',
              transform: translateCenter,
              WebkitTransform: translateCenter,
              backgroundColor: bgColor
            }}
            onClick={ () => this.setState({selectedPzID: key}) }
          ></button>
        </div>
      )
    })
    return html
  }

  render(){
    // show info for selected Pz
    let selectedPz = (this.state.pzs && this.state.selectedPzID) ? this.state.pzs[this.state.selectedPzID] : null
    let htmlSelectedPz = null
    if(selectedPz) {
      htmlSelectedPz = <div>
        <div>Name: {selectedPz.name}</div>
        <div>Status: {selectedPz.status}</div>
        <div>Players: {selectedPz.players}</div>
      </div>
    }

    return(
      <div id='component-map' className='component-wrapper'>
        <h2>Map</h2>
        My location: {this.state.geoLoc.latitude}, {this.state.geoLoc.longitude}
        <div className='map-wrapper'>
          {this.getPzs()}
          {this.getMyPos()}
        </div>
        <div id='selected-pz'>{htmlSelectedPz}</div>
      </div>
    )
  }
}

export default Map
