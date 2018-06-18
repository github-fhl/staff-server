module.exports = (array, fields) => {
  array.forEach(item => {
    fields.forEach(field => {
      if (item[field]) {
        item[field] *= 100
      }
    })
  })

  return array
}
