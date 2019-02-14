const http = require('http'); // pull in the http server module
const url = require('url'); // pull in the url module
// pull in the query string module
const query = require('querystring');
// pull in our html response handler file
const htmlHandler = require('./htmlResponses.js');
// pull in our json response handler file
const jsonHandler = require('./jsonResponses.js');


// set the port. process.env.PORT and NODE_PORT are for servers like heroku
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// key:value object to look up URL routes to specific functions
const urlStruct = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/getUsers': jsonHandler.getUsers,
  '/notReal': jsonHandler.notFound,
  '/addUser': jsonHandler.addUser,
  '/badRequest': jsonHandler.badRequest,
};

const post = (request, response, parsedUrl) => {
  // reference from http://shiya.io/send-http-requests-to-a-server-with-node-js/
  const params = [];

  request.on('error', (err) => {
    console.error(err);
    response.statusCode = 400;
    response.end();
  });

  // chunk data into individual params
  request.on('data', (d) => {
    params.push(d);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(params).toString();
    const bodyParams = query.parse(bodyString);

    urlStruct[parsedUrl.pathname](request, response, bodyParams);
  });
};

// handle HTTP requests. In node the HTTP server will automatically
// send this function request and pre-filled response objects.
const onRequest = (request, response) => {
  // parse the url using the url module
  // This will let us grab any section of the URL by name
  const parsedUrl = url.parse(request.url);

  // grab the query parameters (?key=value&key2=value2&etc=etc)
  // and parse them into a reusable object by field name
  const params = query.parse(parsedUrl.query);

  const type = request.headers.accept.split(',');

  // check if the path name (the /name part of the url) matches
  // any in our url object. If so call that function. If not, default to index.
  if (request.method === 'POST') post(request, response, parsedUrl);
  else if (urlStruct[parsedUrl.pathname]) {
    urlStruct[parsedUrl.pathname](request, response, params, type);
  } else {
    urlStruct['/notReal'](request, response, params, type);
  }
};

// start HTTP server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
