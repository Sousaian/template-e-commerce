import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';

//Load env variables
dotenv.config();

//Start Server
const app = express();

app.use(express.static('public'));
app.use(express.json());

//Home Route
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: './public'});
})

//Success
app.get('/success', (req, res) => {
    res.sendFile('success.html', {root: './public'});
})
//cancel
app.get('/cancel', (req, res) => {
    res.sendFile('cancel.html', {root: './public'});
})
//Checkout Route
let stripeGateway = stripe(process.env.stripe_api);
let DOMAIN = process.env.DOMAIN;

app.post('/stripe-checkout', async (req, res) => {
    try {
        const lineItems = req.body.items.map((item) => {
            const unitAmount = Math.round(parseFloat(item.price.replace(/[^\d.-]+/g, '')) * 100);
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.title,
                        images: [item.productImg],
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        });

        const session = await stripeGateway.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${DOMAIN}/success`,
            cancel_url: `${DOMAIN}/cancel`,
            line_items: lineItems,
            billing_address_collection: 'required',
        });

        console.log('Session created successfully:', session.url); // Verifique a URL
        res.json({ url: session.url }); // Envia a URL para o frontend
    } catch (error) {
        console.error('Erro ao criar sessão:', error);
        res.status(500).json({ error: 'Erro ao processar pagamento.' });
    }
});

 
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})