const
  {passThroughPath} = require('config'),
  fs = require('fs')

module.exports = async args => {
  fs.writeFileSync(passThroughPath, JSON.stringify(args.passThroughType))
}
