const { expect } = require('chai');
const moment = require('moment');
const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray } = require('./folders.fixtures');


describe('Folders Endpoints', () => {
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
  after('clean the table', () => db.raw('TRUNCATE folders RESTART IDENTITY CASCADE'))
  after('Disconnect from db', () => db.destroy());
  before('clean the table', () => db.raw('TRUNCATE folders RESTART IDENTITY CASCADE'))
  afterEach('cleanup',() => db.raw('TRUNCATE folders RESTART IDENTITY CASCADE'))

  describe(`GET /api/folders`, () => {
    context(`Given no folders`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      })
    })

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray()
      beforeEach('Insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
      })
      it('responds with 200 and all of the folders', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testFolders)
      })
    })

    context(`Given an XSS attack folder`, () => {
      const maliciousFolder = {
        id: 912,
        folder_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
      }
      const sanitizedFolders = [{
        id: 912,
        folder_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      }]
      beforeEach('insert malicious folder', () => {
        return db
          .into('folders')
          .insert([maliciousFolder])
      })
      it('responds with 200 and all of the folders, none of which contains XSS attack content', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200)
          .expect(res => {
            expect(res.body[0].folder_name).to.eql(sanitizedFolders[0].folder_name)
          })
      })
    })
  })

  describe(`GET /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
    })

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray()
      beforeEach('Insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
      })
      it('responds with 200 and the specified folder', () => {
        const folderId = 2
        const expectedFolder = testFolders[folderId - 1]
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(200, expectedFolder)
      })
    })

    context(`Given an XSS attack folder`, () => {
      const maliciousFolder = {
        id: 913,
        folder_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
      }
      beforeEach('insert malicious folder', () => {
        return db
          .into('folders')
          .insert([maliciousFolder])
      })
      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/folders/${maliciousFolder.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.folder_name).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
          })
      })
    })
  })

  describe(`POST /api/folders`, () => {
    it(`creates a folder, responding with 201 and the new folder`, function () {
      this.retries(3);
      const newFolder = {
        folder_name: 'This Is a Test Folder Name',
        folder_id: 9999
      }
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.folder_name).to.eql(newFolder.folder_name)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/folders/${postRes.body.id}`)
            .expect(postRes.body)
        )
    })
    const requiredFields = ['folder_name']

    requiredFields.forEach(field => {
      const newFolder = {
        folder_name: 'This Is a Test Folder Name'
      }
      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newFolder[field]
        return supertest(app)
          .post('/api/folders')
          .send(newFolder)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

    context(`Given an XSS attack folder`, () => {
      it(`removes any XSS attack content, and creates a folder, responding with 201`, function () {
        const maliciousFolder = {
            id: 914,
            folder_name: 'Naughty naughty very naughty <script>alert("xss");</script>'
        }
        return supertest(app)
          .post('/api/folders')
          .send(maliciousFolder)
          .expect(201)
          .expect(res => {
            expect(res.body.folder_name).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
          })
      })
    })
  })
})