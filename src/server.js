import { Server } from 'http';
import Express from 'express';
import path from 'path';
import { appRoute } from './routes/app.js'
import { apiRoute } from './routes/api.js'
import * as dotenv from "dotenv";

dotenv.config();
dotenv.load()

console.log(process.env.PORT)

const app = new Express();
const server = new Server(app);

app.use(Express.static(path.join(__dirname, '../assets')));
app.use(Express.static(path.join(__dirname, '../../node_modules/bootstrap/dist')));

app.disable('view cache');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../src/views'));

app.use('/', appRoute)
app.use('/api', apiRoute)

// start the server
const port = process.env.PORT || 8080;
const env = process.env.NODE_ENV || 'production';

server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server running on http://localhost:${port} [${env}]`);
});
