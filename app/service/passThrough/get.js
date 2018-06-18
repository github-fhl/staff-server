const
  {passThroughPath} = require('config'),
  fs = require('fs')

module.exports = () => {
  let passThrough = JSON.parse(fs.readFileSync(passThroughPath));

  return passThrough;
};

