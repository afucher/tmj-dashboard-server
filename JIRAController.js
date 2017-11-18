'use strict';
var api = require('jira-agile-api-client');
var jiraSearch = require('jira-search');
var btoa = require('btoa');
const prefix = 'rest/api/2';
const user = process.env.JIRA_USER;
const password = process.env.JIRA_PASSWORD;
const endpointUrl = process.env.JIRA_URL;


// Import fetch polyfill.
global.fetch = require('node-fetch');

// Set JIRA Url.
api.setEndpoint(endpointUrl);

// Set login data.
api.setSetting('headers', {
  'Authorization': 'Basic '+btoa(user+':'+password)
});
api.project = {};
api.project.getIssues = function( project, params, done ){
  if (params.jql) {
    params.jql += `AND project="${project}"`;
  }else{
    params.jql = `project="${project}"`;
  }
  return new Promise((resolve, reject) => {
    jiraSearch({
      serverRoot: endpointUrl, // the base URL for the JIRA server
      user, // the user name
      pass: password, // the password
      jql: params.jql, // the JQL
      fields: params.fields || '*all', // the fields parameter for the JIRA search
      maxResults: 50
    })
    .then(resolve);
  })

}


module.exports = api;