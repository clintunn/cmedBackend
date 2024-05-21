const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Campus-Med:o3jrR4A5GGurKR1N@cluster0.umrdntl.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
});
