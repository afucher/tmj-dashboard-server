'use strict';

const Hapi = require('hapi');
const port = process.env.PORT || 8000;
const endpointUrl = process.env.JIRA_URL;
const JIRAController = require('./JIRAController');
const statusPronto = ["Cancelado", "Concluído", "Recusada", "Teste Integrado Concluído", "Expedido", "Resolved","Reprovado"];
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
            .then(reply);
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


// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});