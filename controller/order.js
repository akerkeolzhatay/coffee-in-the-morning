import Order from "../models/order.js";
import Cart from "../models/cart.js";

export const checkout = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "You are not logged in" });
        }

        const userId = req.session.user._id;

        const cart = await Cart.findOne({ userId }).populate("items.foodId");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const paymentSuccess = Math.random() > 0.1; 
        if (!paymentSuccess) {
            return res.status(400).json({ success: false, message: "Payment failed" });
        }

        const order = new Order({
            userId,
            items: cart.items,
            totalPrice: cart.totalPrice,
        });

        await order.save();

        await Cart.deleteOne({ userId });

        res.json({ success: true, message: "The order has been successfully placed", order });
    } catch (error) {
        console.error("Error while placing your order:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getOrders = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "You are not logged in" });
        }

        const userId = req.session.user._id;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        console.error("Error receiving orders:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

async function updateStatus(orderId) {
    const newStatus = document.getElementById(`status-select-${orderId}`).value;

    if (!["In Processing", "Delivering", "Delivered"].includes(newStatus)) {
        alert("Invalid status!");
        return;
    }

    const response = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus })
    });

    const data = await response.json();
    if (data.success) {
        document.getElementById(`status-${orderId}`).innerText = newStatus;
        alert("Delivery status updated!");
    } else {
        alert("Error updating status");
    }
}
