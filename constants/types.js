const dbUserDataFields = {
  FULL_NAME: 'full_name',
  EMAIL: 'email',
  DIRECTION: 'direction',
  STREAM: 'stream',
};

const registartionTypes = {
  WAITING_FOR_NAME: 'waiting_for_name',
  WAITING_FOR_EMAIL: 'waiting_for_email',
  WAITING_FOR_DIRECTION: 'waiting_for_direction',
  WAITING_FOR_STREAM: 'waiting_for_stream',
};

const registartionStages = {
  [dbUserDataFields.FULL_NAME]: {
    step: 1,
    value: registartionTypes.WAITING_FOR_NAME,
  },
  [dbUserDataFields.EMAIL]: {
    step: 2,
    value: registartionTypes.WAITING_FOR_EMAIL,
  },
  [dbUserDataFields.DIRECTION]: {
    step: 3,
    value: registartionTypes.WAITING_FOR_DIRECTION,
  },
  [dbUserDataFields.STREAM]: {
    step: 4,
    value: registartionTypes.WAITING_FOR_STREAM,
  },
};

const callbackTypes = {
  [dbUserDataFields.DIRECTION]: registartionTypes.WAITING_FOR_DIRECTION,
  [dbUserDataFields.STREAM]: registartionTypes.WAITING_FOR_STREAM,
};

const messageTypes = {
  [dbUserDataFields.FULL_NAME]: registartionTypes.WAITING_FOR_NAME,
  [dbUserDataFields.EMAIL]: registartionTypes.WAITING_FOR_EMAIL,
};

const registrationResults = {
  COMPLETED: 'completed',
  NOT_COMPLETED: 'not_completed',
  NOT_REGISTERED: 'not_registered',
};

module.exports = {
  dbUserDataFields,
  registartionStages,
  registartionTypes,
  callbackTypes,
  messageTypes,
  registrationResults,
};
