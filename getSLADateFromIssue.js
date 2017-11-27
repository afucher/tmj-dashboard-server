'use strict';
module.exports = ( issue ) => {
    let info = issue.fields.customfield_10416;
    info = info.substring(1,info.length-1);
    let sla = info.length == 0 ?
            info : 
            info 
            .split(',')
            .filter(x => x.indexOf("jira_data_vencimento_sla") > 0)[0]
            .split(':')[1]
            .substring(1)
            .replace(/_/g,"/");
    return {id:issue.key,sla}
}