process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');

let book_isbn;

beforeEach(async () => {
  const results =
    await db.query(`INSERT INTO books (isbn, amazon_url,author, language, pages, publisher, title, year)
  VALUES ('123456', 'www.amazon.com/mybook', 'John', 'English', '1000', 'The Publisher', 'my book', 2021) RETURNING isbn`);

  book_isbn = results.rows[0].isbn;
});

/**router.get('/', async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
}); */

describe('GET /books', () => {
  test('Get all books in a list', async () => {
    const res = await request(app).get('/books');
    const books = res.body.books;
    expect(books[0]).toHaveProperty('isbn');
    expect(books[0]).toHaveProperty('title');
  });
});

afterEach(async () => await db.query('DELETE FROM books'));

afterAll(async () => await db.end());
