process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');

let bookIsbn;

beforeEach(async () => {
  const results =
    await db.query(`INSERT INTO books (isbn, amazon_url,author, language, pages, publisher, title, year)
  VALUES ('123456', 'www.amazon.com/mybook', 'John', 'English', '1000', 'The Publisher', 'my book', 2021) RETURNING isbn`);

  bookIsbn = results.rows[0].isbn;
});

describe('GET /books', () => {
  test('Get all books in a list', async () => {
    const res = await request(app).get('/books');
    const books = res.body.books;
    expect(res.statusCode).toBe(200);
    expect(books[0]).toHaveProperty('isbn');
    expect(books[0]).toHaveProperty('title');
  });
});

describe('GET /books/:isbn', () => {
  test('Get a book by isbn', async () => {
    const res = await request(app).get(`/books/${bookIsbn}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.book).toHaveProperty('isbn');
    expect(res.body.book).toHaveProperty('title');
    expect(res.body.book.isbn).toBe(bookIsbn);
  });
});

describe('POST /books', () => {
  test('Create a book', async () => {
    const res = await request(app).post('/books').send({
      isbn: '789123',
      amazon_url: 'https://www.amazon.com/book',
      author: 'tester',
      language: 'English',
      pages: 1000,
      publisher: 'Best Publisher',
      title: 'The Greatest Book',
      year: 2020,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.book).toHaveProperty('isbn');
    expect(res.body.book).toHaveProperty('title');
  });

  test('Unable to create book without title', async () => {
    const res = await request(app).post('/books').send({
      isbn: '789123',
      amazon_url: 'https://www.amazon.com/book',
      author: 'tester',
      language: 'English',
      pages: 1000,
      publisher: 'Best Publisher',
      year: 2020,
    });
    expect(res.statusCode).toBe(400);
  });
});

//'123456', 'www.amazon.com/mybook', 'John', 'English', '1000', 'The Publisher', 'my book', 2021
describe('PUT /:isbn', () => {
  test('Update a book', async () => {
    const res = await request(app).put(`/books/${bookIsbn}`).send({
      isbn: '123456',
      amazon_url: 'https://www.amazon.com/mybook',
      author: 'John',
      language: 'English',
      pages: 1000,
      publisher: 'The Publisher',
      title: 'My Updated Version',
      year: 2020,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.book).toHaveProperty('isbn');
    expect(res.body.book.title).toBe('My Updated Version');
  });

  test('Unable to update book witt invalid year', async () => {
    const res = await request(app).put(`/books/${bookIsbn}`).send({
      isbn: '789123',
      amazon_url: 'https://www.amazon.com/book',
      author: 'tester',
      language: 'English',
      pages: 1000,
      publisher: 'Best Publisher',
      year: 'dfjasdhl',
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('DELETE /books/:isbn', () => {
  test('Deletes a book', async () => {
    const res = await request(app).delete(`/books/${bookIsbn}`);
    expect(res.body).toEqual({ message: 'Book deleted' });
  });
});

afterEach(async () => await db.query('DELETE FROM books'));

afterAll(async () => await db.end());
