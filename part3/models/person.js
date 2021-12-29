// Mongoose boilerplate; connects to DB and instantiates Person model

const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator') // 'unique' validator

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: { 
        type: String, 
        minLength: 3,
        unique: true, // Only names are unique
        required: true 
    },
    number: { 
        type: String, 
        match: /^\d{3}-\d{7}$/,
        required: true 
    }
})

personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)