import express from "express"
import PointsController from "./controllers/pointsController"
import ItemsController from "./controllers/itemsController"

const itemsController = new ItemsController()
const pointsController = new PointsController()
const rota = express.Router()

rota.get("/items", itemsController.index)

rota.get("/points/:id", pointsController.show)

rota.get("/points", pointsController.index)

rota.post("/points", pointsController.create)

export default rota