const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    order: {
        type: Array,
        require: true
    },
    total: {
        type: Number,
        require: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Client'
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    status: {
        type: String,
        default: "PENDING"
    },
    creationDate: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Order', OrderSchema);