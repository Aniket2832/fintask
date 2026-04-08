const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

require('./models/User');
require('./models/Task');
require('./models/Finance');
require('./models/Budget');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/budget', require('./routes/budget'));


app.get('/', (req, res) => res.json({ message: 'FinTask API running' }));

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database connected and synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));