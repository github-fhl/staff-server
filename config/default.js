const
  args = require('./appconfig/args'),
  flowCfg = require('./appconfig/flowCfg'),
  errors = require('./appconfig/errors'),
  init = require('./appconfig/init'),
  eventType = require('./appconfig/eventType'),
  path = require('path'),
  mainPath = path.join(require.main.filename, '..')

module.exports = {
  mysql: {
    database: 'staff_rebuild',
    username: 'root',
    password: 'root',
    options: {
      host: 'localhost',
      port: '3306',
      dialect: 'mysql',
      logging: true
    }
  },
  redisCfg: {
    host: 'localhost',
    port: '6379',
  },
  webSocketCfg: {
    host: '127.0.0.1',
    port: '5501',
  },
  cache: false,
  protocol: 'http',
  port: 5500,
  args,
  cfg: args,
  flowCfg,
  eventType,
  errors,
  cluster: false,
  init,
  basis: {},

  mainPath,

  uploadPath: path.join(mainPath, 'uploadFile'),
  databaseFilesPath: path.join(mainPath, 'databaseFiles'),

  modelPath: path.join(mainPath, 'models'),
  passThroughPath: path.join(__dirname, path.join('appconfig', 'passThrough.json')),
  servicePath: path.join(mainPath, 'app/service'),
  helperPath: path.join(mainPath, 'app/helper'),
  srcPath: path.join(mainPath, 'src'),

  wsPath: path.join(mainPath, 'webSocket'),
}
