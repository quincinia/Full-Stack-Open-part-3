// Mongoose boilerplate
const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}
  
const password = process.argv[2]

const url = 
    `mongodb+srv://FSO:${password}@cluster0.cccin.mongodb.net/phonebook?retryWrites=true&w=majority`

// An exception will be thrown on bad password
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

// If only the password was given, then print all entries
// Otherwise, a new name is being added
if (process.argv.length === 3) {
    console.log('phonebook:')
    Person.find({}).then(persons => {
        persons.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
} else {
    // Grab the name of the person
    let name = process.argv[3]

    // Grab the full name (if needed)
    if (name?.at?.(0) === '"') {
        // Storing the parts of the name in an array
        let fullName = [name]

        // Grab the full name
        for (let i = 4; i < process.argv.length; i++) {
            fullName.push(process.argv[i])
            if (process.argv[i].at(-1) === '"') break
        }
        
        // Join all the parts, and remove the quotes
        name = fullName.join(' ').replace('"', '')
    }

    // Grab the number (should be the last argument)
    let number = process.argv[process.argv.length - 1]

    // Save the new person into the DB
    const person = new Person({ name, number })
    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}