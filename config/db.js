const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

const conectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log('DB conected!');
    } catch (error) {
        console.error('Error!');
        console.error(error);
    }
}

module.exports = conectDB;