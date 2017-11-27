'use strict';

const Hapi = require('hapi');
const port = process.env.PORT || 8000;
const endpointUrl = process.env.JIRA_URL;
const JIRAController = require('./JIRAController');
const statusPronto = ["Cancelado", "Concluído", "Recusada", "Expedido", "Resolved","Reprovado"];
const getSLADateFromIssue = require("./getSLADateFromIssue");
// Create a server with a host and port
const server = new Hapi.Server();

server.connection({ 
    port,
    routes: {
        cors: true
      }
});

// Add the route
server.route({
    method: 'POST',
    path:'/sprints/{sprintID}/issues', 
    handler: function (request, reply) {
        JIRAController.sprint.getIssues(request.params.sprintID,{'fields':'id,description,summary','jql':'issuetype IN (Manutenção,Story)'})
            .then(data => {
                data.issues = data.issues.map(x => {
                    x['url'] = endpointUrl+"/browse/"+x.key;
                    return x;
                })
                return data;
            })
            .then(reply)
            .catch(console.log);
    }
});

server.route({
    method: 'GET',
    path:'/projects/{projectID}/issues/associacao', 
    handler: function (request, reply) {
        JIRAController.project.getIssues(request.params.projectID,{'fields':'parent','jql':'issuetype IN ("Associado (Sub-tarefa)") AND status = Associado '})
            .then(data => {
                return data.filter( issue => {
                    let parent = issue.fields ? issue.fields.parent : null;
                    if(parent){
                        return statusPronto.findIndex( status => status == parent.fields.status.name) < 0;
                    }else{
                        return false;
                    }
                });
            })
            .then(data => {
                return data.map(x => {
                    let parent = x.fields ? x.fields.parent : null;
                    if(parent){
                        parent['url'] = endpointUrl+"/browse/"+parent.key;
                    }
                    
                    return x;
                });
            })
            .then(reply);
    }
});

server.route({
    method: 'GET',
    path: '/issues/SLA',
    handler: (request, reply) => {
        let issueIDs = request.query.issueIDs;
        if(issueIDs.endsWith(',')) issueIDs = issueIDs.substr(0,issueIDs.length-1);
        issueIDs = issueIDs.split(',');
        let promises = issueIDs.map( id => JIRAController.issue.getSingle(id,{'fields':'customfield_10416'}));
        Promise.all(promises)
            .then(issues => issues.map(getSLADateFromIssue))
            .then(reply)
            .catch(reply)
        /*JIRAController.issue.getSingle(issueIDs[0],{'fields':'customfield_10416'})
            .then(data => {
                //console.log(data);
                let info = data.fields.customfield_10416;
                info = info.substring(1,info.length-1);
                let sla = info.length == 0 ?
                        info : 
                        info 
                        .split(',')
                        .filter(x => x.indexOf("jira_data_vencimento_sla") > 0)[0]
                        .split(':')[1]
                        .substring(1)
                        .replace(/_/g,"/");
                return {id:issueIDs[0],sla}
            })
            .then(reply)
            .catch(reply);*/
    }

});

function malformedJSON2Object(tar) {
    var obj = {};
    tar = tar.replace(/^\{|\}$/g,'').split(',');
    for(var i=0,cur,pair;cur=tar[i];i++){
        pair = cur.split(':');
        obj[pair[0]] = /^\d*$/.test(pair[1]) ? +pair[1] : pair[1];
    }
    return obj;
}

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});