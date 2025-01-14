import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';
import cors from 'cors';


const port = process.env.PORT || 3000;  // Usar a variável PORT ou 3000 localmente
// Load environment variables first
dotenv.config();

// Create the Express app
const app = express();

// Configure CORS
app.use(cors({
    origin: '*',  
}));

// Start Server
const stripeGateway = stripe(process.env.stripe_api);
const DOMAIN = process.env.DOMAIN;

app.use(express.static('public'));
app.use(express.json());

// Home Route
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});

// Success Route
app.get('/success', (req, res) => {
    res.sendFile('success.html', { root: './public' });
});

// Cancel Route
app.get('/cancel', (req, res) => {
    res.sendFile('cancel.html', { root: './public' });
});

// Checkout Route
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

// Listen on the correct port for Heroku
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
