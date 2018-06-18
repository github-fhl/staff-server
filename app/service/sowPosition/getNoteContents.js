const
  {models} = require('../../../models'),
  moment = require('moment')

module.exports = async () => {
  let noteContents = await getNoteContents();

  return Array.from(new Set(noteContents))
}

async function getNoteContents () {
  let noteContents = [];
  let year = moment().year();
  let $positionNotes = await models.positionNote.findAll({include: [{model: models.position, where: {year}}]});

  for (let $positionNote of $positionNotes) {
    noteContents.push($positionNote.noteContent)
  }
  return noteContents;
}
