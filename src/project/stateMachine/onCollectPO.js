const
  NP = require('number-precision'),
  {models} = require('../../../models')


/**
 * 1. 录入 PO 数据
 * 2. 更新 project 中的金额
 *
 *    - POInfo po 的信息
 *      - poCode
 *      - fee
 *      - productionCost
 *      - poFilePath
 */

async function onCollectPO (action, POInfo) {
  let updateProject = {
    ...POInfo,
    totalAmount: NP.plus(NP.minus(this.$project.totalAmount, this.$project.productionCost), POInfo.productionCost)
  }

  await checkPOCode(POInfo.poCode, this.t)
  await this.$project.update(updateProject, {transaction: this.t})
}
module.exports = onCollectPO

/**
 * 检查 POCode 是否存在重复
 */

async function checkPOCode (poCode, t) {
  let count = await models.project.count({
    transaction: t,
    where: {poCode}
  })

  if (count !== 0) throw new Error(`已经存在 ${poCode}`)
}

