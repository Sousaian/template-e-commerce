const payBtn = document.querySelector('.btn-buy');

if (payBtn) {
    payBtn.addEventListener("click", () => {
        const cartItems = localStorage.getItem("cartItems");
        
        if (!cartItems) {
            console.error("O carrinho está vazio!");
            return;
        }

        fetch("https://ecommerce-template-2b11a05be6c8.herokuapp.com/stripe-checkout", {
            method: "get",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                items: JSON.parse(cartItems),
            }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data && data.url) {
                location.href = data.url;
                clearCart();
            } else {
                console.error("Resposta inesperada da API:", data);
            }
        })
        .catch((error) => {
            console.error("Erro ao processar o pagamento:", error);
        });
    });
} else {
    console.error("Botão de pagamento não encontrado!");
}
