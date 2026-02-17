const { directions } = require('./index');
const { createStreamsButtons } = require('../utils');

const streamsDict = {
  MCS: createStreamsButtons(directions.MCS.value),
  MDS: createStreamsButtons(directions.MDS.value),
  MCbS: createStreamsButtons(directions.MCbS.value),
  MCHD: createStreamsButtons(directions.MCHD.value),
  AI_ML: createStreamsButtons(directions.AI_ML.value),
  SE_AI: createStreamsButtons(directions.SE_AI.value),
  CB_AI: createStreamsButtons(directions.CB_AI.value),
  AI_PM: createStreamsButtons(directions.AI_PM.value),
};

module.exports = streamsDict;
