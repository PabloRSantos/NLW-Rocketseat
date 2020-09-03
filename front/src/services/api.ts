import axios from "axios"

const api = axios.create({
    baseURL: "https://ecoleta-backend05.herokuapp.com/"
})

export default api