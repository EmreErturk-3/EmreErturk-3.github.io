export type Link = { label: string; href: string };
const gh = (r: string): Link[] => [{ label: 'GitHub', href: `https://github.com/EmreErturk-3/${r}` }];

export const interests = [
  'Evolutionary computation',
  'Artificial life',
  'Swarm robotics',
  'Evolutionary robotics',
  'Morphogenetic robotics',
  'Simulation and computer graphics',
];

export const papers = [
  {
    authors: '<b>E. Ertürk</b>',
    title: 'AEASS v3: Revisiting an Adaptive Evolutionary Algorithm for Solving Sudokus',
    venue: 'Technical report, 2026. Extends a CENG 482 Evolutionary Computation project (2025).',
    to: '/research/aeass/',
    links: [{ label: 'PDF', href: 'https://github.com/EmreErturk-3/aeass/blob/main/paper/AEASS_v3_paper.pdf' }, ...gh('aeass')],
  },
  {
    authors: 'O. Kansoy, <b>E. Ertürk</b> (equal contribution)',
    title: 'Smart Zebra: A Prompt-to-GRPO Recipe for Logic-Grid Reasoning in Small Language Models',
    venue: 'Manuscript in revision, 2026. B.Sc. thesis, advised by Assoc. Prof. Selma Tekir. Funded by TÜBİTAK 2209-A.',
    to: '/research/smart-zebra/',
    links: [],
  },
  {
    authors: '<b>E. Ertürk</b>',
    title: 'Slavemaker Swarm: an individual-based simulation of Polyergus slave raids on Formica colonies',
    venue: 'Project report v0.2, 2026.',
    to: '/research/slavemaker/',
    links: [{ label: 'Report', href: 'https://github.com/EmreErturk-3/slavemaker-swarm/blob/main/docs/REPORT.md' }, ...gh('slavemaker-swarm')],
  },
  {
    authors: 'H. N. Kömürcü, D. Karabacak, <b>E. Ertürk</b>, T. İyiarı',
    title: 'An Indoor Mobile Robot (P.C.B) for Corridor Navigation and Secure Delivery Using IMU-Aided Control and ArUco Landmarks',
    venue: 'CENG 483 course paper, 2026.',
    to: '/robotics/#pcb',
    links: [{ label: 'PDF', href: 'https://github.com/EmreErturk-3/robotics/blob/main/pcb-delivery-robot/report.pdf' }],
  },
];

export const projects = [
  { name: 'EvoMaxx', when: 'Nov 2026', tags: ['Research', 'Artificial life'], text: 'An artificial chemistry on the GPU: the R, G and B of every pixel are three chemicals, wired by an evolving eight-gene network. Its rule space was searched by controlled experiments on about 18,000 worlds, and twelve A-life papers it draws on are reproduced alongside it.', links: [{ label: 'Live', href: '/evomaxx/' }, ...gh('evomaxx')], to: '/research/evomaxx/' },
  { name: 'Slavemaker Swarm', when: 'Nov 2026', tags: ['Research', 'Swarm'], text: 'An individual-based 3-D model of dulosis. Polyergus colonies scout, recruit along a raid trail and steal Formica brood, which ecloses as a slave workforce. Colony traits coevolve with no explicit fitness function.', links: [{ label: 'Live', href: '/slavemaker-swarm/' }, ...gh('slavemaker-swarm')], to: '/research/slavemaker/' },
  { name: 'AEASS v3', when: 'Nov 2026', tags: ['Research', 'Evolutionary computation'], text: 'A memetic algorithm for Sudoku: a GA with Lamarckian min-conflicts local search on logic-reduced domains. Every one of 65,201 verified runs over 52,458 benchmark puzzles was solved.', links: [{ label: 'Live', href: '/aeass/' }, ...gh('aeass')], to: '/research/aeass/' },
  { name: 'Swarm and EC reproductions', when: 'Nov 2026', tags: ['Research', 'Swarm'], text: 'Classic papers re-implemented from the text and run again: BEECLUST aggregation with simulated Kilobots in ARGoS, the Vicsek ordering transition, NEAT on XOR and Gray–Scott patterns.', links: gh('swarm-reproductions'), to: '/research/#reproductions' },
  { name: 'P.C.B delivery robot', when: 'Jun 2026', tags: ['Robotics'], text: 'A low-budget indoor robot built through three prototypes: Arduino Mega control, Jetson Nano mission logic, servo-scanned ultrasound, IMU-aided PID and ArUco landmarks.', links: [{ label: 'Videos', href: 'https://youtube.com/playlist?list=PLwDQJAClSxDNaZMpJzPJgvE02jZJuD9hk' }, ...gh('robotics')], to: '/robotics/#pcb' },
  { name: 'PartyBot', when: 'Jun 2026', tags: ['Robotics'], text: 'A gesture-controlled mecanum robot: a sensor glove talks to the robot over ESP-NOW between two ESP32 boards.', links: gh('robotics'), to: '/robotics/#partybot' },
  { name: 'Smart Zebra', when: 'May 2026', tags: ['Research'], text: 'B.Sc. thesis with Onur Kansoy (equal contribution): an SFT-to-GRPO recipe that teaches a 3B language model to solve logic-grid puzzles, with an AC-3 constraint-propagation prompt.', links: [], to: '/research/smart-zebra/' },
  { name: 'Acil Okey', when: 'Jun 2025', tags: ['Apps'], text: 'A mobile app for finding players for an Okey game nearby. Human–Computer Interaction group project.', links: gh('AcilOkeyApp-master') },
  { name: 'AEASS v1', when: 'Jan 2025', tags: ['Evolutionary computation'], text: 'The original course project: a GA with local search and population reset for Sudoku, the starting point that v3 revisits.', links: [{ label: 'v1', href: 'https://github.com/EmreErturk-3/aeass/tree/v1' }] },
  { name: 'Passport MRZ reader', when: 'Aug 2025', tags: ['Apps'], text: 'Reads and cleans the machine-readable zone of Turkish passports with Tesseract.', links: gh('passport-ocr') },
  { name: 'WhatsApp assistant', when: 'Aug 2025', tags: ['Apps'], text: 'A Turkish customer-service chatbot on WhatsApp, answering from a knowledge base with a local LLM.', links: gh('whatsapp-assistant-bot') },
];
