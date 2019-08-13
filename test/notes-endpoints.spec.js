const { expect } = require('chai');
const moment = require('moment');
const knex = require('knex');
const app = require('../src/app');
const { makeNotesArray } = require('./notes.fixtures');
const { makeFoldersArray } = require('./folders.fixtures');


describe('Notes Endpoints', () => {
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
  after('Clean the notes table', () => db('notes').truncate());
  after('clean the table', () => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))
  after('Disconnect from db', () => db.destroy());
  before('clean the table', () => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))
  afterEach('cleanup',() => db.raw('TRUNCATE notes RESTART IDENTITY CASCADE'))

  before('Insert folders', () => {
    const testFolders = makeFoldersArray()
    return db
      .into('folders')
      .insert(testFolders)
  })

  describe(`GET /api/notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, [])
      })
    })

    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()

      beforeEach('Insert notes', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })
      afterEach('Clean the notes table', () => db('notes').truncate());

      it('responds with 200 and all of the notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testNotes)
      })
    })

    context(`Given an XSS attack note`, () => {
      const maliciousNote = {
        id: 911,
        folder_id: 2,
        note_title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      }

      const sanitizedNotes = [{
        id: 911,
        folder_id: 2,
        note_title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
      }]

      beforeEach('insert malicious note', () => {
        return db
          .into('notes')
          .insert([maliciousNote])
      })

      it('responds with 200 and all of the notes, none of which contains XSS attack content', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200)
          .expect(res => {
            expect(res.body[0].note_title).to.eql(sanitizedNotes[0].note_title)
            expect(res.body[0].content).to.eql(sanitizedNotes[0].content)
          })
      })
    })
  })

  describe(`GET /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `Note doesn't exist` } })
      })
    })

    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()

      beforeEach('Insert notes', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })

      it('responds with 200 and the specified note', () => {
        const noteId = 2
        const expectedNote = testNotes[noteId - 1]
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(200, expectedNote)
      })
    })

    context(`Given an XSS attack note`, () => {
      const maliciousNote = {
        id: 911,
        folder_id: 2,
        note_title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      }

      beforeEach('insert malicious note', () => {
        return db
          .into('notes')
          .insert([maliciousNote])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/notes/${maliciousNote.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.note_title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
            expect(res.body.content).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
          })
      })
    })
  })

  describe(`POST /api/notes`, () => {
    it(`creates a note, responding with 201 and the new note`, function () {
      this.retries(3);
      const newNote = {
        note_title: 'This Is a Test Note Title',
        content: 'Testing new note content...',
        folder_id: 2
      }
      return supertest(app)
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect(res => {
          expect(res.body.note_title).to.eql(newNote.note_title)
          expect(res.body.content).to.eql(newNote.content)
          expect(res.body.folder_id).to.eql(newNote.folder_id)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
          const expectedDate = new Date().toLocaleString();
          const actualDate = new Date(res.body.date_modified).toLocaleString();
          expect(actualDate).to.eql(expectedDate)
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/notes/${postRes.body.id}`)
            .expect(postRes.body)
        )
    })
    const requiredFields = ['content', 'folder_id', 'note_title']

    requiredFields.forEach(field => {
      const newNote = {
        note_title: 'This Is a Test Note Title',
        content: 'Testing new note content...',
        folder_id: '2'
      }
      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newNote[field]
        return supertest(app)
          .post('/api/notes')
          .send(newNote)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

    context(`Given an XSS attack note`, () => {
      it(`removes any XSS attack content, and creates a note, responding with 201`, function () {
        const maliciousNote = {
            id: 911,
            folder_id: 2,
            note_title: 'Naughty naughty very naughty <script>alert("xss");</script>',
            content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        }
        return supertest(app)
          .post('/api/notes')
          .send(maliciousNote)
          .expect(201)
          .expect(res => {
            expect(res.body.note_title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
            expect(res.body.content).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
          })
      })
    })
  })

  describe(`DELETE /api/notes/:note_id`, () => {
    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()

      beforeEach('Insert notes', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })

      it('responds with 204 and removes the note', () => {
        const idToRemove = 2
        const expectedNotes = testNotes.filter(note => note.id !== idToRemove)
        return supertest(app)
          .delete(`/api/notes/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/notes`)
              .expect(expectedNotes)
          )
      })
    })
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456
        return supertest(app)
          .delete(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `Note doesn't exist` } })
      })
    })
  })

  describe(`PATCH /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456
        return supertest(app)
          .patch(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `Note doesn't exist` } })
      })
    })
    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()
      beforeEach('Insert notes', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })

      it('responds with 204 and updates the note', () => {
        const idToUpdate = 2
        const updatedNote = {
          content: 'This note content has been updated',
        }
        const expectedNote = {
          ...testNotes[idToUpdate - 1],
          ...updatedNote
        }
        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .send(updatedNote)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/notes/${idToUpdate}`)
              .expect(expectedNote)
          )
      })
      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain 'content'`
            }
          })
      })
    })
  })
})