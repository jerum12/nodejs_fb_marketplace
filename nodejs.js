var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');
var axios = require('axios');

app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'));

// Set up your API credentials
const PAGE_ACCESS_TOKEN = '4617035748420942|lr0--Ut2WHpiXTNK4OUAB5E3CmU';
const APP_SECRET = '73aad193ac7831bf6e25dc64805db899';
const APP_ID = '4617035748420942';
const VERIFY_TOKEN = 'token';
app.use(xhub({ algorithm: 'sha1', secret: APP_SECRET }));
app.use(bodyParser.json());

var token = VERIFY_TOKEN;
var received_updates = [];

// app.get('/', function (req, res) {
//   const user_access_token =
//     'EABBnK2ezLU4BAPMqJTrZBfj25FobRofEhNGyrcMNWiesNyqwvVM8OOyPLvkbQJCzrNWP9xVlb1X5t2yn3mJkOVTmnRridWNOzgHZB7KZArZAsiC0FQHcQ3nIX7DAkINd7HAvg20D7J75b0AXGJXgLWntmkQuYpHXyhrEQdJ3uSsxMZBZAZCNj5w';
//   axios
//     .get(`https://graph.facebook.com/jerumpgalang12/accounts?access_token=${user_access_token}`)
//     .then(function (response) {
//       console.log(response);
//     });
// });

app.get('/', function (req, res) {
  console.log(req);
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get('/test', function (req, res) {
  const axios = require('axios');

  // Set up the URL and data for the API request
  const url = `https://graph.facebook.com/v16.0/${APP_ID}/subscriptions`;
  //https://graph.facebook.com/v16.0/4617035748420942/subscriptions?access_token=${PAGE_ACCESS_TOKEN}
  const data = {
    object: 'marketplace',
    callback_url: 'https://nodejs-fb-marketplace.vercel.app/webhook2',
    fields: 'id,title,description,price,currency,condition,availability,images,url,category',
    include_values: true,
    location_types: 'home',
    verify_token: VERIFY_TOKEN,
    access_token: PAGE_ACCESS_TOKEN,
    subscribed_fields: 'feed',
    //fields: 'id,from,message,link,attachments',
    //include_values: true,
    //verify_token: VERIFY_TOKEN,
    //callback_url: 'https://nodejs-fb-marketplace.vercel.app/webhook2',
  };

  // Set up the Axios request config
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      app_secret: APP_SECRET,
    },
  };

  // Make the API request
  axios
    .post(url, data, config)
    .then((response) => {
      console.log('Successfully subscribed to the Marketplace API:', response.data);
      res.send({ success: true, response });
    })
    .catch((error) => {
      console.error('Failed to subscribe to the Marketplace API:', error.response.data);
      res.send({ success: false, message: error.response.data });
    });
});

app.get('/marketplace', function (req, res) {
  // console.log(req);
  // res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
  // const PAGE_ACCESS_TOKEN =
  //   'EABBnK2ezLU4BADGai3yVysJ1Xg7OYOZCLwO97Yqab45Hw9KQ7ykkIIA0GjZCteZAhMZBe5jK4qNOZBDb1zOG3whvnZBypQqA8ZBNNWjZCZChp9xN9nEwO3ZAMc8iMpEw2kbRff9yoxHRBkN3wWwpneo09eJeZAUeZCI7wjKsaci3nuxR1cZBSVkKHXf1rfEcidonmn7ouZBMym1vheKwZDZD';
  // const PAGE_ACCESS_TOKEN = '4617035748420942|lr0--Ut2WHpiXTNK4OUAB5E3CmU';
  // const APP_SECRET = '73aad193ac7831bf6e25dc64805db899';
  // // Replace with your server URL and Webhooks endpoint
  // const SERVER_URL = 'https://your-server-url.com';
  // const WEBHOOKS_ENDPOINT = '/webhooks/facebook';
  // const VERIFY_TOKEN = 'token';
  // console.log('here');
  // // Subscribe to Marketplace Webhooks
  // axios
  //   .post(
  //     `https://graph.facebook.com/v16.0/4617035748420942/subscriptions?access_token=${PAGE_ACCESS_TOKEN}`,
  //     {
  //       object: 'marketplace',
  //       callback_url: 'https://nodejs-fb-marketplace.vercel.app/',
  //       fields: 'id,title,description,price,currency,condition,availability,images,url,category',
  //       include_values: true,
  //       location_types: 'home',
  //       verify_token: token,
  //     }
  //   )
  //   .then((response) => {
  //     console.log('Subscribed to Marketplace Webhooks:', response.data);
  //   })
  //   .catch((error) => {
  //     console.error(
  //       'Failed to subscribe to Marketplace Webhooks:',
  //       error.response.data.error.message
  //     );
  //   });
  // res.send({ success: true });
});

app.get('/webhook2', function (req, res) {
  // Verify the callback URL by checking the hub.mode and hub.verify_token parameters
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'token') {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
});

app.get('/webhook', (req, res) => {
  // Your verify token. Should be a random string.

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Define the endpoint for handling incoming updates
app.post('/webhook', (req, res) => {
  // Check that the request is authentic by validating the X-Hub-Signature header
  const signature = req.headers['x-hub-signature'];
  if (!signature) {
    console.error('No X-Hub-Signature header found.');
    res.sendStatus(403);
    return;
  }

  const expectedSignature =
    'sha1=' + crypto.createHmac('sha1', APP_SECRET).update(JSON.stringify(req.body)).digest('hex');
  if (signature !== expectedSignature) {
    console.error('Invalid X-Hub-Signature header.');
    res.sendStatus(403);
    return;
  }

  // Process the incoming updates
  const entries = req.body.entry;
  entries.forEach((entry) => {
    const changes = entry.changes;
    changes.forEach((change) => {
      console.log('Received update:', change.value);
      // Process the update as needed
    });
  });

  // Send a success response to Facebook
  res.sendStatus(200);
});

app.get(['/facebook', '/instagram'], function (req, res) {
  if (req.query['hub.mode'] == 'subscribe' && req.query['hub.verify_token'] == token) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post('/facebook', function (req, res) {
  console.log('Facebook request body:', req.body);

  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('request header X-Hub-Signature validated');
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post('/instagram', function (req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.listen();

// Export the Express API
module.exports = app;
