const express = require('express');
const cors = require('cors');
const path = require('path');
const { writeLog } = require('./services/logger.service');
const authRoutes = require('./modules/auth/auth.routes');
const catalogRoutes = require('./modules/catalogo/catalog.routes');

const app = express();
const projectRoot = path.join(__dirname, '..');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(projectRoot, 'public')));

app.use('/auth', authRoutes);
app.use('/restaurants', catalogRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'public', 'index.html'));
});

writeLog('info', 'Aplicação configurada');

module.exports = app;
