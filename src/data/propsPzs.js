const propsPzs = [
  {
    name: 'Pipes',
    title: 'Water Treatment Area',
    code: 'pz1',
    site: 'Water Treatment',
    maxPlayers: 7,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '50%',
      left: '50%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 10
    },
    desc: 'KN The Pipes in the water treatment system are out of control. Lets get the pipes in order so people can survive on their mission to Callisto.',
    instructions: 'KN/LX Enter the correct number that is listed below....................',
    rankMsg: [
      'Thank you! Leonardo Da Vinci once said, "Water is the driving force of all Nature" - Everyone is happy and will remember you for completing this valuable mission. Let us celebrate and drink to Water as we gaze over the solar system!',
      'You got a little dirty but you get to take a clean shower. You are ready to make some coffee and take on the next challenge.',
      'Dirty water everywhere, it is contaminated so bad that everyone is forced to evacuate and look for another ship. You are (Your team is) swimming along a sludge of muddy and disgusting discharge to safety.'
    ]
  },
  {
    name: 'Pz Two Jigsaw',
    title: 'Navigation system',
    code: 'pz2',
    site: 'Flight Deck',
    maxPlayers: 9,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '20%',
      left: '25%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 60
    },
    desc: 'The helm is having problems navigating to Callisto.  The navigation system is broken and could really use your help on our journey to Callisto',
    instructions: 'instructions....',
    rankMsg: [
      'good',
      'avg',
      'bad'
    ]
  },
  {
    name: 'Pz Three Soduko',
    title: 'title Kn',
    code: 'pz3',
    site: 'Electrical Room',
    maxPlayers: 9,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '70%',
      left: '80%'
    },
    rounds: {
      numOfRounds: 2,
      roundSec: 60
    },
    desc: 'The electrical room is the life vein of the spaceship. Something isn\'t wired right, let\'s see if we can get this power grid t work',
    instructions: 'instructions....',
    rankMsg: [
      'good',
      'avg',
      'bad'
    ]
  },
  {
    name: 'Pz Four Shape',
    title: 'Engine room',
	  code: 'pz4',
    site: 'w',
    maxPlayers: 6,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '10%',
      left: '20%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 60
    },
    desc: 'Time is running out, the tonitrus light speed hyperloop is charged up and ready to go. We need help figuring out what\'s wrong with the fuel cells in the engine room.',
    instructions: 'instructions....',
    rankMsg: [
      'good',
      'avg',
      'bad'
    ]
  },
  {
    name: 'Pz 5 Spots',
    title: 'title Kn',
    code: 'pz5',
    site: 'Living Quarters',
    maxPlayers: 6,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '20%',
      left: '10%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 60
    },
    desc: 'Everyone needs to sleep on the spaceship but there\'s a problem getting in to the living quarters. Solve the puzzle so the crew can get some rest.',
    instructions: 'instructions....',
    rankMsg: [
      'good',
      'avg',
      'bad'
    ]
  },
  {
    name: 'Pz 6 Volume',
    title: 'title Kn',
    code: 'pz6',
    site: 'The Bar',
    maxPlayers: 5,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '80%',
      left: '70%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 12
    },
    desc: 'Have a drink or two? With all this stress with the mission, it\'s time to relax and have a drink at the bar. Amidst all the chaos, you get too drunk and now you run into another issue. Let\'s figure this out before you get too trashed.',
    instructions: 'instructions....',
    rankMsg: [
      'good',
      'avg',
      'bad'
    ]
  },
  {
    name: 'Pz 7 Arm',
    title: 'title Kn',
    code: 'pz7',
    site: 'Mission Kontrol',
    maxPlayers: 6,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '40%',
      left: '30%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 600
    },
    desc: 'Welcome to Mission Kontrol. You need to get all the items from the warehouse into the spaceship as soon as possible. Let\'s begin.  ',
    instructions: 'instructions....',
    rankMsg: [
      'good',
      'avg',
      'bad'
    ]
  },
  {
    name: 'Pz 8 Frequency',
    title: 'title Kn',
    code: 'pz8',
    site: 'Communications Room',
    maxPlayers: 6,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '20%',
      left: '70%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 60
    },
    desc: 'You are in the radio room and found out that someone was tampering with it. Let\'s see if you can decipher the code and make sure our signals are working.',
    instructions: 'instructions....',
    rankMsg: [
      'good',
      'avg',
      'bad'
    ],
    alerts: {
      nextRoundDelaySec: 5
    }
  },
  {
    name: 'Pz 9 Controls',
    title: 'title Kn',
    code: 'pz9',
    site: 'Flight Deck',
    maxPlayers: 6,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '60%',
      left: '25%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 60
    },
    desc: 'The Flight deck needs your assistance. We need to power on all systems to launch the spaceship. Solve the puzzle.',
    instructions: 'instructions....',
    rankMsg: [
      'good',
      'avg',
      'bad'
    ]
  },
  {
    name: 'Pz 10 Code',
    title: 'title Kn',
    code: 'pz10',
    site: 'Diner',
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '30%',
      left: '90%'
    },
    rounds: {
      numOfRounds: 2,
      roundSec: 60
    },
    desc: 'It\'s time to eat and the automated space food service machine doesn\'t work. It looks like it\'s messing up your order.  Let\'s try to fix it',
    instructions: 'instructions....',
    rankMsg: [
      'good',
      'avg',
      'bad'
    ]
  }
]

export {
    propsPzs
}
