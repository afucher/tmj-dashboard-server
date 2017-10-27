'use strict';

const Hapi = require('hapi');
const port = process.env.PORT || 8000;
// Create a server with a host and port
const server = new Hapi.Server();
server.connection({ 
    port 
});

// Add the route
server.route({
    method: 'POST',
    path:'/sprints/{sprintID}/issues', 
    handler: function (request, reply) {

        return reply([{
            "expand": "operations,versionedRepresentations,editmeta,changelog,renderedFields",
            "id": "507456",
            "self": "http://localhost/rest/agile/1.0/issue/507456",
            "key": "DFRM1-3175",
            "fields": {
              "summary": "Issue01",
              "description": "Explicação da issue01 bem mais completa"
            }
          },
          {
            "expand": "operations,versionedRepresentations,editmeta,changelog,renderedFields",
            "id": "486141",
            "self": "http://localhost/rest/agile/1.0/issue/486141",
            "key": "DFRM1-2913",
            "fields": {
              "summary": "Issue02",
              "description": "Explicação da issue02 bem mais completa"
            }
          }]);
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});