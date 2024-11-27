const mongoose = require('mongoose');

const uri = 'mongodb+srv://Ali:Nexus143.@clustername.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected successfully!'))
  .catch(err => console.error('Database connection error:', err));
  const connectToDatabase = require('./db'); // Import the connection logic

  // Call the connection function to test the connection
  connectToDatabase().catch(console.error);
  