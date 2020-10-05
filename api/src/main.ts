import express from 'express';

const app = express();
app.use(express.json());
require('./routes')(app);

app.listen(3333);
