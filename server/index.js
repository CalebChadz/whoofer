//bring in the express library.
const express = require('express');
//bring in the cors module to rid the cors error in chrome
const cors = require('cors');
//we need monk for mongo db stuff
const monk = require('monk');
//a bad words filter to keep things clean
const Filter = require('bad-words');
//bring in a rate limiter
const rateLimit = require('express-rate-limit');


//invoke express to cereate an actual app.
const app = express();
//create database variable for mongodb
const db = monk(process.env.MONGO_URI || 'localhost/whoof');
const woofs = db.get('woofs');
const filter = new Filter();

//add the body parser middleware to parse incoming json data
app.use(express.json());
//use the cors module to allow access
app.use(cors());


//create a response to the get request on /.
app.get('/', (req, res) => {

    //return a jason object that is a message saying Woof.
    res.json({
        message: 'Woof! :)'
    });
});

//a request for all the woofs in the database to display on th webpage.
app.get('/woofs', (req, res) => {
    woofs.find()
        .then(woofs => {
            res.json(woofs);
    });
});

//make sure to use the rate limiter
const limiter = rateLimit({
    windowMs: 30 * 1000, // 30 secconds
    max: 2 // limit each IP to 100 request per windowMS
});
app.use(limiter);

function isValidWoof(woof) {
    //get the name as a string and cut off any whitespace. make sure it isn't empty.
    return woof.name && woof.name.toString().trim() !== '' && 
        woof.content && woof.content.toString().trim() !== ''
}

//a rout for when a woof gets posted to send the data.
app.post('/woofs', (req, res) => {
    //check that what we are recieving does contain the expected values of name and content
    if(isValidWoof(req.body)) {
        //if valid we will put in the DB
        const woof = {
            name: filter.clean(req.body.name.toString()),
            content: filter.clean(req.body.content.toString()),
            created: new Date()
        };

        //everything is valid so insert into database
        woofs.insert(woof).then(createdWoof => {
            res.json(createdWoof);
        });

    } else { 
        //if they havent inculded requred data then send back err response with json message.
        res.status(422);
        res.json({
            message: 'Hey! dont forget the Name and Content :)'
        });
    }

    //when a post request is recieved, log the body of the request.
    console.log(req.body);
    
});

//begin the server on port 5000.
app.listen(5000, () => {
    console.log("listening on port 5000");
});

