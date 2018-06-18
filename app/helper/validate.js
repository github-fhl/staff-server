const Parameter = require('parameter');
const _ = require('lodash');
const utils = require('./common');
const moment = require('moment');
const kindOf = require('kind-of')

const typeMap = {
  integer: i => parseInt(i),
  number: i => _.toNumber(i),
  datetime: i => moment(i).format('YYYY-MM-DD HH:mm'),
  date: i => moment(i).format('YYYY-MM-DD'),
  array: i => _.isString(i) ? i.split(',') : _.toArray(i),
  object: i => JSON.parse(i),
  string: i => JSON.stringify(i),
  empty: undefined,
};


/**
 * 验证参数
 * 1. 从 body、query、params 中获取参数
 * 2. 如果参数为 null，则删除
 * 3. 验证参数规则
 * 4. 如果参数有 translate 属性，则进行类型转换
 */

module.exports = (res, rule, ...datas) => {
  let data = {}

  datas.forEach(d => data = {...data, ...d})

  removeNull(data)

  const parameter = new Parameter();
  const result = parameter.validate(rule, data);
  const args = {};

  if (!_.isEmpty(result)) {
    console.error(result)

    if (res) {
      res.json({
        status: 'failed',
        msg: `Field ${result[0].field} ${result[0].message}`
      });
    }
    return false;
  }
  Object.keys(rule).forEach(key => {
    let value = data[key];
    const r = rule[key];

    if (utils.isEmpty(value) && !utils.isEmpty(r.default)) value = r.default;
    if (r.translate) value = typeMap[r.translate](value);

    removeValueNotInRule(r, value);
    args[key] = value;

  });
  return args;
}

function removeNull (args) {
  if (kindOf(args) === 'object') {
    for (let key in args) {
      switch (kindOf(args[key])) {
        case 'null':
          delete args[key]
          break
        case 'object':
          removeNull(args[key])
          break
        case 'array':
          removeNull(args[key])
          break
        default:
          break
      }
    }
  }
  else if (kindOf(args) === 'array') {
    args.forEach(item => removeNull(item))
  }
}

function removeValueNotInRule (r, value) {
  if (kindOf(value) === 'object') {
    for (let key in value) {
      switch (kindOf(key)) {
        case 'object':
          removeValueNotInRule(r, value[key]);
          break;
        case 'array':
          removeValueNotInRule(r, value[key]);
          break;
        default:
          if (!r.rule[key]) {
            delete value[key];
          }
          break;
      }
    }
  }
  else if (kindOf(value) === 'array') {
    value.forEach(item => removeValueNotInRule(r, item))
  }
}

