require("dotenv").config();
const { User } = require("../models/user.model");
const { Info } = require("../models/info.model");
const { verifyToken } = require("../auth/auth");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const items = new Map([
    [1, { priceInCents: 499, name: "Template Nest Premium Subscription" }],
]);
const exchangeRates = {
    CAD: 1.36,
    USD: 1,
    EUR: 0.92,
    GBP: 0.78,
    INR: 83.13
};

const createPaymentIntent = async (req, res) => {
    console.log("createPaymentIntent")
    const { token, email, currency, name, country } = req.body;

    if (!token || !email) {
        console.log("---> All fields are required")
        return res.status(400).json({ error: "All fields are required" });
    }

    const decoded = verifyToken(token);
    console.log(decoded)


    if (decoded) {
        const userId = decoded._id;
        const user = await User.find({ userId: userId });
        if (!user) {
            console.log("---> User not found!")
            return res.status(400).send({ message: "User not found!" });
        }

        if (user?.isPremiumUser) {
            console.log("---> User is already a premium user!")
            return res.status(400).send({ message: "User is already a premium user!" });
        }


        try {
            const item = items.get(1); // Reference the predefined item directly
            const convertedPrice = (exchangeRates[currency] * item.priceInCents).toFixed(0);
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                line_items: [
                    {
                        price_data: {
                            currency: currency,
                            product_data: {
                                name: item.name,
                            },
                            unit_amount: convertedPrice,
                        },
                        quantity: 1, // Quantity is constant as well
                    }
                ],
                success_url: process.env.SUB_PAYMENT_OK,
                cancel_url: process.env.SUB_PAYMENT_CANCEL,
            });
            console.log("---> Payment Intent Created!")
            res.status(201).json({ url: session.url });
        } catch (e) {
            console.log("---> Error: ", e.message)
            res.status(500).json({ error: e.message });
        }
    }
};


const paymentSuccess = async (req, res) => {
    console.log("paymentSuccess")
    const { token } = req.body;

    const decoded = verifyToken(token);
    console.log(decoded)
    if (decoded) {
        const userId = decoded._id;
        const user = await User.findOne({ userId: userId });
        console.log(user)
        if (!user) {
            console.log("---> User not found!")
            return res.status(400).send({ message: "User not found!" });
        }

        user.isPremiumUser = true;

        await user.save();

        const info = await Info.findOne({ infoId: "info" });
        if (info) {
            info.numberOfPremiumUsers += 1;
            info.totalRevenue += items.get(1).priceInCents;
            await info.save();
        }

        console.log("---> Payment Success!")
        return res.status(200).send({ message: "Payment Success!" });
    }

    res.status(400).send({ message: "Payment Failed!" });



}

const promoCode = async (req, res) => {
    console.log("promoCode")
    const { token, promoCode } = req.body;
    const decoded = verifyToken(token);
    if (decoded) {
        const userId = decoded._id;
        const user = await User.findOne({ userId: userId });
        if (!user) {
            return res.status(400).send({ message: "User not found!" });
        }

        if (promoCode === process.env.PROMO) {
            user.isPremiumUser = true;
            await user.save();

            const info = await Info.findOne({ infoId: "info" });
            if (info) {
                info.numberOfPremiumUsers += 1;
                await info.save();
            }

            return res.status(200).send({ message: "Promo Code Applied!" });
        }

        return res.status(400).send({ message: "Invalid Promo Code!" });

    }
}
module.exports = { createPaymentIntent, paymentSuccess, promoCode };
