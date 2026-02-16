const dirrections = {
  Software: {
    name: 'Software Engineering',
    value: 'Software',
    shortcut: 'MCS',
    streamsNum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  Data: {
    name: 'Data Science and Data Analytics',
    value: 'Data',
    shortcut: 'MDS',
    streamsNum: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  Cybersecurity: {
    name: 'Cybersecurity',
    value: 'Cybersecurity',
    shortcut: 'MCbS',
    streamsNum: [1, 2, 3, 4, 5, 6],
  },
  Interaction: {
    name: 'Human-Computer Interaction and Design',
    value: 'Interaction',
    shortcut: 'MCHD',
    streamsNum: [1, 2, 3, 4],
  },
  AI_ML: {
    name: 'Artificial Intelligence and Machine Learning',
    value: 'AI_ML',
    shortcut: 'AI&ML',
    streamsNum: [1, 2, 3, 4],
  },
  SE_AI: {
    name: 'Software Engineering and Artificial Intelligence',
    value: 'SE_AI',
    shortcut: 'SE&AI',
    streamsNum: [1, 2, 3],
  },
  CB_AI: {
    name: 'Cybersecurity and Artificial Intelligence',
    value: 'CB_AI',
    shortcut: 'CB&AI',
    streamsNum: [1, 2, 3],
  },
  AI_PM: {
    name: 'Artificial Intelligence Product Management',
    value: 'AI_PM',
    shortcut: 'AI&PM',
    streamsNum: [1, 2],
  },
};

for (const dirKey in dirrections) {
  const dirrection = dirrections[dirKey];

  dirrection.streams = dirrection.streamsNum.map(
    (num) => `${dirrection.value}_${num}`,
  );
}

module.exports = dirrections;
