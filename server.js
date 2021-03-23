require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const isURL = require('isurl');
const session = require('express-session');
const Database = require("@replit/database");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cors());
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204
app.use(express.json({limit: '50mb'}));

var db = new Database();
var counter=0;

//erase db
db.list().then(function (keys){
  keys.forEach(function(key){
    db.delete(key);
  })
})


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:id', function(req, res) {
  db.get(req.params.id).then(function(value){
  console.log(value);
    if (value)
   { res.redirect(value);}
   else
   {res.json({ error: 'invalid id' }); }
  })
});


// Your first API endpoint
app.post('/api/shorturl/new', function(req, res) {
  // Is it Valud url ?
  let url=new URL(req.body.url)
  if (!isURL(url) || !url.protocol.includes('http'))
   { res.json({ error: 'invalid url' });
   }
   else
   {
    // Is it registered ?
  dns.lookup(url.hostname,{},function (err, addresses) {
    if (err)
    { res.json({ error: 'invalid url' }); 
    }
    else
    {
      if (addresses.length>0)
      {
        counter++;
        db.set(counter,req.body.url);
        res.json({ original_url : req.body.url, short_url : counter});
      }
      else
      {
        res.json({ error: 'invalid url' });
      }
    }

  });
   }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
