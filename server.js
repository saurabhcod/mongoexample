const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connection URL and database name
const url = 'mongodb+srv://saurabhandani:saurabhandani@cluster0.qyakbnq.mongodb.net';
const dbName = 'saurabh';

// Serve the HTML files
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));



// Create a schema for the data
const dataSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});
// Create a model for the data
const Data = mongoose.model('Data', dataSchema);

app.get('/login', (req, res) => {
  res.redirect('login.html');
});

// Connect to the MongoDB database
mongoose.connect(`${url}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to the database');

    //Post Method start.............................   
    app.post('/submit-form', async (req, res) => {
      const { username, email, password } = req.body;

      try {
        // Check if the username or email is already registered
        const existingUser = await Data.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
          return res.render('register', { error: 'Username or email already exists' });
        }

        // Hash the password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new Data({ username, email, password: hashedPassword });
        await newUser.save();

        return res.redirect('/login.html');
      } catch (error) {
        console.error('Failed to register user:', error);
        return res.redirect('/error.html');
      }
    });

    //Post Method End......................
    //Get Method Start.....................
    // Login route
    app.get('/login', (req, res) => {
      return res.redirect('/dashboard.html');
    });

    app.post('/login', async (req, res) => {
      const { username, password } = req.body;

      try {
        // Find the user by username
        const user = await Data.findOne({ username });
        if (!user) {
          return res.render('login', { error: 'Invalid username or password' });
        }

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.render('login', { error: 'Invalid username or password' });
        }

        return res.redirect('/dashboard.html');
      } catch (error) {
        console.error('Failed to login:', error);
        res.render('login', { error: 'Failed to login' });
      }
    });

    //Get Method End......................................

    // app.put('/update/:id',async (req, res) => {
    //   const { id } = req.params;
    //   const { username, email} = req.body;

    //   try {
    //     const updateuser = await Data.findByIdAndUpdate(id, {username, email},{new: true});
    //     if (!updateuser){
    //       return res.status(404).json({message:`cannot update user with id ${id}`});
    //     }

    //     return res.json({success: true,message: `user updated successfully`, user: updateuser});
    //   }catch(error){
    //     console.error(error);
    //     res.status(500).json({success: false,message:`internal server error`});
    //   }
    // });

    app.put('/update/:id', async (req, res) => {
      const  id  = req.params.id;
      const  updates  = req.body;

      try {
        // Find the user by id
        const user = await Data.updateOne({_id:id}, updates);

        
        if(user.nModified === 0) {
          return res.status(404).json({ message: `Cannot find user with id ${id}` });
        }
        

        return res.status(200).json({ success: true, message: 'User updated successfully', user});
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to the database', err);
  });
