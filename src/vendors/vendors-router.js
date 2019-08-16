const path = require('path')
const express = require('express')
const xss = require('xss')
const VendorsService = require('./vendors-service')

const vendorsRouter = express.Router()
const jsonParser = express.json()

const serializeVendor = vendor => ({
  id: vendor.id,
  vendor_name: xss(vendor.vendor_name),
  vendor_description: xss(vendor.vendor_description),
  market_stall: xss(vendor.market_stall),
  market_id: vendor.market_id
})

vendorsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    VendorsService.getAllVendors(knexInstance)
      .then(vendors => {
        res.json(vendors.map(serializeVendor))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { vendor_name, vendor_description, market_stall, market_id } = req.body
    const newVendor = { vendor_name, vendor_description, market_stall, market_id }

    for (const [key, value] of Object.entries(newVendor))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    VendorsService.insertVendor(
      req.app.get('db'),
      newVendor
    )
      .then(vendor => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${vendor.id}`))
          .json(serializeVendor(vendor))
      })
      .catch(next)
  })

vendorsRouter
  .route('/:vendor_id')
  .all((req, res, next) => {
    VendorsService.getById(
      req.app.get('db'),
      req.params.vendor_id
    )
      .then(vendor => {
        if (!vendor) {
          return res.status(404).json({
            error: { message: `Vendor doesn't exist` }
          })
        }
        res.vendor = vendor
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeVendor(res.vendor))
  })

module.exports = vendorsRouter