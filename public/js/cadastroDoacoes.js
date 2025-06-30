$(document).ready(function () {
    $('#btnCadastrarDoacao').click(function () {
        const botao = $(this);
        const texto = $('#textoBotaoDoacao');

        botao.prop('disabled', true);
        texto.html(`
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Cadastrando...
        `);

        const categoryId = parseInt($('#tipoDoacao').val());
        let title = $('#nomeItem').val();
        const outro = $('#outroItem').val().trim();
        const quantity = $('#quantidade').val();
        const measure = $('#medida').val();
        const entrega = $('#entrega').val();
        const token = localStorage.getItem("token");

        if (!token) {
            mostrarErro("Você precisa estar logado para cadastrar uma doação.");
            return;
        }

        let donorId;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            donorId = payload.donorId;
        } catch (error) {
            mostrarErro("Token inválido. Faça login novamente.");
            return;
        }

        if (title === "Outros") {
            title = outro || "Outro item";
        }

        if (!categoryId || !title || !quantity || !measure || !entrega) {
            mostrarErro("Preencha todos os campos.");
            return;
        }

        const dados = {
            donorId: donorId,
            categoryId: categoryId,
            title: title,
            description: `Doação de ${title} (${quantity} ${measure}, entrega: ${entrega})`,
            quantity: parseInt(quantity),
            measure: measure
        };

        fetch("https://api-rest-doacoes.onrender.com/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        })
        .then(res => {
            if (res.ok) {
                $('#mensagemSucesso').removeClass('d-none');

                setTimeout(() => {
                    $('#mensagemSucesso').addClass('d-none');
                    window.location.reload();
                }, 3000);
            } else {
                return res.json().then(data => {
                    throw new Error(data.message || "Erro ao cadastrar a doação.");
                });
            }
        })
        .catch(err => {
            console.error("Erro:", err);
            mostrarErro(err.message);
        })
        .finally(() => {
            texto.text("Cadastrar");
            botao.prop('disabled', false);
        });

        // Função utilitária pra mostrar erro e recarregar
        function mostrarErro(mensagem) {
            $('#mensagemErro').removeClass('d-none').text(mensagem);

            setTimeout(() => {
                $('#mensagemErro').addClass('d-none');
                window.location.reload();
            }, 3000);
        }
    });
});
