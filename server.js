const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

const connectionString = 'mongodb+srv://zikrya8:ygsnYgWwdZRBs8Fw@cluster0.orrapws.mongodb.net/?retryWrites=true&w=majority';


const client = new MongoClient(connectionString, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

let db;

async function run() {
    try {
        await client.connect();
        console.log('Connected to Database');

        // Here we select the "star-wars-quotes" database
        db = client.db('star-wars-quotes');

        app.get('/', async (req, res) => {
            const quotesCollection = db.collection('quotes');
            const quotes = await quotesCollection.find().toArray();
            res.render('index.ejs', { quotes: quotes });
        });

        app.post('/quotes', (req, res) => {
            const quotesCollection = db.collection('quotes');
            quotesCollection.insertOne(req.body)
                .then(result => {
                    console.log(result);
                    res.redirect('/');
                })
                .catch(error => console.error(error));
        });

        app.put('/quotes', (req, res) => {
            const quotesCollection = db.collection('quotes');
            // Here we update the first quote by Yoda with a quote from Darth Vader
            quotesCollection.findOneAndUpdate(
                { name: 'Yoda' },
                {
                    $set: {
                        name: req.body.name,
                        quote: req.body.quote
                    }
                },
                {
                    upsert: true
                }
            )
            .then(result => {
                console.log(result);
                res.json('Success');
            })
            .catch(error => console.error(error));
        });

        app.delete('/quotes', (req, res) => {
            const quotesCollection = db.collection('quotes');
            quotesCollection
                .deleteOne({ name: req.body.name })
                .then(result => {
                    if (result.deletedCount === 0) {
                        return res.json('No quote to delete');
                    }
                    res.json(`Deleted Darth Vader's quote`);
                })
                .catch(error => console.error(error));
        });

        app.listen(process.env.PORT || 3000, function () {
            console.log('listening on 3000');
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

run().catch(console.dir);


