const payBtn = document.querySelector('.btn-buy');

if (!payBtn) {
    console.error("Botão de pagamento não encontrado!");
} else {
    payBtn.addEventListener("click", handlePayment);
}

async function handlePayment() {
    try {
        const cartItems = getCartItems();

        if (!cartItems.length) {
            console.error("O carrinho está vazio!");
            return;
        }

        const checkoutUrl = await createCheckoutSession(cartItems);

        if (checkoutUrl) {
            clearCart();
            window.location.href = checkoutUrl;
        }

    } catch (error) {
        console.error("Erro ao processar o pagamento:", error);
    }
}

function getCartItems() {
    const items = localStorage.getItem("cartItems");
    return items ? JSON.parse(items) : [];
}

async function createCheckoutSession(items) {
    const response = await fetch('/stripe-checkout', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
    });

    if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data?.url) {
        throw new Error("Resposta inesperada da API.");
    }

    return data.url;
}

function clearCart() {
    localStorage.removeItem("cartItems");
}
