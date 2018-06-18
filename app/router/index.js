const
  Project = require('../../components/widgets').Project

const r = Project.getFiles(__dirname, ['index.js'])

module.exports = (router, passport) => {

  for (let fileName in r) {
    r[fileName](router, passport)
  }

}
