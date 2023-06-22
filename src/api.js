const Router = require('express').Router
const mongodb = require('mongodb');
const crypto = require('./lib/crypto');

module.exports = (db) => {
  const api = Router();

  api.get('/', (_req, res) => {
  	res.render('home', {
        deleteStaleMessages: process.env.DELETE_STALE_MESSSAGES == 'true' ? true : false,
        deleteStaleMessagesDays: +process.env.DELETE_STALE_MESSAGES_DAYS,
    });
  });

  api.post('/api/create', async (req, res) => {
    try {
      let { iv, securityKey, ttl, note } = req.body;
      if (!securityKey) {
        securityKey = crypto.generateIVAndSecurityKey().securityKey;
      }
      if (!iv) {
        iv = crypto.generateIVAndSecurityKey().iv;
      }
      const encryptedNote = crypto.encrypt(note, iv, securityKey);
      const url = (process.env.PUBLIC_URL || '') + `/api/read/${securityKey}/${iv}`;
      const timestamp = new Date().getTime();
      await db.collection('notes').insertOne({note: encryptedNote, securityKey, ttl, timestamp});
      res.json({url});
    } catch (error) {
      console.error(error);
      res.json({error: 'Error creating note, please try again later.'});
    }
  });

  api.get('/api/read/:securityKey/:iv', async (req, res) => {
    const { securityKey, iv } = req.params;
    try {
      const encryptedNote = await db.collection('notes').findOne({securityKey});
      try {
        const decryptedNote = crypto.decrypt(encryptedNote.note, iv, securityKey);
        const ascii = crypto.isASCII(iv + securityKey);
        await db.collection('notes').deleteOne({securityKey});
        if (ascii) {
          res.json({note: decryptedNote, error: 'Note has been destroyed.'});
        } else {
          res.json({note: null, error: 'Incorrect URL parameters. Note has been destroyed.'})
        }
      } catch (error) {
        console.error(error);
        await db.collection('notes').deleteOne({securityKey});
        res.json({note: null, error: 'Incorrect key. Note has been destroyed.'})
      }
      
    } catch (error) {
      console.error(error);
      res.json({note: null, error: 'Could not find note, perhaps it has already been destroyed?'});
    }
    
  });

  api.post('/create', async (req, res) => {
    try {
      const { note, ttl, securityKey } = req.body;
      const timestamp = new Date().getTime();
      await db.collection('notes').insertOne({note, securityKey, ttl, timestamp});
      res.json();
    } catch (error) {
      console.error(error);
      res.json({error: 'Error creating note, please try again later.'});
    }
  });

  api.get('/read/:securityKey/:iv', async (req, res) => {
    const { securityKey, iv } = req.params;
    try {
      const encryptedNote = await db.collection('notes').findOne({securityKey});
      if (!encryptedNote) {
        res.render('read', {note: null, error: 'Could not find note, perhaps it has already been destroyed?'});
      } else {
        if (encryptedNote.ttl == 0) { // non-timed ttl
          try {
            crypto.decrypt(encryptedNote.note, iv, securityKey);
            const destroyUrl = `/read/${securityKey}/${iv}/destroy`;
            res.render('areyousure', {destroyUrl});
          } catch (error) {
            console.error(error);
            await db.collection('notes').deleteOne({securityKey});
            res.render('read', {note: null, error: 'Incorrect key. Note has been destroyed.'})
          }
        } else { // timed note
          const currentTimestamp = new Date().getTime();
          if (currentTimestamp >= ((encryptedNote.ttl * 1000) + encryptedNote.timestamp)) { // Expired
            await db.collection('notes').deleteOne({securityKey});
            res.render('read', {note: null, error: 'The note you want to read had a time limit and it has expired'});
          } else {
            try {
              // check to see if note can even be decrypted, but don't send back
              res.render('read', {note: encryptedNote.note});
            } catch (error) {
              console.error(error);
              await db.collection('notes').deleteOne({securityKey});
              res.render('read', {note: null, error: 'Incorrect key. Note has been destroyed.'})
            }
          }
        }
      }
      
    } catch (error) {
      console.error(error);
      res.render('read', {error: 'An error occurred when retrieving note'});
    }
  });

  api.get('/read/:securityKey/:iv/destroy', async (req, res) => {
    const { securityKey, iv } = req.params;
    try {
      const encryptedNote = await db.collection('notes').findOne({securityKey});
      if (!encryptedNote) {
        res.render('read', {note: null, error: 'Could not find note, perhaps it has already been destroyed?'});
      } else {
        try {
          const ascii = crypto.isASCII(securityKey + iv);
          await db.collection('notes').deleteOne({securityKey});
          if (ascii) {
            res.render('read', {note: encryptedNote.note, error: 'Note has been destroyed.'});
          } else {
            res.render('read', {note: null, error: 'Incorrect URL parameters. Note has been destroyed.'})
          }
        } catch (error) {
          console.error(error);
          await db.collection('notes').deleteOne({securityKey});
          res.render('read', {note: null, error: 'Incorrect key. Note has been destroyed.'})
        }
        
      }
    } catch (error) {
      console.error(error);
      res.render('read', {error: 'An error occurred when retrieving note'});
    }
  });

  return api;
}
