process.env.TZ='UTC'
require('dotenv')

const supertest = require('supertest')
const { expect } = require('mocha')

global.expect = expect
global.supertest = supertest