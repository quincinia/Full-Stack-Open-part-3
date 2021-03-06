import axios from "axios"
const PORT = process.env.PORT || 3001
const baseUrl = `/api/persons`

const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then((response) => response.data)
}

const create = (newObject) => {
    const request = axios.post(baseUrl, newObject)
    return request.then((response) => response.data)
}

const remove = (id) => {
    const request = axios.delete(`${baseUrl}/${id}`)
    // note sure if there is any actual data to process
    return request.then((response) => response.data)
}

const update = (id, data) => {
    const request = axios.put(`${baseUrl}/${id}`, data)
    return request.then((response) => response.data)
}

export default { getAll, create, remove, update }
