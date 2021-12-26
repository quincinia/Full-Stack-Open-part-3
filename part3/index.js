require('dotenv').config() // pulling from .env
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Person = require('./models/person')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(
    morgan("tiny", {
        skip: (req, res) => req.method === "POST",
    })
)
// global variables
// No longer using local variables to store info
// let persons = [
//     {
//         id: 1,
//         name: "Arto Hellas",
//         number: "040-123456",
//     },
//     {
//         id: 2,
//         name: "Ada Lovelace",
//         number: "39-44-5323523",
//     },
//     {
//         id: 3,
//         name: "Dan Abramov",
//         number: "12-43-234345",
//     },
//     {
//         id: 4,
//         name: "Mary Poppendieck",
//         number: "39-23-6423122",
//     },
// ]

// route handlers
// Get all persons
app.get("/api/persons", (req, res) => {
    // res.json(persons)
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get("/api/persons/:id", (req, res, next) => {
    // No longer using local variables
    // const id = Number(req.params.id)
    // const person = persons.find((item) => item.id === id)

    // if (person) {
    //     res.json(person)
    // } else {
    //     res.status(404).end()
    // }

    const id = req.params.id
    Person.findById(id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.put("/api/persons/:id", (req, res, next) => {
    const id = req.params.id
    const body = req.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(id, person, { new: true })
        .then(updatedPerson => res.json(updatedPerson))
        .catch(error => next(error))
})

app.delete("/api/persons/:id", (req, res, next) => {
    // No longer using local variables
    // const id = Number(req.params.id)
    // persons = persons.filter((item) => item.id !== id)

    const id = req.params.id
    Person.findByIdAndDelete(id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.get("/info", async (req, res, next) => {
    let count = 0
    let good = true // In case an error occurred
    await Person.countDocuments({})
        .then(result => count = result)
        .catch(error => {
            next(error)
            good = false
        })
    if (good) {
        res.send(
            `<div>Phonebook has info for ${count} people</div>
            <br />
            <div>${new Date().toString()}</div>`
        )
    }
})

morgan.token("POST-Data", (req, res) => {
    return JSON.stringify(req.body)
})

app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :POST-Data"
    )
)

// Add new person
app.post("/api/persons", async (req, res, next) => {
    const info = req.body
    // console.log(info)

    // require that both fields be filled out
    if (!info.name || !info.number) {
        return res.status(400).json({ error: "content missing" })
    }

    // new person cannot create name conflict
    // if (persons.some((item) => item.name === info.name)) {
    //     return res.status(400).json({ error: "name must be unique" })
    // }

    // Flag needed so that we end early
    // We cannot end (using the 'return' keyword) from inside the promise handlers, so we will set a flag to do that for us
    let endResponse = false
    // Checking for name conflicts using MongoDB
    await Person.exists({ name: info.name })
        .then(result => {
            // Duplicate name exists
            if (result) {
                res.status(400).json({ error: "name must be unique" })
                endResponse = true
            }
        })
        .catch(error => {
            next(error)
            endResponse = true
        })
    if (endResponse === true) return
    // Obsolete since MongoDB uses its own indexes
    // generates an int from [min, max]
    // function genInt(min, max) {
    //     min = Math.ceil(min)
    //     max = Math.floor(max)
    //     return Math.floor(Math.random() * (max - min + 1) + min)
    // }

    // let newId = genInt(1, 10000)
    // while (persons.some((item) => item.id === newId)) {
    //     newId = genInt(1, 10000)
    // }

    const newPerson = new Person({ name: info.name, number: info.number })

    // No longer using local variables
    // persons = persons.concat(newPerson)


    // res.json(newPerson)

    newPerson.save()
        .then(result => {
            console.log(`added ${info.name} number ${info.number} to phonebook`)
            // save() returns the saved object
            res.json(result)
        })
        .catch(error => next(error))
})

// For getting an individual id
const castErrorHandler = (error, req, res, next) => {
    if (error.name === 'CaseError') {
        console.error(error.message)
        return response.status(400).send({ error: 'malformatted id' })
    }
    next(error)
}
app.use(castErrorHandler)

// Default error handler (usually considered for DB errors)
const errorHandler = (error, req, res, next) => {
    console.error(error.message)
    return res.status(400).json({ error: "DB error" })
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is live on port ${PORT}`)
    console.log(`http://localhost:${PORT}`)
})
