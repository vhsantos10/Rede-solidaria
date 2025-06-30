$(document).ready(function () {

    // Mostra os campos extras quando o tipo for transportador
    $('#tipo_usuario').change(function () {
        const tipo = $(this).val();
        if (tipo === "transporter") {
            $('#campos_transportador').removeClass('d-none');
        } else {
            $('#campos_transportador').addClass('d-none');
        }
    });

    $('#btnCadastrar').click(function () {
        const $botao = $(this);
        const $texto = $('#btnCadastrarTexto');

        $botao.prop('disabled', true);
        $texto.html(`<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Cadastrando...`);

        const role = $('#tipo_usuario').val();
        const name = $('#nome_razao_social').val().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const cnpj = $('#cpf_cnpj').val().trim();
        const email = $('#email_usuario').val().trim();
        const senha = $('#senha_usuario').val().trim();

        if (!role || !name || !cnpj || !email || !senha) {
            alert("Preencha todos os campos obrigatórios!");
            $botao.prop('disabled', false);
            $texto.text("CADASTRAR");
            return;
        }

        const dados = {
            username: email,
            password: senha,
            name: name,
            cnpj: cnpj.replace(/\D/g, ""),
            role: role
        };

        // Se for transportador, adiciona capacidade e medida
        if (role === "transporter") {
            const capacidade = $('#capacidade').val();
            const medida = $('#medida').val();

            if (!capacidade || !medida) {
                alert("Para transportadores, preencha capacidade e medida!");
                $botao.prop('disabled', false);
                $texto.text("CADASTRAR");
                return;
            }

            dados.capacity = parseInt(capacidade);
            dados.measure = medida;
        }

        fetch("https://api-rest-doacoes.onrender.com/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        })
        .then(res => {
            if (res.status === 201) {
                window.location.href = "login.html";
            } else if (res.status === 409) {
                alert("Usuário já existe. Tente outro e-mail.");
                location.reload();
            } else {
                return res.json().then(data => {
                    throw new Error(data.message || "Erro ao cadastrar usuário.");
                });
            }
        })
        .catch(err => {
            console.error("Erro ao cadastrar:", err);
            alert(err.message);
            $botao.prop('disabled', false);
            $texto.text("CADASTRAR");
        });
    });
});
