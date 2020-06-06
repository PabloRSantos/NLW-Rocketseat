import express from "express"
import PointsController from "./controllers/pointsController"
import ItemsController from "./controllers/itemsController"
import multer from "multer"
import multerConfig from "./config/multer"
import { celebrate, Joi } from "celebrate"

const itemsController = new ItemsController()
const pointsController = new PointsController()
const rota = express.Router()
const upload = multer(multerConfig)

rota.get("/items", itemsController.index)

rota.get("/points/:id", pointsController.show)

rota.get("/points", pointsController.index)

rota.post("/points",
 upload.single("image"),
 celebrate({
     body: Joi.object().keys({
         name: Joi.string().required(),
         email: Joi.string().required().email(),
         whatsapp: Joi.string().required(),
         latitude: Joi.number().required(),
         longitude: Joi.number().required(),
         city: Joi.string().required(),
         uf: Joi.string().required().max(2),
         items: Joi.string().required(),
     })
 }, {
     abortEarly: false //valida todos ao msm tempo
 }),
 pointsController.create)//single = 1 upload array = varios uploads

export default rota