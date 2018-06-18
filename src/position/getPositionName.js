const
  {ApiDialect, Arg} = require('api-dialect'),
  {models} = require('../../models/index')

exports.getPositionName = (req, res) => {
  let api = new ApiDialect(req, res)
  let receiveArgs = [
    new Arg('clientBrief', true),
    new Arg('teamBrief', true)
  ]

  if (!api.setArgs(receiveArgs)) return

  generatorPositionName(api.args.clientBrief, api.args.teamBrief, api.args.year)
    .then(obj => {
      api
        .setResponse(obj)
        .send()
    })
    .catch(err => api.error(err))

}

/**
 * 根据 team 的 brief，获取新的 position 的 name
 * 需要查看所有年份的 position 版本，然后确认最大值，因为会有position 是不复制的，如果只查看一年的 positionname，可能产生重复
 *
 * @param {string} clientBrief team 的 brief
 * @param {string} teamBrief team 的 brief
 * @param {string} year position 存在的年份
 * @param {object} t transaction
 * @return {string}
 */
async function generatorPositionName (clientBrief, teamBrief, year, t) {
  let maxName = await models.position.max('name', {
    where: {
      name: {$like: `${clientBrief}${teamBrief} %`}
    },
    transaction: t
  })

  if (!maxName) return `${clientBrief}${teamBrief} 0001`

  return `${clientBrief}${teamBrief} ${(parseInt(maxName.substr(-4)) + 1).prefix0(4)}`
}

exports.generatorPositionName = generatorPositionName
