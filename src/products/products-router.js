const path = require('path')
const express = require('express')
const xss = require('xss')
const ProductsService = require('./products-service')

const productsRouter = express.Router()
const jsonParser = express.json()

const serializeProduct = product => ({
  id: product.id,
  product_name: xss(product.product_name),
  product_description: xss(product.product_description),
  product_category: xss(product.kind),
})

productsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    ProductsService.getAllProducts(knexInstance)
      .then(products => {
        res.json(products.map(serializeProduct))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { product_name, product_description, kind } = req.body
    const newProduct = { product_name, product_description, kind }

    for (const [key, value] of Object.entries(newProduct))
      if (value == null && key !== 'product_description')
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    ProductsService.insertProduct(
      req.app.get('db'),
      newProduct
    )
      .then(product => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${product.id}`))
          .json(serializeProduct(product))
      })
      .catch(next)
  })

productsRouter
  .route('/:product_id')
  .all((req, res, next) => {
    ProductsService.getById(
      req.app.get('db'),
      req.params.product_id
    )
      .then(product => {
        if (!product) {
          return res.status(404).json({
            error: { message: `Product doesn't exist` }
          })
        }
        res.product = product
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeProduct(res.product))
  })
  .delete((req, res, next) => {
    ProductsService.deleteProduct(
      req.app.get('db'),
      req.params.product_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { product_description, product_name } = req.body
    const contentToUpdate = { product_description, product_name }

    const numberOfValues = Object.values(contentToUpdate).filter(Boolean).length
    if (numberOfValues == 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'product_description'`
        }
      })

    ProductsService.updateProduct(
      req.app.get('db'),
      req.params.product_id,
      contentToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = productsRouter