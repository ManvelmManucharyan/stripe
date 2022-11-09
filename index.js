require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.post('/create', async( req, res)=>{
    try {
        const account = await stripe.accounts.create({
            type: 'custom',
            country: req.body.country,
            email: req.body.email,
            capabilities: {
                card_payments: {requested: true},
                transfers: {requested: true},
              },
          })
          return JSON.stringify(account)
    } catch (error) {
        res.send(error);
    }
});

app.post('/customer', async (req, res)=>{
    try{
        const customer = await stripe.customers.create({
            email: req.body.email,
            name: req.body.name,
        });
        res.send('Success')
    } catch (error) {
        res.send("Error")
    }
})

app.post('/card/:id', async( req, res)=>{
    try {
        const token = await stripe.tokens.create({
            card: {
                number: req.body.number,
                exp_month: req.body.month,
                exp_year: req.body.year,
                cvc: req.body.cvc,
            },
        });
        const card = await stripe.customers.createSource(
            `${req.params.id}`,
            {source: token.id}
        );
        res.send('Success')
    } catch (error) {
        res.send(error);
    }
});

app.post('/pay/:id', async( req, res)=>{
    try {
        const customer = await stripe.customers.retrieve(
            `${req.params.id}`
        );
        const charges = await stripe.charges.create({
            amount: req.body.amount*100,
            description: req.body.description,
            currency: req.body.currency,
            customer: customer.id
        });
        res.send('Success')
    } catch (error) {
        res.send(error);
    }
});

app.get('/pays/:id', async( req, res)=>{
    try {
        const charges = await stripe.charges.list({
            customer: `${req.params.id}`
        });
        res.send(charges.data)
    } catch (error) {
        res.send(error);
    }
});

app.get('/invoice/:id', async( req, res)=>{
    try {
        const invoice = await stripe.invoices.create({
            customer: `${req.params.id}`,
          });
        res.send(invoice)
    } catch (error) {
        res.send(error);
    }
});

app.post('/bank/:id', async( req, res)=>{
    try {
        const bankAccount = await stripe.customers.createSource(
            `${req.params.id}`,
            {source: {
                object: "bank_account",
                account_holder_name: req.body.name,
                account_holder_type: "individual",
                country: req.body.country,
                currency: req.body.currency,
                routing_number: req.body.routing,
                account_number: req.body.number
            }}
        );
        res.send(bankAccount)
    } catch (error) {
        res.send(error);
    }
});

app.post('/refund', async( req, res)=>{
    try {
        const refund = await stripe.refunds.create({
            charge: 'ch_3LzGcSGncUS5VGxv0npLV6lZ',
        });
        res.send(refund)
    } catch (error) {
        res.send(error);
    }
});

app.post('/cancel', async( req, res)=>{
    try {
        const refund = await stripe.refunds.cancel(
            're_3LzGcSGncUS5VGxv0IxmjtVK'
        );
        res.send(refund)
    } catch (error) {
        res.send(error);
    }
});

app.get('/update/:id', async( req, res)=>{
    try {
        const customer = await stripe.customers.update(
            `${req.params.id}`,
            {default_source: 'card_1LzIobGncUS5VGxvMTxXzelf'}
        );
        res.send(customer)
    } catch (error) {
        res.send(error);
    }
});

app.listen(process.env.PORT, ()=>{
    console.log("App is running");
});