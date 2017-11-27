const staticStory = [
  [
    'Intro story everyone sees goes here....'
  ],
  [
    'Perfect! You\'re off to a good start. At this rate you\'ll be the in Callisto within a blink of an eye. Let\'s move on and see what else needs to be fixed.',
    'Looks good. Things will get more challenging so let\'s hope you can fix them as soon as possible. Let\'s move on and see what\'s out there.',
    'You Died. Well...not competely. They mistaken your name (team) for another individual (group). I think Callisto might be better if you stayed on Earth. You\'ll get another chance but it\'s going to be difficult at this rate, let\'s see if you\'re up for the next challenge!?'
  ],
  [
    'Excellent! You are seeing old photos and  videos of her courageous life before and during the war through a MAV-Sonar NFC scan.',
    'You did alright, might have taken you some work but not a scratch on the screen, that is pretty impressive for something so delicate from 62 years ago. You look at some interesting photos.',
    'Terrible, since you did not put it in storage, that phone was lost and later destroyed by TETRAS. All the memories are gone since there is no back up. You silently sit in despair.'
  ],
  [
    'Thank you! Leonardo Da Vinci once said, "Water is the driving force of all Nature" - Everyone is happy and will remember you for completing this valuable mission. Let us celebrate and drink to Water as we gaze over the solar system!',
    'You got a little dirty but you get to take a clean shower. You are ready to make some coffee and take on the next challenge.',
    'Dirty water everywhere, it is contaminated so bad that everyone is forced to evacuate and look for another ship. You are (Your team is) swimming along a sludge of muddy and disgusting discharge to safety.'
  ],
  [
    'Alright It is a party, lettuce turnip the beet! Everybody is excited and you are going to be the first one to make wine for everyone.',
    'You have some bad apples but you are not a quitter. You managed to grow a small garden in the process.',
    'It is all rotten vegetables and now there is no more food in space. Everyone knows you (your team) messed up and they are starting to growl at you because they have eaten in weeks.'
  ],
  [
    'Flawless! You might be smarter than Einstein and Hawking combined.  People will now become smarter because of your contribution.',
    'Einstein would be happy that you passed the test.  Experience is simply the name we give our mistakes.',
    'You might be allergic to Science or a bad chemistry joke because there is no reaction. The science lab is completely uses now, the spaceship is on fire and people do not know if you should use water to put it out or just stare into the abyss.'
  ],
  [
    'To the Stars! Everyone down at mission kontrol celebrates with a bottle of champagne in their hand and gives you (your team) a toast as the ship prepares for Callisto.',
    'The flight was delayed but everyone feels good about their journey to Callisto.',
    'Everything shuts down, lights fade out and all you hear is a robotic voice say "Look at me, I am the Captain now". It looks like the Nuvosem Q8\'s have taken over the command deck, you see people jump out of the spaceship in horror.'
  ],
  [
    'Good Morning! You wake up can almost see Callisto from your terminal.  Everybody else on the ship is feeling great and happy to get a good night rest.',
    'Good afternoon, looks like you did not get as much rest as you wanted but you manage brunch and will try to move forward.',
    'You are having a nightmare or is it a reality? You have not been able to sleep since the AI locked everyone out and kept playing loud music at 110 decibels and 200 beats per minute while shaking the spaceship to torture you with sleep deprivation.'
  ],
  [
    'Dinner was delicious. It is amazing that pizza in the future comes in 17,852 different varieties and takes 5 seconds. The hyper genome chef even made a surprise Gelato that you never knew you would like. ',
    'Dinner was good. Your favorite pizza was  one the menu and it took less minute.',
    'The Kitchen is on fire and the emergency fire system has locked all the food until it can be fixed. The soldiers are hungry and they look at you in disgust as they exit the ship in anger.'
  ],
  [
    'It is like a space dream, all the colorful lights are beaming across the horizon in your in an euphoric trance as you get ready to launch.',
    'Everything Looks good, the lights flicker a bit and your personal items are charging at 2% but you know things will be alright.',
    'You hear screaming from a distance and you can not see anything cause there is no light. The back-up system is not working either and the AI must have tinted all the windows to complete darkness. You stumble across other people as you try to open any emergency door pad and panic as you crawl against the walls of the spaceship.'
  ],
  [
    'Perfect! You are (Your team is) ready to move on, it should take less than 3 days to get to get to Callisto.',
    'Not Bad! It looks like you needed some help but you managed to get it done.',
    'You Failed and the combustion caused you to lose a lung but you can still go on, barely. The TETRAS will to have complete the job.'
  ],
  [
    'You are a genius! The radio will now be able to transmit private data that will help navigate the ship and other valuable information from Mission Kontrol. You also find out a crucial secret that the Mission to Callisto is actually a secret mission to Europa. The secret was kept hidden because they knew the AI might try to invade Callisto during the escape. Your first destination will be Callisto but you will be on a private route to Europa soon after.',
    'You barely made it but luckily you found out that the AI was trying to follow you but now they will have no idea of your location. You will be heading to Callisto soon.',
    'Looks like the AI intercepted your signal and now you lost your signal back to Mission Kontrol.   They will now follow you to Callisto and hunt you down.  You (your team) panic as your spaceship floats into the abyss.'
  ],
  [
    'Cheers! You got this. You decide to invite everyone over to the bar and do a little pre-funk as everyone on the ship looks to each other in confidence.',
    'So you had a little too much to drink but you are totally fine. You get a call from Mission Kontrol and they try to get you back on track as you stumble around the hallway.',
    'You are so drunk that you fell out of the ship. You are at the hospital and trying to figure out......... to be continued'
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
