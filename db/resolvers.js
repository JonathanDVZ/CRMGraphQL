const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');
const Order = require('../models/Order');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: 'variables.env' });

const createToken = (user, secret, expiresIn) => {
    const { id, email, name, lastname } = user;

    return jwt.sign({ id, email, name, lastname }, secret, { expiresIn })
}

//resolvers
const resolvers = {
    Query: {
        getUser: async (_, {}, ctx) => {
            return ctx.user;
        },
        getProducts: async () => {
            try {
                const products = await Product.find({});
                return products;
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        },
        getProduct: async (_, { id }) => {
            try {
                //Check if product exists
                const product = await Product.findById(id);
                
                if(!product){
                    throw new Error("Product doesn't exist")
                }
    
                return product;        
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        },
        getClients: async () => {
            try {
                const clients = await Client.find({});

                return clients;
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        },
        getClientsSeller: async (_, {}, ctx) => {
            try {                
                const clients = await Client.find({ seller: ctx.user.id.toString() });

                return clients;
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        },
        getClient: async (_, { id }, ctx) =>{
            try {
                //Check if client exist
                const client = await Client.findById(id);

                if(!client){
                    throw new Error("Client not found");
                }

                //Check seller authorization
                if(client.seller.toString() !== ctx.user.id){
                    throw new Error("You don't have the authorization to see this client");
                }

                return client;
                
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        },
        getOrders: async () => {
            try {
                const orders = await Order.find({});
                
                return orders;
            } catch (error) {
                console.error(error);
                throw new Error(error);                
            }
        },
        getOrdersSeller: async (_, {}, ctx) => {
            try {
                const orders = await Order.find({ seller: ctx.user.id }).populate('client');
                
                return orders;
            } catch (error) {
                console.error(error);
                throw new Error(error);   
            }
        },
        getOrder: async (_, { id }, ctx) => {
            try {
                //check if order exist
                const order = await Order.findById(id);

                if(!order){
                    throw new Error('Order not found');   
                }
                
                //Check seller authorization
                if(order.seller.toString() !== ctx.user.id){
                    throw new Error("You don't have the authorization to see this order");
                }

                //return
                return order;
            } catch (error) {
                console.error(error);
                throw new Error(error);   
                
            }
        },
        getOrderByStatus: async (_, { status }, ctx) => {
            try {
                const orders = await Order.find({ seller: ctx.user.id, status });

                return orders;
            } catch (error) {
                console.error(error);
                throw new Error(error);   
            }
        },
        bestClients: async () => {
            try {
                const clients = await Order.aggregate([
                    { $match : { status : 'COMPLETED' } },
                    { $group : {
                        _id: '$client',
                        total: { $sum: '$total' }
                    }},
                    {
                        $lookup: {
                            from: 'clients',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'client'
                        }
                    },
                    {
                        $limit: 10
                    },
                    {
                        $sort: { total: -1 }
                    }
                ]);

                return clients;
            } catch (error) {
                console.error(error);
                throw new Error(error);                
            }
        },
        bestSellers: async () => {
            try {
                const sellers = await Order.aggregate([
                    { $match : { status : 'COMPLETED' } },
                    { $group : {
                        _id: "$seller",
                        total: { $sum: "$total" }
                    }},
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id",
                            foreignField: "_id",
                            as: "seller"
                        }
                    },
                    {
                        $limit: 3
                    },
                    {
                        $sort: { total: -1 }
                    }
                ]);
                
                return sellers;
            } catch (error) {
                console.error(error);
                throw new Error(error);   
            }
        },
        searchProduct: async (_, { text }) => {
            try {
                const prodct = await Product.find({ $text: { $search: text } }).limit(10);

                return prodct;
            } catch (error) {
                console.error(error);
                throw new Error(error);  
            }
        }
    },
    Mutation: {
        newUser: async (_, { input }) => {
            try {
                const { email, password } = input;

                //Check if user exists
                const existsUser = await User.findOne({email});
                if(existsUser){
                    throw new Error('The user already exists');
                }

                //Password hash
                const salt = await bcryptjs.genSalt(10);
                input.password = await bcryptjs.hash(password, salt);

                //Save user in data base
                const user = new User(input);
                user.save(); 
                return user;
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        },
        authenticateUser: async (_, { input }) => {
            try {                
                const { email, password } = input;

                //Check if user exists
                const existsUser = await User.findOne({email});
                if(!existsUser){
                    throw new Error("The user doesn't exist");
                }

                //Check password if correct
                const correctPassword = await bcryptjs.compare( password, existsUser.password );
                if(!correctPassword){
                    throw new Error('Password is incorrect');
                }

                //Create token
                return{
                    token: createToken(existsUser, process.env.SECRET, '24h')
                }
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        },
        newProduct: async (_, { input }) => {
            try {
                const newProduct = new Product(input);

                //Save in data base
                const result = await newProduct.save();

                return result;
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        },
        updateProduct: async (_, { id, input }) => {
            try {
                //Check if product exists
                let product = await Product.findById(id);
                
                if(!product){
                    throw new Error("Product doesn't exist")
                }
    
                //Save product in data base
                product = await Product.findByIdAndUpdate({ _id: id }, input, { new: true });
                
                return product;
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        },
        deleteProduct: async (_, { id }) => {
            try {
                //Check if product exists
                const product = await Product.findById(id);

                if(!product){
                    throw new Error("Product doesn't exist");
                }

                //Delete
                await Product.findByIdAndDelete({ _id: id });
                
                return 'Product deleted!';
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        },
        newClient: async (_, { input }, ctx) => {
            try {
                const { email } = input;
                //Check if client exist
                const client = await Client.findOne({ email });

                if(client){
                    throw new Error('Client is already exist');
                }

                const newClient = new Client(input);
                
                //Assign seller
                newClient.seller = ctx.user.id;

                //Save in data base
                const result = await newClient.save();

                return result;
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }

        },
        updateClient: async (_, { id, input }, ctx) => {
            try {
                //Check if client exist
                let client = await Client.findById(id);

                if(!client){
                    throw new Error("Client not found");
                }

                //Check seller authorization
                if(client.seller.toString() !== ctx.user.id){
                    throw new Error("You don't have the authorization to see this client");
                }

                //Save client
                client = await Client.findOneAndUpdate({ _id: id }, input, { new: true });
                return client;
                
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        },
        deleteClient: async (_, { id }, ctx) => {
            try {
                //Check if client exist
                const client = await Client.findById(id);

                if(!client){
                    throw new Error("Client not found");
                }

                //Check seller authorization
                if(client.seller.toString() !== ctx.user.id){
                    throw new Error("You don't have the authorization to see this client");
                }

                //Delete client
                await Client.findOneAndDelete({ _id: id });
                return 'Client deleted!';                
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }

        },
        newOrder: async (_, { input }, ctx) => {
            try {
                const idClient = input.client;

                //Check if client exist
                const client = await Client.findById(idClient);

                if(!client){
                    throw new Error("Client not found");
                }

                //Check seller authorization
                if(client.seller.toString() !== ctx.user.id){
                    throw new Error("You don't have the authorization to see this client");
                }

                //Check stock
                let total = 0;
                for await (const item of input.order) {
                    const { id, quantity } = item;

                    const product = await Product.findById(id);

                    if(quantity > product.existence){
                        throw new Error(`Not enough ${ product.name } items`);
                    }
                    else{
                        //Subtract quantity of products
                        product.existence = product.existence - quantity;
                        total = product.price * quantity;

                        await product.save();
                    }
                };

                //Create new order
                const newOrder = new Order(input);

                //Assign a seller, status and total
                newOrder.seller = ctx.user.id;
                newOrder.total = total;
                newOrder.status = "PENDING";

                //Save in data base
                const result = await newOrder.save();

                return result;
                
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        },
        updateOrder: async (_, { id, input }, ctx) => {
            try {
                //Check if order exist
                const order = await Order.findById(id);

                if(!order){
                    throw new Error("Order don't exist")
                }

                //Check if client exist
                const idClient = input.client;
                const client = await Client.findById(idClient);

                if(!client){
                    throw new Error("Client not found");
                }

                //Check seller authorization
                if(order.seller.toString() !== ctx.user.id){
                    throw new Error("You don't have the authorization to see this client");
                }

                //Check stock
                if(input.order){
                    for await (const item of input.order) {
                        const { id, quantity } = item;
    
                        const product = await Product.findById(id);
    
                        if(quantity > product.existence ){
                            throw new Error(`Not enough ${ product.name } items`);
                        }
                        else{
                            //Subtract quantity of products
                            product.existence = product.existence - quantity;
                            total = product.price * quantity;
    
                            await product.save();
                        }
                    };
                }

                //Save in data base
                const result = await Order.findOneAndUpdate({ _id: id }, input, { new: true });

                return result;
                
            } catch (error) {
                console.error(error);
                throw new Error(error);
                
            }
        },
        deleteOrder: async (_, { id }, ctx) => {
            try {
                //Check if order exist
                const order = await Order.findById(id);

                if(!order){
                    throw new Error("Order don't exist")
                }

                //Check seller authorization
                if(order.seller.toString() !== ctx.user.id){
                    throw new Error("You don't have the authorization to see this client");
                }

                //Delete order
                await Order.findOneAndDelete({ _id: id });

                return "Order deleted!";
                
            } catch (error) {
                console.error(error);
                throw new Error(error);           
            }
        }
    }
}

module.exports = resolvers;