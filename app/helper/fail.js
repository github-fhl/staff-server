module.exports = res => err => {
  console.log(err);
  res.json({
    msg: err.message,
    status: 'failed'
  })
}
