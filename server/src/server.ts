import express from "express" 
import rota from "./routes"
import path from "path"
import cors from "cors"
import { errors } from "celebrate"
import 'dotenv/config'


const app = express()

app.use(cors())
app.use(express.json())
app.use(rota)

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")))

app.use(errors())

app.listen(process.env.PORT || 3333)