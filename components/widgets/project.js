const
  fs = require('fs'),
  path = require('path'),
  moment = require('moment'),
  business = require('moment-business')

exports.checkUnique = async (model, condition, t) => {

  // 同年只能有一条数据
  let $checkUnique = await model.count({
    where: condition,
    transaction: t
  })

  if ($checkUnique !== 0) throw new Error('同年只能有一条数据')
}

/**
 * 获取文件夹中所有文件
 *
 * @param {string} filePath 文件路径
 * @param {array} excludeFiles 需要排除的文件名数组
 * @return {object}
 */
exports.getFiles = (filePath, excludeFiles = []) => {
  let result = {}

  fs.readdirSync(filePath, 'utf8')
    .filter(file => !excludeFiles.includes(file) && !file.startsWith('.'))
    .forEach(file => {

      // 如果是文件夹
      if (!file.endsWith('.js')) {
        let deepResult = exports.getFiles(`${filePath}/${file}`)

        for (let key in deepResult) {
          result[key] = deepResult[key]
        }
      }

      else {
        result[file.replace(/\.js$/, '')] = require(`${filePath}/${file}`)
      }
    })

  return result
}

/**
 * 获得一年中的天数
 * @param {number} year 年份
 * @return {number}
 */
exports.daysInYear = year => moment(year).isLeapYear() ? 366 : 365;

/**
 * 获取一个月中的工作日天数
 *
 * @param {string} month 月份 2018-01
 * @return {number} 工作日天数
 */
exports.weekDaysInMonth = month => {
  let
    startDay = moment(month).startOf('month'),
    endDay = moment(month).endOf('month').add(1, 'd')

  return business.weekDays(startDay, endDay)
}


/**
 * 检测 object 中是否存在 attrArr 中所包含的字段
 *
 * @param {object} object 目标对象
 * @param {array} attrArr ['attr1', 'attr2']
 * @return {null}
 */
exports.checkExist = (object, attrArr) => {
  attrArr.forEach(attr => {
    if (object[attr] === null || object[attr] === undefined) throw new Error(`${attr} 参数不能为空`)
  })
}

/**
 * 将 object 中指定的字段转为数字
 *
 * @param {object} object 目标对象
 * @param {array} attrArr ['attr1', 'attr2']
 * @return {null}
 */
exports.bulkParseFloat = (object, attrArr) => {
  attrArr.forEach(attr => {
    object[attr] = parseFloat(object[attr])
  })
}


/**
 * 递归创建文件夹，如果存在则不创建
 * 注意 windows 和 linux（posix） 的区别
 * @param {string} destination 文件夹路径
 * @return {null}
 */
exports.mkdirRecursion = destination => {
  if (!fs.existsSync(destination)) {
    let upperDestination = path.parse(destination).dir

    if (!fs.existsSync(upperDestination)) {
      exports.mkdirRecursion(upperDestination)
    }

    fs.mkdirSync(destination)
  }
}


exports.searchStr = str => {
  let matchstr

  matchstr = str.split('')
  return matchstr = `%${matchstr.join('%')}%`
};
