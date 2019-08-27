const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeMarketsArray, maliciousMarket, sanitizedMarkets } = require('./markets.fixtures');

describe('Markets Endpoints', () => {
  let db;

  before('Make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db);
  })

  // Good Database Hygiene: Make sure that tables are clear
  // of data before we begin testing, and disconnect from
  // the database after testing is complete
  after('Clean the tables after all', () => db.raw('TRUNCATE price_list, markets, vendors RESTART IDENTITY CASCADE'));
  after('Disconnect from db', () => db.destroy());
  before('Clean the tables before all', () => db.raw('TRUNCATE price_list, markets, vendors RESTART IDENTITY CASCADE'))
  afterEach('Clean tables after each',() => db.raw('TRUNCATE price_list, markets, vendors RESTART IDENTITY CASCADE'))

  describe(`GET /api/markets`, () => {
    context(`Given no markets`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/markets')
          .set('Authorization', `Bearer ${process.env.REACT_APP_API_KEY}`)
          .expect(200, [])
      })
    })

    context('Given there are markets in the database', () => {
      const testMarkets = makeMarketsArray()

      beforeEach('Insert markets', () => {
        return db
          .into('markets')
          .insert(testMarkets)
      })

      afterEach('Clean tables after each',() => db.raw('TRUNCATE price_list, markets, vendors RESTART IDENTITY CASCADE'))

      it('responds with 200 and all of the markets', () => {
        return supertest(app)
          .get('/api/markets')
          .set('Authorization', `Bearer ${process.env.REACT_APP_API_KEY}`)
          .expect(200, testMarkets)
      })
    })

    context(`Given an XSS attack market`, () => {
      beforeEach('insert malicious market', () => {
        return db
          .into('markets')
          .insert([maliciousMarket])
      })

      it('responds with 200 and all of the markets, none of which contains XSS attack content', () => {
        return supertest(app)
          .get('/api/markets')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].market_name).to.eql(sanitizedMarkets[0].market_name)
            expect(res.body[0].content).to.eql(sanitizedMarkets[0].content)
          })
      })
    })
  })

  describe(`GET /api/markets/:market_id`, () => {
    context(`Given no markets`, () => {
      it(`responds with 404`, () => {
        const marketId = 123456
        return supertest(app)
          .get(`/api/markets/${marketId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `Market doesn't exist` } })
      })
    })

    context('Given there are markets in the database', () => {
      const testMarkets = makeMarketsArray()

      beforeEach('Insert markets', () => {
        return db
          .into('markets')
          .insert(testMarkets)
      })

      it('responds with 200 and the specified market', () => {
        const marketId = 2
        const expectedMarket = testMarkets[marketId - 1]
        return supertest(app)
          .get(`/api/markets/${marketId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedMarket)
      })
    })

    context(`Given an XSS attack market`, () => {
      beforeEach('insert malicious market', () => {
        return db
          .into('markets')
          .insert([maliciousMarket])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/markets/${maliciousMarket.id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200)
          .expect(res => {
            expect(res.body.market_location).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
            expect(res.body.summary).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
          })
      })
    })
  })
})