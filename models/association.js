/* eslint-disable */

module.exports = (models) => {

  models.account.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.account.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.signature.belongsTo(models.account, {foreignKey: {name: 'accountId', allowNull: false}});
  models.account.hasMany(models.signature, {foreignKey: {name: 'accountId', allowNull: false}});
  
  models.account.belongsToMany(models.role, {through: {model: models.accountRole, unique: false}});
  models.role.belongsToMany(models.account, {through: {model: models.accountRole, unique: false}});
  
  models.accountRole.belongsTo(models.role, {foreignKey: {name: 'roleId', allowNull: false}});
  models.role.hasMany(models.accountRole, {foreignKey: {name: 'roleId', allowNull: false}});
  
  models.accountRole.belongsTo(models.account, {foreignKey: {name: 'accountId', allowNull: false}});
  models.account.hasMany(models.accountRole, {foreignKey: {name: 'accountId', allowNull: false}});
  
  models.grant.belongsTo(models.role, {foreignKey: {name: 'seniorRole', allowNull: false}});
  models.role.hasMany(models.grant, {foreignKey: {name: 'seniorRole', allowNull: false}});
  
  models.grant.belongsTo(models.role, {foreignKey: {name: 'juniorRole'}});
  models.role.hasMany(models.grant, {foreignKey: {name: 'juniorRole'}});
  
  models.grant.belongsTo(models.permission, {foreignKey: {name: 'permissionId'}});
  models.permission.hasMany(models.grant, {foreignKey: {name: 'permissionId'}});
  
  models.flowLog.belongsTo(models.sow, {foreignKey: {name: 'commonId'}, constraints: false, as: 'sow'});
  models.sow.hasMany(models.flowLog, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'sow'}});
  
  models.flowLog.belongsTo(models.recruit, {foreignKey: {name: 'commonId'}, constraints: false, as: 'recruit'});
  models.recruit.hasMany(models.flowLog, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'recruit'}});
  
  models.flowLog.belongsTo(models.transfer, {foreignKey: {name: 'commonId'}, constraints: false, as: 'transfer'});
  models.transfer.hasMany(models.flowLog, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'transfer'}});
  
  models.flowLog.belongsTo(models.dismission, {foreignKey: {name: 'commonId'}, constraints: false, as: 'dismission'});
  models.dismission.hasMany(models.flowLog, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'dismission'}});
  
  models.flowLog.belongsTo(models.extension, {foreignKey: {name: 'commonId'}, constraints: false, as: 'extension'});
  models.extension.hasMany(models.flowLog, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'extension'}});
  
  models.flowLog.belongsTo(models.project, {foreignKey: {name: 'commonId'}, constraints: false, as: 'project'});
  models.project.hasMany(models.flowLog, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'project'}});
  
  models.flowLog.belongsTo(models.account, {foreignKey: {name: 'handler', allowNull: false}, as: 'Handler'});
  models.account.hasMany(models.flowLog, {foreignKey: {name: 'handler', allowNull: false}, as: 'Handlers'});
  
  models.flowLog.belongsTo(models.account, {foreignKey: {name: 'nextHandleUsr'}, as: 'NextHandleUsr'});
  models.account.hasMany(models.flowLog, {foreignKey: {name: 'nextHandleUsr'}, as: 'NextHandleUsrs'});
  
  models.flowLog.belongsTo(models.role, {foreignKey: {name: 'nextHandleRole'}, as: 'NextHandleRole'});
  models.role.hasMany(models.flowLog, {foreignKey: {name: 'nextHandleRole'}, as: 'NextHandleRoles'});
  
  models.flowLog.belongsTo(models.account, {foreignKey: {name: 'createdUsr'}});
  models.account.hasMany(models.flowLog, {foreignKey: {name: 'createdUsr'}});
  
  models.flowLog.belongsTo(models.account, {foreignKey: {name: 'updatedUsr'}});
  models.account.hasMany(models.flowLog, {foreignKey: {name: 'updatedUsr'}});
  
  models.dataLog.belongsTo(models.account, {foreignKey: {name: 'createdUsr'}});
  models.account.hasMany(models.dataLog, {foreignKey: {name: 'createdUsr'}});
  
  models.dataLog.belongsTo(models.account, {foreignKey: {name: 'updatedUsr'}});
  models.account.hasMany(models.dataLog, {foreignKey: {name: 'updatedUsr'}});
  
  models.company.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.company, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.company.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.company, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.companyDetail.belongsTo(models.company, {foreignKey: {name: 'companyId', allowNull: false}});
  models.company.hasMany(models.companyDetail, {foreignKey: {name: 'companyId', allowNull: false}});
  
  models.companyDetail.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.companyDetail, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.companyDetail.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.companyDetail, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.currency.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.currency, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.currency.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.currency, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.currencyDetail.belongsTo(models.currency, {foreignKey: {name: 'currencyId'}});
  models.currency.hasMany(models.currencyDetail, {foreignKey: {name: 'currencyId'}});
  
  models.currencyDetail.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.currencyDetail, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.currencyDetail.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.currencyDetail, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.client.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.client, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.client.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.client, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.client.belongsToMany(models.team, {through: {model: models.ClientTeam, unique: false}});
  models.team.belongsToMany(models.client, {through: {model: models.ClientTeam, unique: false}});
  
  models.ClientTeam.belongsTo(models.client, {foreignKey: {name: 'clientId', allowNull: false}});
  models.client.hasMany(models.ClientTeam, {foreignKey: {name: 'clientId', allowNull: false}});
  
  models.ClientTeam.belongsTo(models.team, {foreignKey: {name: 'teamId', allowNull: false}});
  models.team.hasMany(models.ClientTeam, {foreignKey: {name: 'teamId', allowNull: false}});
  
  models.ClientTeam.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.ClientTeam, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.ClientTeam.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.ClientTeam, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.office.belongsTo(models.currency, {foreignKey: {name: 'currencyId'}});
  models.currency.hasMany(models.office, {foreignKey: {name: 'currencyId'}});
  
  models.office.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.office, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.office.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.office, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.officeDetail.belongsTo(models.office, {foreignKey: {name: 'officeId', allowNull: false}});
  models.office.hasMany(models.officeDetail, {foreignKey: {name: 'officeId', allowNull: false}});
  
  models.officeDetail.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.officeDetail, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.officeDetail.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.officeDetail, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.fordFunction.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.fordFunction, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.fordFunction.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.fordFunction, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.title.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.title, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.title.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.title, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.stdPos.belongsTo(models.team, {foreignKey: {name: 'teamId', allowNull: false}});
  models.team.hasMany(models.stdPos, {foreignKey: {name: 'teamId', allowNull: false}});
  
  models.stdPos.belongsTo(models.office, {foreignKey: {name: 'officeId', allowNull: false}});
  models.office.hasMany(models.stdPos, {foreignKey: {name: 'officeId', allowNull: false}});
  
  models.stdPos.belongsTo(models.currency, {foreignKey: {name: 'currencyId', allowNull: false}});
  models.currency.hasMany(models.stdPos, {foreignKey: {name: 'currencyId', allowNull: false}});
  
  models.stdPos.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.stdPos, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.stdPos.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.stdPos, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.stdPosDetail.belongsTo(models.stdPos, {foreignKey: {name: 'stdPosId', allowNull: false}, as: 'stdPos'});
  models.stdPos.hasMany(models.stdPosDetail, {foreignKey: {name: 'stdPosId', allowNull: false}, as: 'stdPos'});
  
  models.stdPosDetail.belongsTo(models.stdPos, {foreignKey: {name: 'stdPosId', allowNull: false}});
  models.stdPos.hasMany(models.stdPosDetail, {foreignKey: {name: 'stdPosId', allowNull: false}});
  
  models.stdPosDetail.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.stdPosDetail, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.stdPosDetail.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.stdPosDetail, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.stdPosPrice.belongsTo(models.stdPosDetail, {foreignKey: {name: 'stdPosDetailId', allowNull: false}});
  models.stdPosDetail.hasMany(models.stdPosPrice, {foreignKey: {name: 'stdPosDetailId', allowNull: false}});
  
  models.stdPosPrice.belongsTo(models.salaryType, {foreignKey: {name: 'salaryTypeId', allowNull: false}});
  models.salaryType.hasMany(models.stdPosPrice, {foreignKey: {name: 'salaryTypeId', allowNull: false}});
  
  models.stdPosPrice.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.stdPosPrice, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.stdPosPrice.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.stdPosPrice, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.salaryType.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.salaryType, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.salaryType.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.salaryType, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.sow.belongsTo(models.client, {foreignKey: {name: 'clientId', allowNull: false}});
  models.client.hasMany(models.sow, {foreignKey: {name: 'clientId', allowNull: false}});
  
  models.sow.belongsTo(models.currency, {foreignKey: {name: 'currencyId', allowNull: false}});
  models.currency.hasMany(models.sow, {foreignKey: {name: 'currencyId', allowNull: false}});
  
  models.sow.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.sow, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.sow.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.sow, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.position.belongsTo(models.staff, {foreignKey: {name: 'expectStaffId'}});
  models.staff.hasMany(models.position, {foreignKey: {name: 'expectStaffId'}});
  
  models.position.belongsTo(models.title, {foreignKey: {name: 'titleId'}});
  models.title.hasMany(models.position, {foreignKey: {name: 'titleId'}});
  
  models.position.belongsTo(models.company, {foreignKey: {name: 'companyId', allowNull: false}});
  models.company.hasMany(models.position, {foreignKey: {name: 'companyId', allowNull: false}});
  
  models.position.belongsTo(models.fordFunction, {foreignKey: {name: 'fordFunctionId', allowNull: false}});
  models.fordFunction.hasMany(models.position, {foreignKey: {name: 'fordFunctionId', allowNull: false}});
  
  models.position.belongsTo(models.office, {foreignKey: {name: 'officeId', allowNull: false}});
  models.office.hasMany(models.position, {foreignKey: {name: 'officeId', allowNull: false}});
  
  models.position.belongsTo(models.currency, {foreignKey: {name: 'currencyId', allowNull: false}});
  models.currency.hasMany(models.position, {foreignKey: {name: 'currencyId', allowNull: false}});
  
  models.position.belongsTo(models.team, {foreignKey: {name: 'teamId', allowNull: false}});
  models.team.hasMany(models.position, {foreignKey: {name: 'teamId', allowNull: false}});
  
  models.position.belongsTo(models.stdPos, {foreignKey: {name: 'stdPosId', allowNull: false}});
  models.stdPos.hasMany(models.position, {foreignKey: {name: 'stdPosId', allowNull: false}});
  
  models.position.belongsTo(models.stdPosDetail, {foreignKey: {name: 'stdPosDetailId', allowNull: false}});
  models.stdPosDetail.hasMany(models.position, {foreignKey: {name: 'stdPosDetailId', allowNull: false}});
  
  models.position.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.position, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.position.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.position, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.sow.belongsToMany(models.position, {through: {model: models.sowPosition, unique: false}});
  models.position.belongsToMany(models.sow, {through: {model: models.sowPosition, unique: false}});
  
  models.sowPosition.belongsTo(models.sow, {foreignKey: {name: 'sowId', allowNull: false}});
  models.sow.hasMany(models.sowPosition, {foreignKey: {name: 'sowId', allowNull: false}});
  
  models.sowPosition.belongsTo(models.position, {foreignKey: {name: 'positionId', allowNull: false}});
  models.position.hasMany(models.sowPosition, {foreignKey: {name: 'positionId', allowNull: false}});
  
  models.sowPosition.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.sowPosition, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.sowPosition.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.sowPosition, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.sowLevel.belongsTo(models.currency, {foreignKey: {name: 'currencyId'}});
  models.currency.hasMany(models.sowLevel, {foreignKey: {name: 'currencyId'}});
  
  models.sowLevel.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.sowLevel, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.sowLevel.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.sowLevel, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.clientPo.belongsTo(models.sow, {foreignKey: {name: 'sowId', allowNull: false}});
  models.sow.hasMany(models.clientPo, {foreignKey: {name: 'sowId', allowNull: false}});
  
  models.clientPo.belongsTo(models.sow, {foreignKey: {name: 'executionSowId'}, as: 'executionSow'});
  models.sow.hasMany(models.clientPo, {foreignKey: {name: 'executionSowId'}, as: 'executionSows'});
  
  models.clientPo.belongsTo(models.currency, {foreignKey: {name: 'currencyId', allowNull: false}});
  models.currency.hasMany(models.clientPo, {foreignKey: {name: 'currencyId', allowNull: false}});
  
  models.clientPo.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.clientPo, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.clientPo.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.clientPo, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.positionNote.belongsTo(models.position, {foreignKey: {name: 'positionId', allowNull: false}});
  models.position.hasMany(models.positionNote, {foreignKey: {name: 'positionId', allowNull: false}});
  
  models.positionNote.belongsTo(models.sow, {foreignKey: {name: 'sowId'}});
  models.sow.hasMany(models.positionNote, {foreignKey: {name: 'sowId'}});
  
  models.positionNote.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.positionNote, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.positionNote.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.positionNote, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.staff.belongsTo(models.company, {foreignKey: {name: 'companyId'}});
  models.company.hasMany(models.staff, {foreignKey: {name: 'companyId'}});
  
  models.staff.belongsTo(models.currency, {foreignKey: {name: 'currencyId'}});
  models.currency.hasMany(models.staff, {foreignKey: {name: 'currencyId'}});
  
  models.staff.belongsTo(models.office, {foreignKey: {name: 'officeId'}});
  models.office.hasMany(models.staff, {foreignKey: {name: 'officeId'}});
  
  models.staff.belongsTo(models.team, {foreignKey: {name: 'teamId'}});
  models.team.hasMany(models.staff, {foreignKey: {name: 'teamId'}});
  
  models.staff.belongsTo(models.title, {foreignKey: {name: 'titleId'}});
  models.title.hasMany(models.staff, {foreignKey: {name: 'titleId'}});
  
  models.staff.belongsTo(models.stdPos, {foreignKey: {name: 'stdPosId'}});
  models.stdPos.hasMany(models.staff, {foreignKey: {name: 'stdPosId'}});
  
  models.staff.belongsTo(models.stdPos, {foreignKey: {name: 'stdPosId'}, as: 'stdPos'});
  models.stdPos.hasMany(models.staff, {foreignKey: {name: 'stdPosId'}, as: 'stdPos'});
  
  models.staff.belongsTo(models.stdPosDetail, {foreignKey: {name: 'stdPosDetailId'}});
  models.stdPosDetail.hasMany(models.staff, {foreignKey: {name: 'stdPosDetailId'}});
  
  models.staff.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.staff, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.staff.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.staff, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.staffHistory.belongsTo(models.staff, {foreignKey: {name: 'staffId', allowNull: false}});
  models.staff.hasMany(models.staffHistory, {foreignKey: {name: 'staffId', allowNull: false}});
  
  models.staffHistory.belongsTo(models.positionLog, {foreignKey: {name: 'positionLogId'}});
  models.positionLog.hasMany(models.staffHistory, {foreignKey: {name: 'positionLogId'}});
  
  models.staffHistory.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.staffHistory, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.staffHistory.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.staffHistory, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.estimateSalary.belongsTo(models.staff, {foreignKey: {name: 'staffId', allowNull: false}});
  models.staff.hasMany(models.estimateSalary, {foreignKey: {name: 'staffId', allowNull: false}});
  
  models.estimateSalary.belongsTo(models.freelancerContract, {foreignKey: {name: 'freelancerContractId', allowNull: false}});
  models.freelancerContract.hasMany(models.estimateSalary, {foreignKey: {name: 'freelancerContractId', allowNull: false}});
  
  models.estimateSalary.belongsTo(models.currency, {foreignKey: {name: 'currencyId', allowNull: false}});
  models.currency.hasMany(models.estimateSalary, {foreignKey: {name: 'currencyId', allowNull: false}});
  
  models.estimateSalary.belongsTo(models.salaryType, {foreignKey: {name: 'salaryTypeId', allowNull: false}});
  models.salaryType.hasMany(models.estimateSalary, {foreignKey: {name: 'salaryTypeId', allowNull: false}});
  
  models.estimateSalary.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.estimateSalary, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.estimateSalary.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.estimateSalary, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.freelancerContract.belongsTo(models.staff, {foreignKey: {name: 'staffId', allowNull: false}});
  models.staff.hasMany(models.freelancerContract, {foreignKey: {name: 'staffId', allowNull: false}});
  
  models.freelancerContract.belongsTo(models.currency, {foreignKey: {name: 'currencyId', allowNull: false}});
  models.currency.hasMany(models.freelancerContract, {foreignKey: {name: 'currencyId', allowNull: false}});
  
  models.freelancerContract.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.freelancerContract, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.freelancerContract.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.freelancerContract, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.increasePool.belongsTo(models.currency, {foreignKey: {name: 'currencyId', allowNull: false}});
  models.currency.hasMany(models.increasePool, {foreignKey: {name: 'currencyId', allowNull: false}});
  
  models.increasePool.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.increasePool, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.increasePool.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.increasePool, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.increaseLog.belongsTo(models.staff, {foreignKey: {name: 'staffId', allowNull: false}});
  models.staff.hasMany(models.increaseLog, {foreignKey: {name: 'staffId', allowNull: false}});
  
  models.increaseLog.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.increaseLog, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.increaseLog.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.increaseLog, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.positionLog.belongsTo(models.position, {foreignKey: {name: 'positionId', allowNull: false}});
  models.position.hasMany(models.positionLog, {foreignKey: {name: 'positionId', allowNull: false}});
  
  models.positionLog.belongsTo(models.staff, {foreignKey: {name: 'staffId'}});
  models.staff.hasMany(models.positionLog, {foreignKey: {name: 'staffId'}});
  
  models.positionLog.belongsTo(models.title, {foreignKey: {name: 'titleId'}});
  models.title.hasMany(models.positionLog, {foreignKey: {name: 'titleId'}});
  
  models.positionLog.belongsTo(models.company, {foreignKey: {name: 'companyId', allowNull: false}});
  models.company.hasMany(models.positionLog, {foreignKey: {name: 'companyId', allowNull: false}});
  
  models.positionLog.belongsTo(models.fordFunction, {foreignKey: {name: 'fordFunctionId', allowNull: false}});
  models.fordFunction.hasMany(models.positionLog, {foreignKey: {name: 'fordFunctionId', allowNull: false}});
  
  models.positionLog.belongsTo(models.office, {foreignKey: {name: 'officeId', allowNull: false}});
  models.office.hasMany(models.positionLog, {foreignKey: {name: 'officeId', allowNull: false}});
  
  models.positionLog.belongsTo(models.currency, {foreignKey: {name: 'currencyId', allowNull: false}});
  models.currency.hasMany(models.positionLog, {foreignKey: {name: 'currencyId', allowNull: false}});
  
  models.positionLog.belongsTo(models.team, {foreignKey: {name: 'teamId', allowNull: false}});
  models.team.hasMany(models.positionLog, {foreignKey: {name: 'teamId', allowNull: false}});
  
  models.positionLog.belongsTo(models.stdPos, {foreignKey: {name: 'stdPosId', allowNull: false}});
  models.stdPos.hasMany(models.positionLog, {foreignKey: {name: 'stdPosId', allowNull: false}});
  
  models.positionLog.belongsTo(models.stdPos, {foreignKey: {name: 'stdPosId'}, as: 'stdPos'});
  models.stdPos.hasMany(models.positionLog, {foreignKey: {name: 'stdPosId'}, as: 'stdPos'});
  
  models.positionLog.belongsTo(models.stdPosDetail, {foreignKey: {name: 'stdPosDetailId', allowNull: false}});
  models.stdPosDetail.hasMany(models.positionLog, {foreignKey: {name: 'stdPosDetailId', allowNull: false}});
  
  models.positionLog.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.positionLog, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.positionLog.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.positionLog, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.salaryStructure.belongsTo(models.staff, {foreignKey: {name: 'staffId', allowNull: false}});
  models.staff.hasMany(models.salaryStructure, {foreignKey: {name: 'staffId', allowNull: false}});
  
  models.salaryStructure.belongsTo(models.currency, {foreignKey: {name: 'currencyId', allowNull: false}});
  models.currency.hasMany(models.salaryStructure, {foreignKey: {name: 'currencyId', allowNull: false}});
  
  models.salaryStructure.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.salaryStructure, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.salaryStructure.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.salaryStructure, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.salaryRecord.belongsTo(models.staff, {foreignKey: {name: 'staffId', allowNull: false}});
  models.staff.hasMany(models.salaryRecord, {foreignKey: {name: 'staffId', allowNull: false}});
  
  models.salaryRecord.belongsTo(models.currency, {foreignKey: {name: 'currencyId', allowNull: false}});
  models.currency.hasMany(models.salaryRecord, {foreignKey: {name: 'currencyId', allowNull: false}});
  
  models.salaryRecord.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.salaryRecord, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.salaryRecord.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.salaryRecord, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.salaryDistribution.belongsTo(models.salaryStructure, {foreignKey: {name: 'commonId'}, constraints: false, as: 'salaryStructure'});
  models.salaryStructure.hasMany(models.salaryDistribution, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'salaryStructure'}});
  
  models.salaryDistribution.belongsTo(models.positionLog, {foreignKey: {name: 'commonId'}, constraints: false, as: 'positionLog'});
  models.positionLog.hasMany(models.salaryDistribution, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'positionLog'}});
  
  models.salaryDistribution.belongsTo(models.salaryRecord, {foreignKey: {name: 'commonId'}, constraints: false, as: 'salaryRecord'});
  models.salaryRecord.hasMany(models.salaryDistribution, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'salaryRecord'}});
  
  models.salaryDistribution.belongsTo(models.salaryType, {foreignKey: {name: 'salaryTypeId'}});
  models.salaryType.hasMany(models.salaryDistribution, {foreignKey: {name: 'salaryTypeId'}});
  
  models.salaryDistribution.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.salaryDistribution, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.salaryDistribution.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.salaryDistribution, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.costDistribution.belongsTo(models.salaryRecord, {foreignKey: {name: 'costCenterId'}, constraints: false, as: 'salaryRecord'});
  models.salaryRecord.hasMany(models.costDistribution, {foreignKey: {name: 'costCenterId'}, constraints: false, scope: { costType: 'salaryRecord'}});
  
  models.costDistribution.belongsTo(models.freelancerContract, {foreignKey: {name: 'costCenterId'}, constraints: false, as: 'freelancerContract'});
  models.freelancerContract.hasMany(models.costDistribution, {foreignKey: {name: 'costCenterId'}, constraints: false, scope: { costType: 'freelancerContract'}});
  
  models.costDistribution.belongsTo(models.salaryStructure, {foreignKey: {name: 'costCenterId'}, constraints: false, as: 'salaryStructure'});
  models.salaryStructure.hasMany(models.costDistribution, {foreignKey: {name: 'costCenterId'}, constraints: false, scope: { costType: 'salaryStructure'}});
  
  models.costDistribution.belongsTo(models.position, {foreignKey: {name: 'commonId'}, constraints: false, as: 'position'});
  models.position.hasMany(models.costDistribution, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'position'}});
  
  models.costDistribution.belongsTo(models.project, {foreignKey: {name: 'commonId'}, constraints: false, as: 'project'});
  models.project.hasMany(models.costDistribution, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'project'}});
  
  models.costDistribution.belongsTo(models.production, {foreignKey: {name: 'commonId'}, constraints: false, as: 'production'});
  models.production.hasMany(models.costDistribution, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'production'}});
  
  models.costDistribution.belongsTo(models.inhouseFreelancer, {foreignKey: {name: 'commonId'}, constraints: false, as: 'inhouseFreelancer'});
  models.inhouseFreelancer.hasMany(models.costDistribution, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'inhouseFreelancer'}});
  
  models.costDistribution.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.costDistribution, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.costDistribution.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.costDistribution, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.recruit.belongsTo(models.staff, {foreignKey: {name: 'staffId'}});
  models.staff.hasMany(models.recruit, {foreignKey: {name: 'staffId'}});
  
  models.recruit.belongsTo(models.positionLog, {foreignKey: {name: 'positionLogId'}});
  models.positionLog.hasMany(models.recruit, {foreignKey: {name: 'positionLogId'}});
  
  models.recruit.belongsTo(models.freelancerContract, {foreignKey: {name: 'freelancerContractId'}});
  models.freelancerContract.hasOne(models.recruit, {foreignKey: {name: 'freelancerContractId'}});
  
  models.recruit.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.recruit, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.recruit.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.recruit, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.transfer.belongsTo(models.staff, {foreignKey: {name: 'staffId'}});
  models.staff.hasMany(models.transfer, {foreignKey: {name: 'staffId'}});
  
  models.transfer.belongsTo(models.positionLog, {foreignKey: {name: 'inLogId', allowNull: false}, as: 'inLog'});
  models.positionLog.hasMany(models.transfer, {foreignKey: {name: 'inLogId', allowNull: false}, as: 'inLogs'});
  
  models.transfer.belongsTo(models.positionLog, {foreignKey: {name: 'outLogId'}, as: 'outLog'});
  models.positionLog.hasMany(models.transfer, {foreignKey: {name: 'outLogId'}, as: 'outLogs'});
  
  models.transfer.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.transfer, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.transfer.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.transfer, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.dismission.belongsTo(models.staff, {foreignKey: {name: 'staffId', allowNull: false}});
  models.staff.hasMany(models.dismission, {foreignKey: {name: 'staffId', allowNull: false}});
  
  models.dismission.belongsTo(models.positionLog, {foreignKey: {name: 'positionLogId', allowNull: false}});
  models.positionLog.hasMany(models.dismission, {foreignKey: {name: 'positionLogId', allowNull: false}});
  
  models.dismission.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.dismission, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.dismission.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.dismission, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.extension.belongsTo(models.staff, {foreignKey: {name: 'staffId'}});
  models.staff.hasMany(models.extension, {foreignKey: {name: 'staffId'}});
  
  models.extension.belongsTo(models.freelancerContract, {foreignKey: {name: 'freelancerContractId'}});
  models.freelancerContract.hasOne(models.extension, {foreignKey: {name: 'freelancerContractId'}});
  
  models.extension.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.extension, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.extension.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.extension, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.project.belongsTo(models.client, {foreignKey: {name: 'clientId'}});
  models.client.hasMany(models.project, {foreignKey: {name: 'clientId'}});
  
  models.project.belongsTo(models.currency, {foreignKey: {name: 'currencyId'}});
  models.currency.hasMany(models.project, {foreignKey: {name: 'currencyId'}});
  
  models.project.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.project, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.project.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.project, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.projectDetail.belongsTo(models.project, {foreignKey: {name: 'projectId', allowNull: false}});
  models.project.hasMany(models.projectDetail, {foreignKey: {name: 'projectId', allowNull: false}});
  
  models.projectDetail.belongsTo(models.company, {foreignKey: {name: 'companyId', allowNull: false}});
  models.company.hasMany(models.projectDetail, {foreignKey: {name: 'companyId', allowNull: false}});
  
  models.projectDetail.belongsTo(models.fordFunction, {foreignKey: {name: 'fordFunctionId', allowNull: false}});
  models.fordFunction.hasMany(models.projectDetail, {foreignKey: {name: 'fordFunctionId', allowNull: false}});
  
  models.projectDetail.belongsTo(models.office, {foreignKey: {name: 'officeId', allowNull: false}});
  models.office.hasMany(models.projectDetail, {foreignKey: {name: 'officeId', allowNull: false}});
  
  models.projectDetail.belongsTo(models.currency, {foreignKey: {name: 'currencyId', allowNull: false}});
  models.currency.hasMany(models.projectDetail, {foreignKey: {name: 'currencyId', allowNull: false}});
  
  models.projectDetail.belongsTo(models.team, {foreignKey: {name: 'teamId', allowNull: false}});
  models.team.hasMany(models.projectDetail, {foreignKey: {name: 'teamId', allowNull: false}});
  
  models.projectDetail.belongsTo(models.stdPos, {foreignKey: {name: 'stdPosId', allowNull: false}});
  models.stdPos.hasMany(models.projectDetail, {foreignKey: {name: 'stdPosId', allowNull: false}});
  
  models.projectDetail.belongsTo(models.stdPos, {foreignKey: {name: 'stdPosId', allowNull: false}, as: 'stdPos'});
  models.stdPos.hasMany(models.projectDetail, {foreignKey: {name: 'stdPosId', allowNull: false}, as: 'stdPos'});
  
  models.projectDetail.belongsTo(models.stdPosDetail, {foreignKey: {name: 'stdPosDetailId', allowNull: false}});
  models.stdPosDetail.hasMany(models.projectDetail, {foreignKey: {name: 'stdPosDetailId', allowNull: false}});
  
  models.projectDetail.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.projectDetail, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.projectDetail.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.projectDetail, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.production.belongsTo(models.currency, {foreignKey: {name: 'currencyId'}});
  models.currency.hasMany(models.production, {foreignKey: {name: 'currencyId'}});
  
  models.production.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.production, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.production.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.production, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.inhouseFreelancer.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.inhouseFreelancer, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.inhouseFreelancer.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.inhouseFreelancer, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.orgNode.belongsTo(models.orgNode, {foreignKey: {name: 'pId'}});
  models.orgNode.hasMany(models.orgNode, {foreignKey: {name: 'pId'}});
  
  models.orgNode.belongsTo(models.staff, {foreignKey: {name: 'staffId'}});
  models.staff.hasMany(models.orgNode, {foreignKey: {name: 'staffId'}});
  
  models.orgNode.belongsTo(models.staff, {foreignKey: {name: 'lastStaffId'}, as: 'lastStaff'});
  models.staff.hasMany(models.orgNode, {foreignKey: {name: 'lastStaffId'}, as: 'lastStaffs'});
  
  models.orgNode.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.orgNode, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.orgNode.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.orgNode, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.message.belongsTo(models.account, {foreignKey: {name: 'fromUserId'}, as: 'fromUser'});
  models.account.hasMany(models.message, {foreignKey: {name: 'fromUserId'}, as: 'fromUsers'});
  
  models.message.belongsTo(models.account, {foreignKey: {name: 'toUserId'}, as: 'toUser'});
  models.account.hasMany(models.message, {foreignKey: {name: 'toUserId'}, as: 'toUsers'});
  
  models.message.belongsTo(models.role, {foreignKey: {name: 'toRoleId'}, as: 'toRole'});
  models.role.hasMany(models.message, {foreignKey: {name: 'toRoleId'}, as: 'toRoles'});
  
};
