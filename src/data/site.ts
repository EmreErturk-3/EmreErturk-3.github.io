// Editable lists (interests, courses, scores, languages, education, hobbies) live in src/content/site.json.
import S from '../content/site.json';
export const interests: string[] = S.interests;
export const alsoInterested: string = S.alsoInterested;
export const hobbies: string[] = S.hobbies;
export const education = S.education;
export const courses = { relevant: S.coursesRelevant.map((c) => [c.code, c.name, c.grade]), current: S.coursesCurrent.map((c) => [c.code, c.name]) };
export const record = S.scores.map((x) => [x.value, x.label]);
export const languages = S.languages.map((l) => [l.name, l.level]);

export type Link = { label: string; href: string };
const gh = (r: string): Link[] => [{ label: 'GitHub', href: `https://github.com/EmreErturk-3/${r}` }];


export const papers = [
  {
    authors: 'O. Kansoy, <b>E. Ertürk</b> (equal contribution)',
    title: 'Smart Zebra: A Prompt-to-GRPO Recipe for Logic-Grid Reasoning in Small Language Models',
    venue: 'Manuscript in revision, 2026. B.Sc. thesis, advised by Assoc. Prof. Selma Tekir. Funded by TÜBİTAK 2209-A.',
    to: '/research/smart-zebra/',
    links: [{ label: 'PDF', href: '/docs/smart-zebra.pdf' }],
  },
  {
    authors: '<b>E. Ertürk</b>',
    title: 'AEASS v3: Revisiting an Adaptive Evolutionary Algorithm for Solving Sudokus',
    venue: 'Technical report, 2026. Revises and extends a CENG 482 Evolutionary Computation project (2025).',
    to: '/research/aeass/',
    links: [{ label: 'PDF', href: 'https://github.com/EmreErturk-3/aeass/blob/main/paper/AEASS_v3_paper.pdf' }, ...gh('aeass')],
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
    links: [{ label: 'PDF', href: '/docs/pcb-robot-paper.pdf' }],
  },
];

export const projects = [
  { name: 'EvoMaxx v10', when: '2026, ongoing', tags: ['Research', 'Artificial life'], text: 'A long-running research and creative project, now at v10: an artificial chemistry on the GPU in which the R, G and B of every pixel are three chemicals, wired by an evolving eight-gene network, and the world plays its own music. Its rule space was searched by controlled experiments on about 18,000 worlds, and twelve A-life papers it draws on are reproduced alongside it.', links: [{ label: 'Live', href: '/evomaxx/' }, ...gh('evomaxx')], to: '/research/evomaxx/' },
  { name: 'Slavemaker Swarm', when: '2026', tags: ['Research', 'Swarm'], text: 'An individual-based 3-D model of dulosis. Polyergus colonies scout, recruit along a raid trail and steal Formica brood, which ecloses as a slave workforce. Colony traits coevolve with no explicit fitness function.', links: [{ label: 'Live', href: '/slavemaker-swarm/' }, ...gh('slavemaker-swarm')], to: '/research/slavemaker/' },
  { name: 'AEASS v3', when: 'Fall 2026', tags: ['Research', 'Evolutionary computation'], text: 'A memetic algorithm for Sudoku: a GA with Lamarckian min-conflicts local search on logic-reduced domains. Every one of 65,201 verified runs over 52,458 benchmark puzzles was solved.', links: [{ label: 'Live', href: '/aeass/' }, ...gh('aeass')], to: '/research/aeass/' },
  { name: 'P.C.B delivery robot', when: 'Spring 2026', tags: ['Robotics'], text: 'A low-budget indoor robot built through three prototypes: Arduino Mega control, Jetson Nano mission logic, servo-scanned ultrasound, IMU-aided PID and ArUco landmarks.', links: [{ label: 'Videos', href: 'https://youtube.com/playlist?list=PLwDQJAClSxDNaZMpJzPJgvE02jZJuD9hk' }], to: '/robotics/#pcb' },
  { name: 'PartyBot', when: 'Spring 2026', tags: ['Robotics'], text: 'A gesture-controlled mecanum robot: a sensor glove talks to the robot over ESP-NOW between two ESP32 boards.', links: [], to: '/robotics/#partybot' },
  { name: 'Smart Zebra', when: '2025–26', tags: ['Research'], text: 'B.Sc. thesis with Onur Kansoy (equal contribution): an SFT-to-GRPO recipe that teaches a 3B language model to solve logic-grid puzzles, with an AC-3 constraint-propagation prompt.', links: [], to: '/research/smart-zebra/' },
  { name: 'Acil Okey', when: 'Spring 2025', tags: ['Apps'], text: 'A mobile app for finding players for an Okey game nearby. Human–Computer Interaction group project.', links: gh('AcilOkeyApp-master') },
  { name: 'AEASS v1', when: '2025', tags: ['Evolutionary computation'], text: 'The original course project: a GA with local search and population reset for Sudoku, the starting point that v3 revisits.', links: [{ label: 'v1', href: 'https://github.com/EmreErturk-3/aeass/tree/v1' }] },
  { name: 'Passport MRZ reader', when: 'Summer 2025', tags: ['Apps'], text: 'Reads and cleans the machine-readable zone of Turkish passports with Tesseract.', links: gh('passport-ocr') },
  { name: 'WhatsApp assistant', when: 'Summer 2025', tags: ['Apps'], text: 'A Turkish customer-service chatbot on WhatsApp, answering from a knowledge base with a local LLM.', links: gh('whatsapp-assistant-bot') },
];

// EvoMaxx's twelve A-life reproductions: [number, model, source, folder, animated]
export const REPRO = 'https://github.com/EmreErturk-3/evomaxx/tree/main/reproductions/';
export const plates = [
 ['01', 'Lenia', 'Chan 2019', '01_lenia_chan2019', true],
 ['02', 'Flow-Lenia', 'Plantec et al. 2023', '02_flow_lenia_plantec2023', true],
 ['03', 'Activator–inhibitor', 'Young 1984', '03_activator_inhibitor_young1984', false],
 ['04', 'Physarum networks', 'Jones 2010', '04_physarum_jones2010', true],
 ['05', 'Cyclic dominance', 'May & Leonard 1975', '05_cyclic_dominance_mayleonard1975', false],
 ['06', 'Kuramoto synchrony', 'Kuramoto 1975', '06_kuramoto1975', false],
 ['07', 'MAP-Elites', 'Mouret & Clune 2015', '07_map_elites_mouret2015', false],
 ['08', 'Phyllotaxis', 'Vogel 1979', '08_phyllotaxis_vogel1979', false],
 ['09', 'Euclidean rhythms', 'Toussaint 2005', '09_euclidean_rhythms_toussaint2005', false],
 ['10', 'Turing patterns', 'Gierer & Meinhardt 1972', '10_turing_gierer_meinhardt1972', false],
 ['11', 'Random Boolean networks', 'Kauffman 1969', '11_boolean_networks_kauffman1969', false],
 ['12', 'Edge of chaos', 'Langton 1990', '12_edge_of_chaos_langton1990', false],
] as const;

export const TRANSCRIPT = '/docs/emre-erturk-transcript.pdf';
