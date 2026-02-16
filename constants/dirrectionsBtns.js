const { directions } = require("./index");

const dirList = Object.values(directions)
  .map((dir) => [
    {
      text: dir.name,
      callback_data: `direction_${dir.value}`,
    },
  ])
  .sort((a, b) => a[0].text.localeCompare(b[0].text));

module.exports = dirList;
