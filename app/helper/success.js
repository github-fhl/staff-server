const kindOf = require('kind-of');

module.exports = (res, wrapper = false) => obj => {
  const response = {status: 'success'}

  if (kindOf(obj) === 'object' && !wrapper) {
    response.obj = obj;
    return res.json(response);
  }

  if (kindOf(obj) === 'object' && wrapper) {
    Object.assign(response, obj);
    return res.json(response);
  }

  if (kindOf(obj) === 'array') {
    response.objs = obj;
    response.count = obj.length;
    return res.json(response);
  }
  response.msg = obj;

  return res.send(response);
}
