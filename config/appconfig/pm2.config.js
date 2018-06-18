/* eslint-disable */
const path = require('path')

module.exports = {
  apps : [{
    name        : "staff-rebuild",  // 项目名
    script      : path.join(__dirname, "../../app.js"),
    watch       : false,

    log_file    : "./log/pm2/staff.combined",
    error_file  : "./log/pm2/staff.errs",
    out_file    : "./log/pm2/staff.logs",
    log_date_format : "YYYY-MM-DD HH:mm:ss",

    env: {
      "NODE_ENV": "production",
    }
  }]
}
