require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 5000;
const cors = require('cors');


const userRouter = require('./routes/user.router')
const templateRouter = require('./routes/template.router')
const paymentRouter = require('./routes/payment.router')
app.use(cors({ origin: "*" }))
app.use(express.json());

require('./DB/db').connect();


app.use(process.env.BASE_USER_PATH, userRouter);
app.use(process.env.BASE_TEMPLATE_PATH, templateRouter);
app.use(process.env.BASE_PAYMENT_PATH, paymentRouter);

app.get('/', (req, res) => { res.send('Hello World') })


app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`) })


