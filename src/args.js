module.exports = {
  attrSow: ['id', 'name', 'year', 'version', 'clientId', 'sowType', 'positionNum', 'FTE', 'openPositionNum', 'currencyId', 'net', 'gross', 'incentive', 'grandTotal', 'media', 'production', 'traditional', 'digital', 'CRM', 'travel', 'total', 'otherFee', 'level1', 'level2', 'level3', 'level4', 'level5', 'flowStatus', 'status', 'isExecution'],
  sowResCfg: {
    dateFormat: ['YYYY-MM-DD', 'validDate', 'invalidDate', 'createdAt', 'updatedAt']
  },

  attrLevel: ['id', 'year', 'level1Max', 'level2Max', 'level3Max', 'level4Max', 'currencyId'],
  attrPosition: ['id', 'name', 'year', 'expectStaffId', 'titleId', 'companyId', 'fordFunctionId', 'officeId', 'currencyId', 'teamId', 'stdPosId', 'skillLevel', 'stdPosDetailId', 'HCCategory', 'location', 'seqNo', 'validDate', 'invalidDate', 'FTE', 'annualSalary', 'annualCola', 'bonus', 'directComp', 'benefits', 'directLabor', 'overhead', 'markup', 'net', 'tax', 'gross', 'budgetIncentive', 'sowLevel', 'remark'],
  attrSowPosition: ['id', 'sowId', 'positionId', 'FTE', 'net', 'tax', 'gross', 'incentive', 'grandTotal', 'status'],
  attrNote: ['id', 'noteContent'],
  attrClientPo: ['id', 'name', 'sowId', 'executionSowId', 'currencyId', 'production', 'gross', 'incentive', 'travel', 'media', 'total', 'passThroughFee', 'filePath', 'status'],

  attrStaff: ['id', 'name', 'gender', 'location', 'companyId', 'currencyId', 'officeId', 'teamId', 'titleId', 'stdPosId', 'stdPosId', 'skillLevel', 'stdPosDetailId', 'staffType', 'flowStatus'],
  attrStaffHistory: ['id', 'staffId', 'validFlag', 'entryDate', 'leaveDate', 'stopPayDate', 'increaseCycle', 'nextIncreaseMonth', 'noticePeriod', 'staffType', 'contractFile', 'positionLogId'],
  attrSalaryStructure: ['id', 'staffId', 'validDate', 'currencyId'],
  attrSalaryDistribution: ['id', 'type', 'commonId', 'salaryTypeId', 'amount'],
  attrSalaryType: ['id', 'category', 'distributeType', 'location', 'index'],
  attrSalaryRecord: ['id', 'staffId', 'date', 'currencyId', 'amount'],
  attrCostDistribution: ['id', 'costType', 'costCenterId', 'type', 'commonId', 'percentage', 'amount'],

  attrEstimateSalary: ['id', 'staffId', 'freelancerContractId', 'month', 'currencyId', 'salaryTypeId', 'taxType', 'accountType', 'workdays', 'basicSalary', 'net', 'gross'],
  attrFreelancerContract: ['id', 'staffId', 'entryDate', 'leaveDate', 'amount', 'currencyId', 'contractFile'],

  attrIncreasePool: ['id', 'increaseMonth', 'amount'],
  attrIncreaseLog: ['id', 'staffId', 'increased', 'increaseMonth', 'increaseRate', 'monthlySalary', 'salaryIncrease'],

  attrPositionLog: ['id', 'name', 'seqNo', 'year', 'positionId', 'staffId', 'wasStaffName', 'titleId', 'companyId', 'fordFunctionId', 'officeId', 'currencyId', 'teamId', 'stdPosId', 'skillLevel', 'stdPosDetailId', 'location', 'entryDate', 'leaveDate', 'sowLevel', 'flowStatus'],
  attrRecruit: ['id', 'entryDate', 'leaveDate', 'staffName', 'staffId', 'recruitType', 'positionLogId', 'basicInfo', 'inLogSalaryDistributions', 'staffSalaryDistributions', 'freelancerEstimateSalaries', 'freelancerCostDistributions', 'amount', 'flowStatus', 'inLogOldStatus', 'remark'],
  attrTransfer: ['id', 'transferType', 'transferDate', 'staffId', 'staffName', 'inLogId', 'outLogId', 'basicInfo', 'inLogSalaryDistributions', 'staffBeforeSalaryDistributions', 'staffAfterSalaryDistributions', 'flowStatus', 'inLogOldStatus', 'outLogOldStatus', 'remark'],
  attrDismission: ['id', 'applicationDate', 'leaveDate', 'stopPayDate', 'staffId', 'staffName', 'positionLogId', 'flowStatus', 'outLogOldStatus', 'remark'],
  attrExtension: ['id', 'entryDate', 'leaveDate', 'staffName', 'staffId', 'basicInfo', 'freelancerEstimateSalaries', 'freelancerCostDistributions', 'freelancerContractId', 'amount', 'flowStatus', 'remark'],

  attrProject: ['id', 'name', 'version', 'year', 'description', 'inChargeAccount', 'clientId', 'currencyId', 'net', 'budgetAmount', 'tax', 'gross', 'poCode', 'fee', 'productionCost', 'poFilePath', 'totalAmount', 'FTE', 'flowStatus'],
  attrProjectDetail: ['id', 'projectId', 'companyId', 'fordFunctionId', 'officeId', 'currencyId', 'teamId', 'stdPosId', 'skillLevel', 'location', 'stdPosDetailId', 'hours', 'FTE', 'annualSalary', 'annualNet', 'net', 'mulRate', 'budgetAmount', 'taxRate', 'tax', 'gross', 'sowLevel'],

  attrProduction: ['id', 'year', 'description', 'inChargeAccount', 'currencyId', 'excRate', 'peNet', 'productionNet', 'mulRate', 'budgetAmount', 'peFilePath', 'flowStatus'],
  attrInhouseFreelancer: ['id', 'year', 'description'],

  attrDataLog: ['dataLogType', 'data'],

  JSONkeyRecruitArr: ['basicInfo', 'inLogSalaryDistributions', 'staffSalaryDistributions', 'freelancerEstimateSalaries', 'freelancerCostDistributions'],
  JSONkeyTransferArr: ['basicInfo', 'inLogSalaryDistributions', 'staffBeforeSalaryDistributions', 'staffAfterSalaryDistributions'],
  JSONkeyExtensionArr: ['basicInfo', 'freelancerEstimateSalaries', 'freelancerCostDistributions'],

  attrFlowLog: ['id', 'type', 'commonId', 'commonId', 'handle', 'handler', 'nextHandleUsr', 'nextHandleRole', 'nextHandleStatus', 'remark', 'createdAt']
}
