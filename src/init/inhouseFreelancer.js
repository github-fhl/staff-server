const
  {models} = require('../../models/index')

let inhouseFreelancers = [{
  id: 'IF2018',
  year: 2018,
  description: '描述'
}]


let initInhouseFreelancer = async t => {
  await models.inhouseFreelancer.bulkCreate(inhouseFreelancers, {transaction: t})
}

exports.initInhouseFreelancer = initInhouseFreelancer
