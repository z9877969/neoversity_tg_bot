const types = require('../constants/types');

const getMissingUserDataFields = (userData) => {
  const missingUserData = Object.entries(userData)
    .reduce((acc, [key, value]) => {
      if (!value && types.registartionStages[key]) {
        const stageData = types.registartionStages[key];
        acc[stageData.step] = { stage: stageData.value, field: key };
      }
      return acc;
    }, [])
    .filter(Boolean);
  return missingUserData;
};

module.exports = getMissingUserDataFields;
