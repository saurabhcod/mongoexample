const express = require('express');
const {MongoClient} = require('mongodb');
const app = express();
const port = 3000;
const mongoose = require('mongoose');


// Connection URL and database name
const url = 'mongodb+srv://saurabhandani:saurabhandani@cluster0.qyakbnq.mongodb.net';
const dbName = 'saurabh';

// Serve the HTML files
app.use(express.static('public'));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));


// Create a schema for the data
const dataSchema = new mongoose.Schema({
  input1: String,
  input2: String
});
// Create a model for the data
const Data = mongoose.model('Data', dataSchema);


// Connect to the MongoDB database
mongoose.connect(`${url}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to the database');

    // Handle POST request
    app.post('/submit-form', (req, res) => {
      const { input1, input2 } = req.body;

      // Create a new data document
      const newData = new Data({
        input1,
        input2
      });

      // Save the data document
      newData.save()
        .then(() => {
          console.log('Data stored successfully');
          return res.redirect('/success.html');
        })
        .catch(err => {
          console.error('Error storing data', err);
          return res.redirect('/error.html');
        });
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to the database', err);
  });
