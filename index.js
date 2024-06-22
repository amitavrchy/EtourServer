const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9o8rsbr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        app.post('/add-spot', async (req, res) => {
            const spot = req.body;
            const result = await spotCollection.insertOne(spot);
            res.send(result);
        })

        app.get('/spots/:email', async (req, res) => {
            const { email } = req.params;
            try {
                const spots = await spotCollection.find({ user_email: email }).toArray();
                res.json(spots);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });

        app.put('/spots/:id', async (req, res) => {
            const { id } = req.params;
            const updatedSpot = req.body;
            const filter = {_id: new ObjectId(id)}
            const updatedData = {
                $set: {
                    tourist_spot_name: updatedSpot.tourist_spot_name,
                    user_name: updatedSpot.user_name,
                    user_email: updatedSpot.user_email,
                    totalVisitorsPerYear: updatedSpot.totalVisitorsPerYear,
                    travel_time: updatedSpot.travel_time,
                    seasonality: updatedSpot.seasonality,
                    average_cost: updatedSpot.average_cost,
                    location: updatedSpot.location,
                    image: updatedSpot.image,
                    country_name: updatedSpot.country_name,
                    short_description: updatedSpot.short_description,
                }
            }
            const result = await spotCollection.updateOne(filter, updatedData);
            res.send(result);
        });

        app.delete('/spots/:id', async(req,res) => {
            const { id } = req.params;
            const filter = {_id: new ObjectId(id)};
            const result = await spotCollection.deleteOne(filter);
            res.send(result);
        })
    } finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
