const path = require('path')
const express = require('express')
const xss = require('xss')
const ProductsService = require('./pricelist-service')

const pricelistRouter = express.Router()
const jsonParser = express.json()

const serializePrice = price => ({
  id: price.id,
  product_id: xss(price.product_id),
  vendor_id: xss(price.vendor_id),
  price: xss(price.price),
  units: price.units
})

pricelistRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    ProductsService.getAllPrices(knexInstance)
      .then(pricelist => {
        res.json(pricelist.map(serializePrice))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { product_id, vendor_id, price, units } = req.body
    const newProduct = { product_id, vendor_id, price, units }

    for (const [key, value] of Object.entries(newPrice))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    PricelistService.insertProduct(
      req.app.get('db'),
      newPrice
    )
      .then(price => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${price.id}`))
          .json(serializePrice(price))
      })
      .catch(next)
  })

pricelistRouter
  .route('/:price_id')
  .all((req, res, next) => {
    ProductsService.getById(
      req.app.get('db'),
      req.params.price_id
    )
      .then(price => {
        if (!price) {
          return res.status(404).json({
            error: { message: `Price doesn't exist` }
          })
        }
        res.price = price
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializePrice(res.price))
  })

module.exports = pricelistRouter