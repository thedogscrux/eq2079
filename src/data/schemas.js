const schemaLaunch = {
    start: '00:00:00',
    end: '00:00:00',
    players: 0,
    totalScore: 0,
    totalGamePlays: 0,
    status: 'active|complete',
    uranium: {
      status: 'free',
      userId: '',
      pickedUp: '00:00:00',
      mapPos: {
        bottom: 90,
        left: 50
      }
    }
}

const schemaUser = {
  name: '',
  job: 'engineer|scientist',
  status: 'active|offline|complete',
  launchId: '',
  timeLastCheckin: '00:00:00',
  ip: '000.000.000.00',
  agent: '',
  chapter: 0,
  location: {
    latitude: 0,
    longitude: 0
  },
  pathUpdated: '00:00:00',
  paths: [
    {
      time: '00:00:00',
      latitude: 0,
      longitude: 0
    }
  ],
  pzs: [
    {
      name: '',
      attempts: 0,
      score: 0.00,
      lastAttempt: '00:00:00'
    }
  ],
  uranium: {
    numOfPickups: 0,
    timeLastPickup: '00:00:00'
  }
}

const schemaPz = {
  name: '',
  players: [],
  status: 'inactive|loading|active',
  location: {
    lat: 0,
    long: 0
  },
  mapPos: {
    floor: 'ground',
    top: '0%',
    left: '0%'
  },
  timeGameStarts: '00:00:00',
  timeGameEnds: '00:00:00',
  timeNextRound: '00:00:00',
  rounds: {
    numOfRounds: 0,
    roundSec: 0
  },
  totalPlays: 0,
  totalPlayers: 0
}

export {
  schemaLaunch,
  schemaUser,
  schemaPz
}
