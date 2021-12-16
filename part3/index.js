const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const app = express()

app.use(cors())
app.use(express.json())
app.use(
    morgan("tiny", {
        skip: (req, res) => req.method === "POST",
    })
)

// global variables
let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122",
    },
]

// route handlers
app.get("/api/persons", (req, res) => {
    res.json(persons)
})

app.get("/api/persons/:id", (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find((item) => item.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete("/api/persons/:id", (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter((item) => item.id !== id)

    res.status(204).end()
})

app.get("/info", (req, res) => {
    res.send(
        `<div>Phonebook has info for ${persons.length} people</div>
        <br />
        <div>${new Date().toString()}</div>`
    )
})

morgan.token("POST-Data", (req, res) => {
    return JSON.stringify(req.body)
})

app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :POST-Data"
    )
)

app.post("/api/persons", (req, res) => {
    const info = req.body
    // console.log(info)

    // require that both fields be filled out
    if (!info.name || !info.number) {
        return res.status(400).json({ error: "content missing" })
    }

    // new person cannot create name conflict
    if (persons.some((item) => item.name === info.name)) {
        return res.status(400).json({ error: "name must be unique" })
    }

    // generates an int from [min, max]
    function genInt(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    let newId = genInt(1, 10000)
    while (persons.some((item) => item.id === newId)) {
        newId = genInt(1, 10000)
    }

    const newPerson = {
        id: newId,
        name: info.name,
        number: info.number,
    }

    persons = persons.concat(newPerson)

    res.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is live on port ${PORT}`)
    console.log(`http://localhost:${PORT}`)
})
