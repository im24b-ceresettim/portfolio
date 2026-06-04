export const portfolioData = {
  name: 'Matteo Ceresetti',
  role: 'Informatiker EFZ Applikationsentwicklung (Lehrstart August 2027)',
  headline:
    'Ich besuche aktuell das zweite Jahr an der KSH Hottingen und suche eine Lehrstelle als Informatiker EFZ Applikationsentwicklung mit Start im August 2027. Ich arbeite strukturiert, zuverlässig und mit hoher Motivation, meine Fähigkeiten in einem professionellen Umfeld weiterzuentwickeln.',
  about:
    'Meine schulischen Schwerpunkte liegen in Informatik, Mathematik, Englisch, Französisch sowie Technik und Umwelt. Ich habe SCRUM-Grundlagen gelernt, arbeite effizient mit KI-Tools und bringe Teamgeist, Ruhe und Entschlossenheit mit. In meiner Freizeit spiele ich Fussball und trainiere Karate (blauer Gurt).',
  phone: '078 247 44 53',
  email: 'mat.cerelappo@gmail.com',
  github: 'https://github.com/im24b-ceresettim',
  profileImage: '/myimage.jpeg',
  languages: [
    { name: 'Italienisch', level: 'C2 (Diplom: B2)', flag: 'it' },
    { name: 'Deutsch', level: 'B2', flag: 'de' },
    { name: 'Englisch', level: 'B2', flag: 'gb' },
    { name: 'Französisch', level: 'B1', flag: 'fr' },
    { name: 'Spanisch', level: 'A2', flag: 'es' },
  ], 
  techSkills: {
    frontend: [
      { name: 'JavaScript', icon: 'js' },
      { name: 'Next.js', icon: 'nextjs' },
      { name: 'React', icon: 'react' },
      { name: 'Tailwind', icon: 'tailwind' },
    ],
    backend: [
      { name: 'Python', icon: 'python' },
      { name: 'Java', icon: 'java' },
      { name: 'Spring', icon: 'spring' },
      { name: 'Node.js', icon: 'nodejs' },
    ],
    database: [
      { name: 'MySQL', icon: 'mysql' },
      { name: 'Postgre', icon: 'postgres' },
      { name: 'Docker', icon: 'docker' },
      { name: 'AWS', icon: 'aws' },
    ],
  },
};

export const projects = [
  {
    title: 'SBB-Lore',
    description:
      'Gruppenprojekt mit zwei Mitschülern über die Geschichte der Schweiz. Die Anwendung präsentiert Inhalte interaktiv und strukturiert in einer klaren Weboberfläche.',
    stack: 'JavaScript, HTML, CSS, Leaflet',
    gh: 'https://github.com/IM23a-braendlim/SBB_Lore',
    url: 'https://sbb-lore.vercel.app/',
  },
  {
    title: 'Java WouldYouRather-Spiel',
    description:
      'Kleines Java-Projekt zur Übung von Logik, Struktur und sauberer Umsetzung einer interaktiven Spielidee.',
    stack: 'Java',
    gh: 'https://github.com/im24b-antonyd/would-you-rather',
    url: '#',
  },
];
