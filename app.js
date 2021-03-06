const
  express = require('express'),
  models = require('./models'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  MySQLStore = require('express-mysql-session')(session),
  flash = require('connect-flash'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Passport = require('./components').Passport,
  cors = require('cors'),
  config = require('config'),
  router = express.Router(),
  app = express(),
  routes = require('./routes'),
  routesV2 = require('./app/router'),
  accessValidator = require('./components').RBAC,
  cluster = require('cluster'),
  {mkdirRecursion} = require('./components/widgets'),
  http = require('http'),
  numCPUs = require('os').cpus().length

require('./src/schedule') // 加入定时任务
require('./components/common/prototype') // 原型链注册
require('./webSocket/index') // 加入 webSocket

/**
 * 创建某些必须的文件夹
 */
mkdirRecursion(config.databaseFilesPath)

/* global vars */
global.__components = require('path').join(process.cwd(), 'components')
global._ = require('lodash')
global.$ = Object.assign(require('./components').Common.Basic, require('./components').Common.Util)
/* global vars */

// session 配置
let MySQLOptions = {
  host: config.mysql.options.host,
  port: config.mysql.options.port,
  user: config.mysql.username,
  password: config.mysql.password,
  database: config.mysql.database
}

let sessionStore = new MySQLStore(MySQLOptions)

// cors 配置
let whiteList = [
  'http://localhost:5500',
  'http://10.52.96.169:8080',
  'http://localhost:3001',
  'http://localhost:8080',
  'http://localhost:3002',
  'http://192.168.1.120:3001',
  'chrome-extension://fhbjgbiflinjbdggehcddcbncdddomop', // 用于 postman
  undefined // 用于 postman
]
let corsOpts = {
  origin: (origin, cb) => whiteList.includes(origin) ?
    cb(null, true) :
    cb(new Error(`not allowed by CORS: ${origin}`)),
  optionsSuccessStatus: 200,
  credentials: true
}

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors(corsOpts))
app.use(session({
  secret: 'loncus2017',
  store: sessionStore,
  cookie: {maxAge: 3 * 60 * 60 * 1000}, // 3 个小时过期时间
  resave: true,
  rolling: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use(express.static('uploadFile'))

// passport 配置
passport.use(new LocalStrategy({passReqToCallback: true, usernameField: 'id'}, Passport.login))
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(Passport.find)

app.use('/', router);

/**
 * 创建数据库
 * 创建 RBAC
 * 加入路由
 */
(
  async () => {
    await models.sequelize.sync()
    console.log('DataBase Connection Has Been Established Successfully!\n')
    await accessValidator.buildRBACArgs()

    routes(router, passport)
    routesV2(router, passport)
  }
)().catch(err => console.error('Error:', err))

if (!config.cluster) {
  http.createServer(app).listen(config.port, () => console.log(`FBI warning: App listening at port: ${config.port}\n`))
} else {
  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`)

    // Fork workers.
    for (let i = 0; i < numCPUs - 1; i++) {
      cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
      console.warn(`worker ${worker.process.pid} died, 立刻重启`)
    })
  } else {
    console.log(`Worker ${process.pid} is running`)
    http.createServer(app).listen(config.port, () => console.log(`FBI warning: App listening at port: ${config.port}`))
  }
}

module.exports = app
