const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9o8rsbr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const spotCollection = client.db("torism_management").collection("touristSpot");

        app.get('/tourist-spots', async (req, res) => {
            try {
                const spots = await spotCollection.find().toArray();
                res.json(spots);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/tourist-spots/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const spot = await spotCollection.findOne({ _id: new ObjectId(id) });
                res.json(spot);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/country-spots/:country', async (req, res) => {
            const country = req.params.country;
            console.log(country);
            const touristSpots = await spotCollection.find({ country_name: country }).toArray();
            console.log(touristSpots)
            res.json(touristSpots);
        });

        app.post('/add-spot', async(req, res) => {
            const spot = req.body;
            const result = await spotCollection.insertOne(spot);
            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
