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
    });
});
