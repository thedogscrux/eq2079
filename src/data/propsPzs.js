const propsPzs = [
  {
    name: 'Pipes',
    title: 'Pipe Nightmare',
    code: 'sms',
    site: 'Water Treatment',
    maxPlayers: 7,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '14%',
      left: '9%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 60
    },
    desc: 'The Pipes in the water treatment system are out of control. Lets get the pipes in order so people can survive on their mission to Callisto.',
    instructions: 'You have three rounds to select pieces of pipe, and guess the correct code.',
    rankMsg: [
      'Thank you! Leonardo Da Vinci once said, "Water is the driving force of all Nature" - Everyone is happy and will remember you for completing this valuable mission. Let us celebrate and drink to Water as we gaze over the solar system!',
      'You got a little dirty but you get to take a clean shower. You are ready to make some coffee and take on the next challenge.',
      'Dirty water everywhere, it is contaminated so bad that everyone is forced to evacuate and look for another ship. You are swimming along a sludge of muddy and disgusting discharge to safety.'
    ]
  },
  {
    name: 'Pz Two Jigsaw',
    title: 'Jigsaw',
    code: 'oop',
    site: 'Flight Deck',
    maxPlayers: 9,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '17%',
      left: '28%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 60
    },
    desc: 'The helm is having problems navigating to Callisto.  The navigation system is broken and could really use your help on our journey to Callisto',
    instructions: 'Work together, or as team to put the puzzles together. Click each puzzle piece under the grid to add it, click your pieces in the grid to remove it.',
    rankMsg: [
      'You\'re a Genius! Now that we a have a clear picture of the map, the helm will find a faster route to Callisto!',
      'Great! You found the missing piece! Let\'s  move forward together.',
      'We\'re all completely lost. Looks like the AI is going to Callisto before us and the flight deck has their trajectory pointed towards the sun with the message, Good Luck ICARUS.'
    ]
  },
  {
    name: 'Pz Three Soduko',
    title: 'Mix and Match',
    code: 'rfid',
    site: 'Electrical Room',
    maxPlayers: 9,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '8%',
      left: '13%'
    },
    rounds: {
      numOfRounds: 2,
      roundSec: 60
    },
    desc: 'The electrical room is the life vein of the spaceship. Something isn\'t wired right, let\'s see if we can get this power grid t work',
    instructions: 'You must arrange your pieces so each row and colum has one of each shape.',
    rankMsg: [
      'Excellent! You are seeing old photos and  videos of her courageous life before and during the war through a MAV-Sonar NFC scan.',
      'You did alright, might have taken you some work but not a scratch on the screen, that is pretty impressive for something so delicate from 62 years ago. You look at some interesting photos.',
      'Terrible, since you did not put it in storage, that phone was lost and later destroyed by TETRAS. All the memories are gone since there is no back up. You silently sit in despair.'
    ]
  },
  {
    name: 'Pz Four Shape',
    title: 'Shape it Up',
	  code: 'asimo',
    site: 'Engine Room',
    maxPlayers: 6,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '57%',
      left: '70%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 60
    },
    desc: 'Time is running out, the tonitrus light speed hyperloop is charged up and ready to go. We need help figuring out what\'s wrong with the fuel cells in the engine room.',
    instructions: 'Arrange your bars to match the shape found on the wall.',
    rankMsg: [
      'Alright It is a party, lettuce turnip the beet! Everybody is excited and you are going to be the first one to make wine for everyone.',
      'You have some bad apples but you are not a quitter. You managed to grow a small garden in the process.',
      'It is all rotten vegetables and now there is no more food in space. Everyone knows you messed up and they are starting to growl at you because they have eaten in weeks.'
    ]
  },
  {
    name: 'Pz 5 Spots',
    title: 'Infrared plus Ultraviolet Equals?',
    code: 'rgba',
    site: 'Living Quarters',
    maxPlayers: 6,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '15%',
      left: '87%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 60
    },
    desc: 'Everyone needs to sleep on the spaceship but there\'s a problem getting in to the living quarters. Solve the puzzle so the crew can get some rest.',
    instructions: 'Everyone is assigned a primary color.  Use your knowledge of the color wheel to create the pattern. If you are playing as single player, just get your color on the dots they belong to and ignore the other colors.',
    rankMsg: [
      'Flawless! You might be smarter than Einstein and Hawking combined.  People will now become smarter because of your contribution.',
      'Einstein would be happy that you passed the test.  Experience is simply the name we give our mistakes.',
      'You might be allergic to Science or a bad chemistry joke because there is no reaction. The science lab is completely uses now, the spaceship is on fire and people do not know if you should use water to put it out or just stare into the abyss.'
    ]
  },
  {
    name: 'Pz 6 Volume',
    title: 'A Pour Over',
    code: 'foss',
    site: 'The Bar',
    maxPlayers: 5,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '30%',
      left: '65%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 12
    },
    desc: 'Have a drink or two? With all this stress with the mission, it\'s time to relax and have a drink at the bar. ',
    instructions: 'Fill your vial up to the right number to reach the goal.  If you are playing with others, things get crazy after the first round.',
    rankMsg: [
      'To the Stars! Everyone down at mission kontrol celebrates with a bottle of champagne in their hand and gives you a toast as the ship prepares for Callisto',
      'The flight was delayed but everyone feels good about their journey to Callisto.',
      'Everything shuts down, lights fade out and all you hear is a robotic voice say "Look at me, I am the Captain now". It looks like the Nuvosem Q8\'s have taken over the command deck, you see people jump out of the spaceship in horror.'
    ]
  },
  {
    name: 'Pz 7 Arm',
    title: 'Moving Time',
    code: 'gwbasic',
    site: 'Mission Kontrol',
    maxPlayers: 6,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '80%',
      left: '72%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 600
    },
    desc: 'Welcome to Mission Kontrol. You need to get all the items from the warehouse into the spaceship as soon as possible. Let\'s begin.  ',
    instructions: 'Bring the right colored dot to the sqaure bay.',
    rankMsg: [
      'Good Morning! You wake up can almost see Callisto from your terminal.  Everybody else on the ship is feeling great and happy to get a good night rest.',
      'Good afternoon, looks like you did not get as much rest as you wanted but you manage brunch and will try to move forward.',
      'You are having a nightmare or is it a reality? You have not been able to sleep since the AI locked everyone out and kept playing loud music at 110 decibels and 200 beats per minute while shaking the spaceship to torture you with sleep deprivation.'
    ]
  },
  {
    name: 'Pz 8 Frequency',
    title: 'Come in Eq',
    code: 'nan',
    site: 'Communications Room',
    maxPlayers: 6,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '68%',
      left: '70%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 60
    },
    desc: 'You are in the radio room and found out that someone was tampering with it. Let\'s see if you can decipher the code and make sure our signals are working.',
    instructions: 'Work together, or alone, to find the message in the noise. Move your slider to change frequency and watch the noise come in. Warning: unfortunately, the control for this doe not display on every device.',
    rankMsg: [
      'Dinner was delicious. It is amazing that pizza in the future comes in 17,852 different varieties and takes 5 seconds. The hyper genome chef even made a surprise Gelato that you never knew you would like.',
      'Dinner was good. Your favorite pizza was  one the menu and it took less minute.',
      'The Kitchen is on fire and the emergency fire system has locked all the food until it can be fixed. The soldiers are hungry and they look at you in disgust as they exit the ship in anger.'
    ],
    alerts: {
      nextRoundDelaySec: 5
    }
  },
  {
    name: 'Pz 9 Controls',
    title: 'Which Button Again?',
    code: 'oom',
    site: 'Flight Deck',
    maxPlayers: 6,
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '22%',
      left: '66%'
    },
    rounds: {
      numOfRounds: 3,
      roundSec: 60
    },
    desc: 'The Flight deck needs your assistance. We need to power on all systems to launch the spaceship. Solve the puzzle.',
    instructions: 'Turn on all the switches.  If playing with others, your switches affect theirs.',
    rankMsg: [
      'It is like a space dream, all the colorful lights are beaming across the horizon in your in an euphoric trance as you get ready to launch',
      'Everything Looks good, the lights flicker a bit and your personal items are charging at 2% but you know things will be alright.',
      'You hear screaming from a distance and you can not see anything cause there is no light. The back-up system is not working either and the AI must have tinted all the windows to complete darkness. You stumble across other people as you try to open any emergency door pad and panic as you crawl against the walls of the spaceship.'
    ]
  },
  {
    name: 'Pz 10 Code',
    title: 'Do the Keyboard',
    code: 'onegl',
    site: 'Diner',
    location: {
      lat: 0,
      long: 0
    },
    mapPos: {
      floor: 'ground',
      bottom: '50%',
      left: '17%'
    },
    rounds: {
      numOfRounds: 2,
      roundSec: 60
    },
    desc: 'It\'s time to eat and the automated space food service machine doesn\'t work. It looks like it\'s messing up your order.  Let\'s try to fix it',
    instructions: 'Unscramble the encrypted messaged.  If playing with others, everyone gets a slide of teh alphabet to contribute.',
    rankMsg: [
      'Perfect! You are ready to move on, it should take less than 3 days to get to get to Callisto.',
      'Not Bad! It looks like you needed some help but you managed to get it done',
      'You Failed and the combustion caused you to lose a lung but you can still go on, barely. The TETRAS will to have complete the job.'
    ]
  }
]

export {
    propsPzs
}
