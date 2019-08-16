const path = require('path')
const express = require('express')
const xss = require('xss')
const MarketsService = require('./markets-service')

const marketsRouter = express.Router()
const jsonParser = express.json()

const serializeMarket = market => ({
  id: market.id,
  market_name: xss(market.market_name),
  hero_image: xss(market.hero_image),
  schedule: xss(market.schedule),
  market_location: xss(market.market_location),
  summary: xss(market.summary),
  market_description: xss(market.market_description)
})

marketsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    MarketsService.getAllMarkets(knexInstance)
      .then(markets => {
        res.json(markets.map(serializeMarket))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { market_name, hero_image, schedule, market_location, summary, market_description } = req.body
    const newMarket = { 
      market_name,
      hero_image,
      schedule,
      market_location,
      summary,
      market_description
    }

    for (const [key, value] of Object.entries(newMarket))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    MarketsService.insertMarket(
      req.app.get('db'),
      newMarket
    )
      .then(market => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${market.id}`))
          .json(serializeMarket(market))
      })
      .catch(next)
  })

marketsRouter
  .route('/:market_id')
  .all((req, res, next) => {
    MarketsService.getById(
      req.app.get('db'),
      req.params.market_id
    )
      .then(market => {
        if (!market) {
          return res.status(404).json({
            error: { message: `Market doesn't exist` }
          })
        }
        res.market = market
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeMarket(res.market))
  })

module.exports = marketsRouter