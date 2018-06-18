const
  {models} = require('../../../models')

module.exports = async (stdPosArray, obj, t) => {
  for (let stdPos of stdPosArray) {
    let $stdPos = await createOrUpdateStdPos(stdPos, t);

    stdPos.id = $stdPos.id;
    await createOrUpdateStdPosDetail(stdPos, obj, t);
  }
}

async function createOrUpdateStdPos (stdPos, t) {
  let stdPosInfo = {
    name: stdPos.name,
    location: stdPos.location,
    teamId: stdPos.teamId,
    officeId: stdPos.officeId,
    currencyId: stdPos.currencyId,
  }
  let $stdPos = await models.stdPos.findOne({where: stdPosInfo, transaction: t})

  if ($stdPos) return $stdPos
  $stdPos = await models.stdPos.create(stdPosInfo, {transaction: t});
  return $stdPos;
}

async function createOrUpdateStdPosDetail (stdPos, obj, t) {
  for (let stdPosDetail of obj.stdPosDetailArray) {
    if (stdPosDetail.stdPosOrder === stdPos.order) {
      let stdPosDetailInfo = {
        skillLevel: stdPosDetail.skillLevel,
        year: stdPosDetail.year,
        stdPosId: stdPos.id
      }
      let $stdPosDetail = await models.stdPosDetail.findOne({where: stdPosDetailInfo, transaction: t})

      if (!stdPosDetail) $stdPosDetail = await models.stdPosDetail.create(stdPosDetailInfo, {transaction: t})
      $stdPosDetail.order = stdPosDetail.order;
      await createOrUpdateStdPosPrice($stdPosDetail, obj.stdPosPriceArray, t)
    }
  }
}

async function createOrUpdateStdPosPrice ($stdPosDetail, stdPosPriceArray, t) {
  for (let stdPosPrice of stdPosPriceArray) {
    if (stdPosPrice.stdPosDetailOrder === $stdPosDetail.order) {
      let stdPosPriceInfo = {
        stdPosDetailId: $stdPosDetail.id,
        salaryTypeId: stdPosPrice.salaryTypeId
      }
      let $stdPosPrice = await models.stdPosPrice.findOne({where: stdPosPriceInfo, transaction: t});

      stdPosPriceInfo.amount = stdPosPrice.amount
      if (!$stdPosPrice) {
        await models.stdPosPrice.create(stdPosPriceInfo, {transaction: t});
      }
      if ($stdPosPrice.amount !== stdPosPriceInfo.amount) {
        await models.stdPosPrice.update(stdPosPriceInfo, {where: {id: $stdPosPrice.id}, transaction: t})
      }
    }
  }
}
