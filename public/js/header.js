$(document).ready(function () {
    // Carregar o menu de um arquivo HTML externo na div #header
    $('#header').load('/View/Shared/header.html', function () {
        // Após o menu ser carregado, inicialize a funcionalidade do toggle da sidebar
        $('#toggleSidebar').on('click', function () {
            const $sidebar = $('#sidebar');
            const $mainContent = $('.main-content');

            // Alterna a classe 'collapsed' na sidebar
            $sidebar.toggleClass('collapsed');

            // Ajusta a margem da main-content com base no estado da sidebar
            if ($sidebar.hasClass('collapsed')) {
                $mainContent.css({
                    marginLeft: '80px',
                    maxWidth: 'calc(100% - 80px)'
                });

                // Fecha todos os submenus ao colapsar a sidebar
                $('#sidebar .collapse').collapse('hide');
            } else {
                $mainContent.css({
                    marginLeft: '300px',
                    maxWidth: 'calc(100% - 300px)'
                });

                // Não abre automaticamente os submenus quando a sidebar é expandida
                // Isso é garantido não chamando 'collapse('show')'
            }
        });

        // Controle de visibilidade dos menus baseado na role
        const token = localStorage.getItem("token");

        if (!token) {
            // Sem token? Redireciona pro login
            window.location.href = "/View/login.html";
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = payload.role;

            // Esconde todos os menus
            $("#collapseThree").closest(".nav-item").hide(); // ONG
            $("#collapseFour").closest(".nav-item").hide(); // DOADOR
            $("#collapseTwo").closest(".nav-item").hide();  // TRANSPORTADOR

            // Exibe só o menu da role atual
            if (role === "ong") {
                $("#collapseThree").closest(".nav-item").show();
            } else if (role === "donor") {
                $("#collapseFour").closest(".nav-item").show();
            } else if (role === "transporter") {
                $("#collapseTwo").closest(".nav-item").show();
            }

            // Nome do usuário no topo (se quiser)
            if (payload.name) {
                //$("#userDropdown").text(payload.name);
                const nomeSeguro = $('<div>').text(payload.name).html(); // escapa qualquer coisa
                $("#userDropdown").html(nomeSeguro);
            }

        } catch (e) {
            console.error("Token inválido:", e);
            window.location.href = "/View/login.html";
        }

    });
});
