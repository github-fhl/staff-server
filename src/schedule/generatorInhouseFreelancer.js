const
  {models, sequelize} = require('../../models/index'),
  schedule = require('node-schedule'),
  {generatorInhouseFreelancerRule} = require('./rules')

exports.generatorInhouseFreelancer = schedule.scheduleJob(generatorInhouseFreelancerRule, () => {
  let nowYear = (new Date()).getFullYear()

  sequelize.transaction(t => generator(nowYear, t))
})


async function generator (nowYear, t) {
  let inhouseFreelancer = {
    id: `IF${nowYear}`,
    year: nowYear
  }

  await models.inhouseFreelancer.findOrCreate({
    transaction: t,
    where: {id: inhouseFreelancer.id},
    defaults: inhouseFreelancer
  })
}
