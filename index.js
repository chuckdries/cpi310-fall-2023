import express from 'express';
import { engine } from 'express-handlebars';

const app = express();

app.use(express.urlencoded({ extended: false }))

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const messages = ["this is a message hard-coded"];

app.get('/', (req, res) => {
  res.render('home', {messages});
})

app.post('/message', (req, res) => {
  messages.push(req.body.message)
  res.redirect('/')
})

app.listen(8080, () => { console.log('listening on http://localhost:8080')})