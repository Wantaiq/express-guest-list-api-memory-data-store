import express from 'express';
import pool from './database.js';

const app = express();

app.use(express.json());

// Enable CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Get endpoints
app.get('/', function (req, res) {
  res.json({
    guests: `${req.protocol}://${req.get('host')}/guests/`,
  });
});

// Get all guests
app.get('/guests', async (req, res) => {
  try {
    const allGuests = await pool.query('SELECT * FROM guest');
    res.json(allGuests.rows);
  } catch (err) {
    console.log(err);
  }
});

// New guest
app.post('/guests', async (req, res) => {
  try {
    if (!req.body.firstName || !req.body.lastName) {
      res.status(400).json({
        errors: [
          { message: 'Request body missing a firstName or lastName property' },
        ],
      });
      return;
    }

    if (Object.keys(req.body).length > 3) {
      res.status(400).json({
        errors: [
          {
            message:
              'Request body contains more than firstName, lastName and deadline properties',
          },
        ],
      });
      return;
    }

    const { firstName, lastName } = req.body;
    const newGuest = await pool.query(
      'INSERT INTO guest(first_name, last_name, attending) VALUES($1, $2, $3) RETURNING *',
      [firstName, lastName, false],
    );
    res.json(newGuest.rows[0]);
  } catch (err) {
    console.log(err);
  }
});

// Get a single guest
app.get('/guests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await pool.query('SELECT * FROM guest WHERE id = $1', [id]);
    res.json(guest);
  } catch (err) {
    console.log(err);
  }
});

// Modify a single guest
app.put('/guests/:id', async (req, res) => {
  try {
    const allowedKeys = ['firstName', 'lastName', 'deadline', 'attending'];
    const difference = Object.keys(req.body).filter(
      (key) => !allowedKeys.includes(key),
    );

    if (difference.length > 0) {
      res.status(400).json({
        errors: [
          {
            message: `Request body contains more than allowed properties (${allowedKeys.join(
              ', ',
            )}). The request also contains these extra keys that are not allowed: ${difference.join(
              ', ',
            )}`,
          },
        ],
      });
      return;
    }
    const { id } = req.params;
    const { attending } = req.body;
    const updateGuest = await pool.query(
      'UPDATE guest SET attending = $1 WHERE id = $2 RETURNING *',
      [attending, id],
    );
    res.json(updateGuest.rows[0]);
  } catch (err) {
    console.log(err);
  }
  // if (!guest) {
  //   res
  //     .status(404)
  //     .json({ errors: [{ message: `Guest ${req.params.id} not found` }] });
  //   return;
  // }

  // if (req.body.firstName) guest.firstName = req.body.firstName;
  // if (req.body.lastName) guest.lastName = req.body.lastName;
  // if (req.body.deadline) guest.deadline = req.body.deadline;
  // if ('attending' in req.body) guest.attending = req.body.attending;
});

// Delete a single guest
app.delete('/guests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM guest WHERE id = $1', [id]);
    res.json('Guest deleted');
  } catch (err) {
    console.log(err);
  }
});

// Delete all guests

app.delete('/guests', async (req, res) => {
  try {
    await pool.query('DELETE FROM guest');
    res.json('All guests deleted');
  } catch (err) {
    console.log(err);
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log('🚀 Guest list server started on http://localhost:4000');
});
