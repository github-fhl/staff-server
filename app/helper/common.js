const
  kindOf = require('kind-of');

exports.isEmpty = data => {
  if (['undefined', 'null'].includes(kindOf(data)) || Number.isNaN(data)) return true;
  return false;
}
