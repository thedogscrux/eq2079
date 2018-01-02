import React, { Component } from 'react'
import { connect } from 'react-redux'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import moment from 'moment'
import tz from 'moment-timezone'

import { staticLocations, staticPzs } from '../data/static.js'
import game from '../Settings.js'
import { showAlert } from './Alert'

const mapStateToProps = (state, ownProps) => {
  return {
    userId: state.user.id,
    launchId: state.user.launchId,
    debug: state.admin.debug
  }
}

class Map extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedPz: {},
      pzs: [],
      myGeoLoc: {
        latitude: 0,
        longitude: 0
      },
      uranium: {
        bottom: 0,
        left: 0,
        status: 'free | captured | bay',
        enabled: false
      },
      selectedPzID: -1
    }
  }

  componentDidMount() {
    this.watchDB()
    this.watchMyGeoLoc()
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

    // watch  uranium
    firebase.database().ref('/launches/' + this.props.launchId).on('value', function(snapshot) {
      if(snapshot.val()) {
        self.updateStateUranium(snapshot.val().uranium)
      }
    })

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

  watchMyGeoLoc(debugGeoLoc) {
    if(debugGeoLoc){
      let newLat = this.state.myGeoLoc.latitude - 10
      let newLong = this.state.myGeoLoc.longitude + 10
      this.setState({
        myGeoLoc: {
          latitude: newLat,
          longitude: newLong,
          error: null
        }
      });
      this.checkIfUraniumEnabled()
      return
    }
    let config = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 1000,
      distanceFilter: 10
    }
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.setState({
          myGeoLoc: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null
          }
        });
        this.checkIfUraniumEnabled()
      },
      (error) => this.setState({ error: error.message }),
      config
    );
  }

  checkIfUraniumEnabled() {
    console.log('checkIfUraniumEnabled');
    let self = this
    let userId = this.props.userId
    let myMapPos = this.getMyMapPos()
    let launchId = this.props.launchId

    // only let the user pickup the urnaium if they are standing above it and the last time they touced it was X minutes ago
    if (Math.abs(myMapPos.bottom - this.state.uranium.bottom) <= 5 && Math.abs(myMapPos.left - this.state.uranium.left) <= 5) {
      firebase.database().ref('/users/' + userId + '/uranium/timeLastPickup').once('value').then(function(snapshot) {
        self.updateStateUranium({ enabled: true })
      })
    } else {
      self.updateStateUranium({ enabled: false })
    }

    // check if user standing above bay with uranium
    if (Math.abs(myMapPos.bottom - staticLocations.uraniumBay.mapPos.bottom) <= 5 && Math.abs(myMapPos.left - staticLocations.uraniumBay.mapPos.left) <= 5) {
      firebase.database().ref('/launches/' + launchId + '/uranium/').once('value').then(function(snapshot){
        if (snapshot.val().userId === userId) {
          // drop off the uranium
          firebase.database().ref('/launches/' + launchId + '/uranium/').update({
            status: 'bay'
          })
        }
      })
    }
  }

  updateStateUranium(uranium) {
    let uraniumNew = this.state.uranium
    if(uranium.mapPos) {
      uraniumNew.bottom = uranium.mapPos.bottom
      uraniumNew.left = uranium.mapPos.left
      this.checkIfUraniumEnabled()
    }
    if (uranium.status) uraniumNew.status = uranium.status
    if (uranium.hasOwnProperty('enabled')) uraniumNew.enabled = uranium.enabled
    this.setState({
      uranium: uraniumNew
    })
  }

  // HTML

  getMyMapPos() {
    // make all coords whole numbers
    let bottomLeftLngXOffset = parseInt((-122.328962 + 122) * 1000000)
    let bottomLeftLatYOffset = parseInt((47.543736 - 47) * 1000000)
    let topRightLngX = parseInt((-122.327849 + 122) * 1000000)
    let topRightLatY = parseInt((47.545308 - 47) * 1000000)
    let myLngX = parseInt((this.state.myGeoLoc.longitude + 122) * 1000000)
    let myLatY = parseInt((this.state.myGeoLoc.latitude - 47) * 1000000)
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
    return {
      bottom: myMapY,
      left: myMapX
    }
  }

  getMe() {
    // EQ
    // BL 47.543736, -122.328962
    // TR 47.545308, -122.327849
    // PSquare

    //launch
    // BL 47.607082, -122.184317
    // TR 47.608731, -122.183145
    // get map X/Y
    if(this.state.myGeoLoc.latitude != 0) {
      let sizePx = 25
      let translateCenter = `translate(-${sizePx/2}px,-${sizePx/2}px)`
      let myMapPos = this.getMyMapPos()
      this.saveLocation(myMapPos)
      return(
        <div
            className='pz'
            style={{
              bottom: myMapPos.bottom + '%',
              left: myMapPos.left + '%',
              height: sizePx + 'px',
              width: sizePx + 'px',
              transform: translateCenter,
              backgroundColor: 'rgba(100, 100, 255, .8)'
            }}
          >
        </div>
      )
    } else {
      // no coords, dont show me on map
      return
    }

  }

  saveLocation(myMapPos) {
    let userId = this.props.userId
    let launchId = this.props.launchId
    let timeNow = moment().tz('America/Los_Angeles')
    let location = {
      longitude: this.state.myGeoLoc.longitude,
      latitude: this.state.myGeoLoc.latitude,
      time: timeNow.format('kk:mm:ss')
    }
    firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
      if(timeNow.diff(moment(snapshot.val().pathUpdated, 'kk:mm:ss'), 'minutes') > 10) {
        // if ten mins has past since last checking, save location
        let newPaths = snapshot.val().paths
        newPaths.push(location)
        firebase.database().ref('/users/' + userId).update({
          pathUpdated: timeNow.format('kk:mm:ss'),
          paths: newPaths
        })
      } else {
        // overwrite the running value
        firebase.database().ref('/users/' + userId + '/location/').update({
          longitude: location.longitude,
          latitude: location.latitude
        }).then(function(){
          // if carrying the uranium, update its location as well
          firebase.database().ref('/launches/' + launchId + '/uranium/').once('value').then(function(snapshot){
            if(snapshot.val().userId === userId && snapshot.val().status === 'captured') {
              firebase.database().ref('/launches/' + launchId + '/uranium/').update({
                mapPos: {
                  bottom: myMapPos.bottom,
                  left: myMapPos.left
                }
              })
            }
          })
        })
      }
    })
  }

  getStaticLocs() {
    let html = ''
    if (!staticLocations) return ''
    html = Object.keys(staticLocations).map( (location, key) => {
      let posBottom = staticLocations[location].mapPos.bottom
      let posLeft = staticLocations[location].mapPos.left
      let sizePx = 20
      let translateCenter = `translate(-${sizePx/2}px,-${sizePx/2}px)`
      return(
        <div key={key}>
          <button
            id={'location-' + staticLocations[location].id}
            className='location'
            style={{
              bottom: posBottom + '%',
              left: posLeft + '%',
              height: sizePx + 'px',
              width: sizePx + 'px',
              transform: translateCenter,
              WebkitTransform: translateCenter
            }}
            onClick={ () => this.setState({selectedPzID: staticLocations[location].id}) }
          ></button>
        </div>
      )
    })
    return html
  }

  getPzs() {
    let html = ''
    html = this.state.pzs.map( (pz, key) => {
      let posBottom = pz.mapPos.bottom
      let posLeft = pz.mapPos.left
      let sizePx = (pz.players) ? (40 + (pz.players.length * 2.9)) : 20
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

  getUraniumPos() {
    let uranium = this.state.uranium
    let sizePx = 15
    let translateCenter = `translate(-${sizePx/2}px,-${sizePx/2}px)`
    return(
      <div>
        <button
          id='uranium'
          style={{
            bottom: uranium.bottom + '%',
            left: uranium.left + '%',
            height: sizePx + 'px',
            width: sizePx + 'px',
            transform: translateCenter
          }}
          onClick={ () => this.setState({selectedPzID: 'uranium'}) }
        ></button>
      </div>
    )
  }

  handleUranium() {
    let uraniumNew = this.state.uranium
    let userId = this.props.userId
    let launchId = this.props.launchId
    let offLimitsTimeSeconds = game.uranium.offLimitsTimeSeconds
    let timeNow = moment().tz('America/Los_Angeles')

    // only let the user pickup the urnaium if its free
    if(this.state.uranium.status === 'free') {
      // only let the user pickup the urnaium if the last time they touced it was X minutes ago
      firebase.database().ref('/users/' + userId + '/uranium/').once('value').then(function(snapshot) {
        let newNumOfPickups = snapshot.val().numOfPickups + 1
        if(timeNow.diff(moment(snapshot.val().timeLastPickup, 'kk:mm:ss'), 'seconds') > offLimitsTimeSeconds) {
          firebase.database().ref('/launches/' + launchId + '/uranium/').update({
            status: 'captured',
            userId: userId,
            pickedUp: timeNow.format('kk:mm:ss')
          }).then(function() {
            let handleTimeSeconds = timeNow.add(game.uranium.handleTimeSeconds, 's')
            firebase.database().ref('/users/' + userId + '/uranium/').update({
              timeLastPickup: handleTimeSeconds.format('kk:mm:ss'),
              numOfPickups: newNumOfPickups
            })
          })
        } else {
          showAlert('Too hot to hold!  You must wait ' + game.uranium.offLimitsTimeSeconds + ' minutes before picking up the uranium.', 'default', 8000);
        }
      })
    }
  }

  render(){
    // show info for selected Item
    let htmlSelectedPoint = null

    if (this.state.selectedPzID === 'uranium') {
      let htmlButton = (this.state.uranium.enabled && this.state.uranium.status === 'free') ? <button onClick={ () => this.handleUranium() }>Pick up Uranium</button> : ''
      htmlSelectedPoint =
        <div>
          {/*}<div>Status:{this.state.uranium.status}</div>*/}
          I am uranium. When standing above me, you can pick me up and carry me to the sqaure yellow bay in the bottom right corner of the map by She Metal.  You can only hold me for ten minutes. I will drop in the bay automatically.
          {htmlButton}
        </div>
    } else if (this.state.pzs && this.state.selectedPzID >= 0 ){
      let selectedPz = this.state.pzs[parseInt(this.state.selectedPzID)]
      htmlSelectedPoint =
        <div>
          <div>{selectedPz.name}</div>
          <div>Location: {selectedPz.mapPos.floor}</div>
          {/*<div>Status: {selectedPz.status}</div>
          <div>Players: {selectedPz.players}</div>*/}
        </div>
    } else if (this.state.selectedPzID === 'MK') {
      htmlSelectedPoint =
        <div>
          <div>mission kontrol</div>
        </div>
    } else if (this.state.selectedPzID === 'UB') {
      htmlSelectedPoint =
        <div>
          <div>uranium bay</div>
        </div>
    }

    let htmlMyLocation = (this.props.debug) ? <div>My location: {this.state.myGeoLoc.latitude}, {this.state.myGeoLoc.longitude}</div> : ''

    return(
      <div id='component-map' className='component-wrapper'>
        {/*}<button onClick={() => this.watchMyGeoLoc(true)}>ddebug geo loc</button>*/}
        {htmlMyLocation}
        <div className='map-wrapper'>
          {this.getMe()}
          {this.getPzs()}
          {this.getStaticLocs()}
          {this.getUraniumPos()}
        </div>
        <div id='selected-pz'>{htmlSelectedPoint}</div>
      </div>
    )
  }
}

const MapContainer = connect(
  mapStateToProps
)(Map)

export default MapContainer
