require('dotenv').config()

//Make app require express
const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static("public"))

//Pass private key to create valid sessions
//THE PRIVATE KEY SHOULD ALWAYS BE GIT IGNORED.
//The key can be grabbed via the stripe account.
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

//Store items should be stored in the database instead
const storeItems = new Map([
    [1, {priceInCents: 10000, name: "Test Product 1"}],
    [2,{priceInCents: 20000, name: "Test Product 2"}],
])

//Create a checkout session and unwrap the object that holds checkout details
//(Items, quantity, etc.)
app.post('/create-checkout-session', async (req,res) =>{
    try{
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id)
                return{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name,
                        },
                        unit_amount: storeItem.priceInCents,
                    },
                    quantity: item.quantity,
                }
            }),
            success_url: `${process.env.SERVER_URL}/success.html`,
            cancel_url: `${process.env.SERVER_URL}/index.html`,
        })
        res.json({url: session.url})
    } catch(e){
        res.status(500).json({error: e.message})
    }
    
})

app.listen(3000)