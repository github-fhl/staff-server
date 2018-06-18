const
  {getNoteContents} = require('../../service/sowPosition'),
  {success, fail} = require('../../helper')

module.exports = (req, res) => {
  let run = async () => {
    let noteContents = await getNoteContents();

    return noteContents
  }

  run().then(success(res)).catch(fail(res))
}
