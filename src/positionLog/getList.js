const
  {ApiDialect, Arg} = require('api-dialect'),
  {models, sequelize} = require('../../models/index'),
  moment = require('moment'),
  {attrPositionLog} = require('../args'),
  {salaryType, positionLogViewType, positionLogViewTypeValue} = require('config').get('args'),
  {recruitStatus, transferStatus, dismissionStatus} = require('config').get('flowCfg'),
  parseJSON = require('../commonFn/parseJSON')

exports.getList = (req, res) => {
  let api = new ApiDialect(req, res)
  let args = [
    new Arg('positionLogViewType', true)
  ]

  if (!api.setArgs(args)) return

  run(api.args)
    .then(objs => {
      api
        .setResponse(objs)
        .send({
          dateFormat: ['YYYY-MM-DD', 'entryDate', 'leaveDate', 'transferDate']
        })
    })
    .catch(err => api.error(err))
}

/**
 *
 * 排序：
 * in：上面是 正在招聘的 position，下面是 open position
 * out：上面是正在离职的，下面是已离职的（最近离职的在上面，倒序排列）
 * closed：按照 onboard 的时间倒序排列，根据 Entry date、leave date 排序
 *
 */

async function run (args) {
  let includeRule, sortRule
  let
    attrRecruit = ['id', 'staffName', 'entryDate', 'leaveDate', 'basicInfo', 'staffSalaryDistributions', 'flowStatus'],
    attrTransfer = ['id', 'staffName', 'transferDate', 'basicInfo', 'staffAfterSalaryDistributions', 'flowStatus'],
    attrDismission = ['id', 'staffName', 'leaveDate', 'flowStatus']

  if (!Object.values(positionLogViewType).includes(args.positionLogViewType)) throw new Error(`${args.positionLogViewType} 类型错误`)

  if (args.positionLogViewType === positionLogViewType.In) {
    includeRule = [{
      model: models.recruit,
      attributes: attrRecruit,
      required: false,
      where: {
        flowStatus: {$notIn: [recruitStatus.Onboarded, recruitStatus.Abandoned]}
      }
    }, {
      model: models.transfer,
      required: false,
      attributes: attrTransfer,
      where: {
        flowStatus: {$notIn: [transferStatus.Transferred, transferStatus.Abandoned]}
      },
      as: 'inLogs'
    }]

    sortRule = [
      sequelize.fn('FIELD', sequelize.col('positionLog.flowStatus'), ...positionLogViewTypeValue[args.positionLogViewType]),
      ['name', 'ASC'], ['seqNo', 'ASC']
    ]
  }

  if (args.positionLogViewType === positionLogViewType.Out) {
    includeRule = [{
      model: models.transfer,
      required: false,
      attributes: attrTransfer,
      where: {
        flowStatus: {$notIn: [transferStatus.Abandoned]}
      },
      as: 'outLogs'
    }, {
      model: models.dismission,
      attributes: attrDismission,
      required: false,
      where: {
        flowStatus: {$notIn: [dismissionStatus.Abandoned]}
      }
    }]

    sortRule = [
      sequelize.fn('FIELD', sequelize.col('positionLog.flowStatus'), ...positionLogViewTypeValue[args.positionLogViewType]),
      [models.dismission, 'leaveDate', 'DESC'],
      [{model: models.transfer, as: 'outLogs'}, 'transferDate', 'DESC'],
      ['name', 'ASC'], ['seqNo', 'ASC']
    ]
  }

  if (args.positionLogViewType === positionLogViewType.Closed) {
    includeRule = [{
      model: models.recruit,
      attributes: attrRecruit,
      required: false,
      where: {
        flowStatus: recruitStatus.Onboarded
      }
    }, {
      model: models.transfer,
      required: false,
      attributes: attrTransfer,
      where: {
        flowStatus: transferStatus.Transferred
      },
      as: 'inLogs'
    }]

    sortRule = [
      sequelize.fn('FIELD', sequelize.col('positionLog.flowStatus'), ...positionLogViewTypeValue[args.positionLogViewType]),
      [models.recruit, 'entryDate', 'DESC'],
      [{model: models.transfer, as: 'inLogs'}, 'transferDate', 'DESC'],
      ['name', 'ASC'], ['seqNo', 'ASC']
    ]
  }


  let $positionLogs = await models.positionLog.findAll({
    where: {
      year: moment().year(),
      flowStatus: {$in: positionLogViewTypeValue[args.positionLogViewType]}
    },
    attributes: attrPositionLog,
    order: sortRule,
    include: [{
      model: models.position,
      attributes: ['id'],
      include: [{
        model: models.sowPosition,
        required: false,
        attributes: ['FTE'],
        where: {
          status: 2
        },
        include: [{
          model: models.sow,
          attributes: ['name']
        }]
      }]
    }, {
      model: models.staff,
      attributes: ['id', 'name']
    }, {
      model: models.salaryDistribution,
      required: false,
      attributes: ['salaryTypeId', 'amount'],
      where: {
        salaryTypeId: {$in: [salaryType['Monthly Salary'], salaryType['Salary Increase']]}
      }
    }, ...includeRule
    ]
  })

  $positionLogs.forEach($positionLog => {
    if ($positionLog.recruits) $positionLog.dataValues.recruits.forEach(recruit => parseJSON(recruit.dataValues, ['basicInfo', 'staffSalaryDistributions']))
    if ($positionLog.inLogs) $positionLog.dataValues.inLogs.forEach(inLog => parseJSON(inLog.dataValues, ['basicInfo', 'staffAfterSalaryDistributions']))
    if ($positionLog.outLogs) $positionLog.dataValues.outLogs.forEach(outLog => parseJSON(outLog.dataValues, ['basicInfo', 'staffAfterSalaryDistributions']))
  })

  return $positionLogs
}

