const dbUserDataFields = {
  FULL_NAME: 'full_name',
  EMAIL: 'email',
  DIRECTION: 'direction',
  STREAM: 'stream',
};

const registartionSteps = {
  1: dbUserDataFields.FULL_NAME,
  2: dbUserDataFields.EMAIL,
  3: dbUserDataFields.DIRECTION,
  4: dbUserDataFields.STREAM,
};

const registartionStages = {
  [dbUserDataFields.FULL_NAME]: {
    step: 1,
    value: 'waiting_for_name',
  },
  [dbUserDataFields.EMAIL]: {
    step: 2,
    value: 'waiting_for_email',
  },
  [dbUserDataFields.DIRECTION]: {
    step: 3,
    value: 'waiting_for_direction',
  },
  [dbUserDataFields.STREAM]: {
    step: 4,
    value: 'waiting_for_stream',
  },
};

const callbackTypes = {
  [dbUserDataFields.DIRECTION]:
    registartionStages[dbUserDataFields.DIRECTION].value,
  [dbUserDataFields.STREAM]: registartionStages[dbUserDataFields.STREAM].value,
};

const messageTypes = {
  [dbUserDataFields.FULL_NAME]:
    registartionStages[dbUserDataFields.FULL_NAME].value,
  [dbUserDataFields.EMAIL]: registartionStages[dbUserDataFields.EMAIL].value,
};

const registrationResults = {
  COMPLETED: 'completed',
  NOT_COMPLETED: 'not_completed',
  NOT_REGISTERED: 'not_registered',
};

module.exports = {
  dbUserDataFields,
  registartionStages,
  registartionSteps,
  callbackTypes,
  messageTypes,
  registrationResults,
};
