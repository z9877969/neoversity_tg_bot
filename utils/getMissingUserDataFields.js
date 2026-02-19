const types = require('../constants/types');

/**
 * Перевіряє, які поля користувача не заповнені, і повертає інформацію про перше незаповнене поле.
 * @param {Object} userData - Дані користувача з БД
 * @returns {Array} [{stage, field}] - Масив об'єктів з інформацією про незаповнені поля 
 * та відповідні впорядковані етапи реєстрації
 */

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
