const getUserStreamName = (stream) => {
  const streamName = stream.replace(/_\d+$/, '');
  const [_, streamNumber] = stream.split(streamName + '_');
  const direction = directions[streamName];
  if (direction) {
    return `${direction.shortcut} ${streamNumber}`;
  }
  return stream;
};

const getUserDirectionName = (directionKey) => {
  const direction = directions[directionKey];
  if (direction) {
    return direction.name;
  }
  return directionKey;
};

module.exports = {
  streamName: getUserStreamName,
  directionName: getUserDirectionName,
};
