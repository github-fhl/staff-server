/**
 * 将对象中的某些 JSON 类型的字段解析出来
 * @param {object} obj 传入的对象
 * @param {array} keyArr key 的数组
 * @return {null}
 */
function parseJSON (obj, keyArr) {
  for (let key of keyArr) {
    obj[key] = JSON.parse(obj[key])
  }
}

module.exports = parseJSON
