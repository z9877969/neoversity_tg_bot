const { directions } = require('./index');
const { createStreamsButtons } = require('../utils');

const streamsDict = {
  Software: createStreamsButtons(directions.Software.value),
  Data: createStreamsButtons(directions.Data.value),
  Cybersecurity: createStreamsButtons(directions.Cybersecurity.value),
  Interaction: createStreamsButtons(directions.Interaction.value),
  AI_ML: createStreamsButtons(directions.AI_ML.value),
  SE_AI: createStreamsButtons(directions.SE_AI.value),
  CB_AI: createStreamsButtons(directions.CB_AI.value),
  AI_PM: createStreamsButtons(directions.AI_PM.value),
};

module.exports = streamsDict;
