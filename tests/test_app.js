import tap from 'tap';
import express from 'express';
import request from 'supertest';
import l10n from '../src/index';

tap.test('test_app', async (t) => {
  const app = express();

  app.use(l10n({
    default: 'en',
    strings: {
      en: {
        MyFavoriteColor: [
          'Green',
          'Red',
          'Blue',
        ],
        Yes: 'Yes',
        No: 'No',
        // eslint-disable-next-line
        Template: 'You said ${arg.toUpperCase()}',
        Colors: {
          Green: 'green',
        },
      },
      de: {
        Yes: 'Ja',
        No: 'No',
        Colors: {
          Green: 'grün',
        },
      },
    },
  }));

  app.get('/:string', (req, res) => {
    const string = req.l10n[req.params.string]('Default');
    res.json({ string });
  });

  let { body } = await request(app).get('/Yes');
  t.strictEquals(body.string, 'Yes', 'Should get default language string');

  app.get('/strings/green', (req, res) => {
    res.json(req.l10n.Colors.Green('blue'));
  });

  ({ body } = await request(app).get('/strings/green'));
  t.strictEquals(body, 'green', 'Should get explicit string over default');

  ({ body } = await request(app)
    .get('/strings/green')
    .set('Accept-Language', 'de-CH'));
  t.strictEquals(body, 'grün', 'Should get German string');

  app.get('/strings/template', (req, res) => {
    res.json(req.l10n.Template({ arg: req.query.arg }));
  });

  ({ body } = await request(app).get('/strings/template?arg=foo'));
  t.strictEquals(body, 'You said FOO', 'Should get templated string');

  app.get('/strings/MyFavoriteColor', (req, res) => {
    res.json(req.l10n.MyFavoriteColor());
  });

  const observed = new Set();
  for (let i = 0; i < 20; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    ({ body } = await request(app).get('/strings/MyFavoriteColor'));
    observed.add(body);
    t.ok(['Green', 'Red', 'Blue'].includes(body), 'Should get one of the colors');
  }
  t.ok(observed.size > 1, 'Should not get the same value every time');
});
