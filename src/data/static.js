const staticStory = [
  [
    'good: We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard...',
    'med: We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard...',
    'bad: We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard...'
  ],
  [
    'good: ..because that goal will serve to organize and measure the best of our energies and skills...',
    'med: ..because that goal will serve to organize and measure the best of our energies and skills...',
    'bad: ..because that goal will serve to organize and measure the best of our energies and skills...'
  ],
  [
    'good: ..because that challenge is one that we are willing to accept, one we are unwilling to postpone, and one which we intend to win.',
    'med: ..because that challenge is one that we are willing to accept, one we are unwilling to postpone, and one which we intend to win.',
    'bad: ..because that challenge is one that we are willing to accept, one we are unwilling to postpone, and one which we intend to win.'
  ],
  [
    'good: ..because that challenge is one that we are willing to accept, one we are unwilling to postpone, and one which we intend to win.',
    'med: ..because that challenge is one that we are willing to accept, one we are unwilling to postpone, and one which we intend to win.',
    'bad: ..because that challenge is one that we are willing to accept, one we are unwilling to postpone, and one which we intend to win.'
  ]
]

const staticLocMK = {
  name: 'Mission Kontrol',
  location: {
    lat: 0,
    long: 0
  },
  mapPos: {
    floor: 'ground',
    top: '0px',
    left: '0px'
  },
  state: 'inactive',
  yourStatus: 'new',
  attempts: 0,
  score: 0
}

const staticUsers = [
  {
    name: 'jack',
    job: 'engineer',
    status: 'active',
    timeLastCheckin: '00:00:00',
    ip: '000.000.000.00',
    agent: 'ios',
    loc: {
      lat: 0,
      long: 0
    },
    pzs: [
      {
        name: 'pz1',
        attempts: 0,
        score: 1
      },
      {
        name: 'pz2',
        attempts: 0,
        score: 2
      },
      {
        name: 'pz3',
        attempts: 0,
        score: 1
      }
    ]
  },

  {
    name: 'crack',
    job: 'engineer',
    status: 'inactive',
    timeLastCheckin: '00:00:00',
    ip: '000.000.000.00',
    agent: 'ios',
    loc: {
      lat: 0,
      long: 0
    },
    pzs: [
      {
        name: 'pz1',
        attempts: 0,
        score: 1
      },
      {
        name: 'pz2',
        attempts: 0,
        score: 1
      },
      {
        name: 'pz3',
        attempts: 0,
        score: 0
      }
    ]
  },

  {
    name: 'mary',
    job: 'engineer',
    status: 'active',
    timeLastCheckin: '00:00:00',
    ip: '000.000.000.00',
    agent: 'ios',
    loc: {
      lat: 0,
      long: 0
    },
    pzs: [
      {
        name: 'pz1',
        attempts: 0,
        score: 2
      },
      {
        name: 'pz2',
        attempts: 0,
        score: 3
      },
      {
        name: 'pz3',
        attempts: 0,
        score: 1
      }
    ]
  }

]

const staticPzs = [
  {
    name: 'Pz One',
    players: 2,
    status: 'loading',
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      top: '50%',
      left: '50%'
    },
    timeGameStarts: '00:00:00',
    timeGameEnds: '00:00:00',
    timeNextRound: '00:00:00',
    round: 0,
    totalPlays: 0,
    totalPlayers: 0
  },
  {
    name: 'Pz Three',
    players: 8,
    status: 'inProgress',
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      top: '40%',
      left: '25%'
    },
    timeGameStarts: '00:00:00',
    timeGameEnds: '00:00:00',
    timeNextRound: '00:00:00',
    round: 0,
    totalPlays: 0,
    totalPlayers: 0
  },
  {
    name: 'Pz Two',
    players: 0,
    status: 'inactive',
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      top: '70%',
      left: '80%'
    },
    timeGameStarts: '00:00:00',
    timeGameEnds: '00:00:00',
    timeNextRound: '00:00:00',
    round: 0,
    totalPlays: 0,
    totalPlayers: 0
  }
]

const staticLaunches = [
  {
      start: '00:00:00',
      end: '00:00:00',
      players: 2,
      totalScore: 0,
      totalGamePlays: 0,
      status: 'inactive'
  },
  {
      start: '00:00:00',
      end: '00:00:00',
      players: 0,
      totalScore: 0,
      totalGamePlays: 0,
      status: 'active'
  },
  {
      start: '00:00:00',
      end: '00:00:00',
      players: 6,
      totalScore: 0,
      totalGamePlays: 0,
      status: 'inactive'
  }
]

export {
  staticLocMK,
  staticStory,
  staticPzs,
  staticLaunches,
  staticUsers
}
