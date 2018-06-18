const
  Project = require('../components/widgets').Project

const r = Project.getFiles(__dirname, ['index.js'])
const test1 = require('../src/test1')

module.exports = (router, passport) => {

  for (let fileName in r) {
    r[fileName](router, passport)
  }

  router.route('/test')
    .get(test1.get)
}
