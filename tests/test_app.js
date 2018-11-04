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
        Yes: 'Yes',
        No: 'No',
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
    console.error("STER", string);
    res.json({ string });
  });

  app.get('/strings/green', (req, res) => {
    res.send(req.l10n.Colors.Green('blue'));
  });

  const{ body } = await request(app)
    .get('/Yes');
  t.strictEquals(body.string, 'Yes', 'Should get default language string');
});
