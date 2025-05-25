import express from 'express';
import dotenv from 'dotenv';
import stripeLib from 'stripe';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Start Server
const app = express();
const port = process.env.PORT || 3000; 
const stripe = stripeLib(process.env.STRIPE_API_KEY);
const DOMAIN = process.env.DOMAIN || `http://localhost:${port}`; 

// Configure CORS
app.use(cors({ origin: '*' }));

// Serve static files from 'public' folder
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

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${DOMAIN}/success`,
            cancel_url: `${DOMAIN}/cancel`, 
            line_items: lineItems,
            billing_address_collection: 'required',
        });

        res.json({ url: session.url }); 
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create checkout session.' });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
