const
  multer  = require('multer'),
  path  = require('path'),
  {mkdirRecursion} = require('../../components/widgets'),
  {uploadPath} = require('config')

const storage = multer.diskStorage({
  destination (req, file, next) {
    let destination = `${uploadPath}/${req.body.type}`

    mkdirRecursion(destination)
    next(null, destination)
  },
  filename (req, file, next) {
    let postfix = file.originalname.split('.')[1]
    let fileName = file.originalname.split('.')[0]

    next(null, `${fileName}-${Date.now()}.${postfix}`)
  }
})

exports.upload = multer({storage})

let uploadFile = (req, res) => {
  res.json({
    obj: path.relative(uploadPath, req.file.path),
    status: 'true'
  })
}

exports.uploadFile = uploadFile

