const { directions, buttonsDict } = require('../constants');

const getBtnNumber = (btnNum) => {
  const [first, second, third] = btnNum.toString().split('');

  return (
    buttonsDict.numbers[first] +
    (second ? buttonsDict.numbers[second] : '') +
    (third ? buttonsDict.numbers[third] : '')
  );
};

const createStreamsButtons = (direction) => {
  const streamsBtns = [];
  const dir = directions[direction];
  if (!dir) {
    return streamsBtns;
  }

  dir.streams.forEach((stream, index) => {
    const row = Math.floor(index / 5);
    if (!streamsBtns[row]) {
      streamsBtns[row] = [];
    }

    streamsBtns[row].push({
      text: getBtnNumber(index + 1),
      callback_data: `stream_${stream}`,
    });
  });
  return streamsBtns;
};

module.exports = createStreamsButtons;
