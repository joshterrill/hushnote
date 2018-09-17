const Router = require('express').Router
const mongodb = require('mongodb');
const util = require('../helpers/util.helpers');
const config = require('../config.json');

module.exports = ({ db }) => {
  const api = Router();

  api.get('/', (req, res) => {  
  	res.render('home');
  });

  api.post('/api/create', (req, res) => {
    const plainTextNote = req.body.note;
    const key = util.guid();
    const pass = util.guid();
    const note = util.encrypt(plainTextNote, key + pass);
    const url = `${config.publicUrl}/api/read/${key}/${pass}`;
    db.collection('Notes').insertOne({key, note}, (err, result) => {
      if (err) res.json({error: 'Error creating note, please try again later.'});
      res.json({url, error: null});
    });
  });

  api.get('/api/read/:key/:pass', (req, res) => {
    const {key, pass} = req.params;
    db.collection('Notes').findOne({key}, (err, result) => {
      let message = '';
      let note = null;
      if (err || !result) {
        message = 'Could not find note, perhaps it has already been destroyed?';
        res.json({note, message});
      } else {
        note = util.decrypt(result.note, key + pass);
        const ascii = util.isASCII(note);
        db.collection('Notes').deleteOne({_id: new mongodb.ObjectID(result._id)}, (error, result) => {
          message = 'Note has been destroyed.';
          if (ascii) {
            res.json({note, message});
          } else {
            message = 'Incorrect URL parameters. Note has been destroyed.'
            res.json({note: null, message})
          }
        });
      }
    });
  });
  
  api.post('/create', (req, res) => {
    const plainTextNote = req.body.note;
    const key = util.guid();
    const pass = util.guid();
    const note = util.encrypt(plainTextNote, key + pass);
    const url = `${config.publicUrl}/read/${key}/${pass}`;
    db.collection('Notes').insertOne({key, note}, (err, result) => {
      if (err) res.json({error: 'Error creating note, please try again later.'});
      res.json({url, error: null});
    });
  });

  api.get('/read/:key/:pass', (req, res) => {
    const {key, pass} = req.params;
    db.collection('Notes').findOne({key}, (err, result) => {
      let message = '';
      let note = null;
      if (err || !result) {
        message = 'Could not find note, perhaps it has already been destroyed?';
        res.render('read', {note, message});
      } else {
        const destroyUrl = `${config.publicUrl}/read/${key}/${pass}/destroy`;
        res.render('areyousure', {destroyUrl});
      }
    });
  });

  api.get('/read/:key/:pass/destroy', (req, res) => {
    const {key, pass} = req.params;
    db.collection('Notes').findOne({key}, (err, result) => {
      let message = '';
      let note = null;
      if (err || !result) {
        message = 'Could not find note, perhaps it has already been destroyed?';
        res.render('read', {note, message});
      } else {
        note = util.decrypt(result.note, key + pass);
        const ascii = util.isASCII(note);
        db.collection('Notes').deleteOne({_id: new mongodb.ObjectID(result._id)}, (error, result) => {
          message = 'Note has been destroyed.';
          if (ascii) {
            res.render('read', {note, message});
          } else {
            message = 'Incorrect URL parameters. Note has been destroyed.'
            res.render('read', {note: null, message})
          }
        });
      }
    });
  });

  return api;
}