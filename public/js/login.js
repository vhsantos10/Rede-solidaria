$(document).ready(function () {

    // $('#btnAcessar').click(function () {
    //     window.location.href = 'index.html';
    // });

    $('#btnRegistrar').click(function () {
        window.location.href = 'registrar.html';
    });

    $('#btnReseteSenha').click(function () {
        window.location.href = 'resete.html';
    });
});


function Login() {

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    // AGORA AQUI: declara o botão e o span
    const botao = document.getElementById("btnLogin");
    const textoBotao = document.getElementById("btnLoginTexto");

    if (!email || !senha) {
        alert("Preencha usuário e senha!");
        return;
    }

    botao.disabled = true;
    textoBotao.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Entrando...
    `;

    fetch("https://api-rest-doacoes.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: senha })
    })
    .then(res => res.ok ? res.json() : Promise.reject("Usuário ou senha inválidos!"))
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("refreshToken", data.refreshToken);

            // Decodifica o token pra extrair role e nome
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            const role = payload.role;
            const name = payload.name;
            const id = role === "donor" ? payload.donorId : payload.ongId;

            // Salva role e nome no localStorage
            localStorage.setItem("role", role);
            localStorage.setItem("username", name);
            localStorage.setItem("userId", id);

            //console.log(`Login bem-sucedido. Usuário: ${name}, perfil: ${role}`);

            // Redireciona para a index ou para página específica (opcional)
            window.location.href = "index.html";
        } else {
            alert("Falha no login: token não recebido.");
        }
    })
    .catch(err => {
        console.error("Erro na requisição:", err);
        alert(err);
    });
}

