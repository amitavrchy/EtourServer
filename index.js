const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB URI and Global Client Instance
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9o8rsbr.mongodb.net/?retryWrites=true&w=majority`;

let client;
let spotCollection;

// Function to Initialize MongoDB Client
async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });

        await client.connect(); // Connect only once
        spotCollection = client.db("torism_management").collection("touristSpot");
        console.log("Connected to MongoDB");
    }
}

// API Endpoints
app.get('/tourist-spots', async (req, res) => {
    try {
        await connectToDatabase(); // Ensure MongoDB connection
        const spots = await spotCollection.find().toArray();
        res.json(spots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/tourist-spots/:id', async (req, res) => {
    try {
        await connectToDatabase(); // Ensure MongoDB connection
        const id = req.params.id;
        const spot = await spotCollection.findOne({ _id: new ObjectId(id) });
        res.json(spot);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/country-spots/:country', async (req, res) => {
    try {
        await connectToDatabase(); // Ensure MongoDB connection
        const country = req.params.country;
        const touristSpots = await spotCollection.find({ country_name: country }).toArray();
        res.json(touristSpots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/add-spot', async (req, res) => {
    try {
        await connectToDatabase(); // Ensure MongoDB connection
        const spot = req.body;
        const result = await spotCollection.insertOne(spot);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/spots/:email', async (req, res) => {
    try {
        await connectToDatabase(); // Ensure MongoDB connection
        const { email } = req.params;
        const spots = await spotCollection.find({ user_email: email }).toArray();
        res.json(spots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/spots/:id', async (req, res) => {
    try {
        await connectToDatabase(); // Ensure MongoDB connection
        const { id } = req.params;
        const updatedSpot = req.body;
        const filter = { _id: new ObjectId(id) };
        const updatedData = {
            $set: {
                tourist_spot_name: updatedSpot.tourist_spot_name,
                user_name: updatedSpot.user_name,
                user_email: updatedSpot.user_email,
                totalVisitorsPerYear: updatedSpot.totalVisitorsPerYear,
                travel_time: updatedSpot.travel_time,
                seasonality: updatedSpot.seasonality,
                average_cost: parseInt(updatedSpot.average_cost),
                location: updatedSpot.location,
                image: updatedSpot.image,
                country_name: updatedSpot.country_name,
                short_description: updatedSpot.short_description,
            },
        };
        const result = await spotCollection.updateOne(filter, updatedData);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/spots/:id', async (req, res) => {
    try {
        await connectToDatabase(); // Ensure MongoDB connection
        const { id } = req.params;
        const filter = { _id: new ObjectId(id) };
        const result = await spotCollection.deleteOne(filter);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Server is Running');
});

module.exports = app;
