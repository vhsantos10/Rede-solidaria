
$(document).ready(function () {
    // Inicializa a tabela
    $('#tabela_entregas_disponiveis').DataTable({
        language: {
            sProcessing: "Procesando...",
            sLengthMenu: "Mostrando _MENU_ registros",
            sZeroRecords: "Nenhum resultado encontrado",
            sEmptyTable: "Não há dados disponíveis nesta tabela",
            sInfo: "Mostrando registros de _START_ a _END_ de um total de _TOTAL_ registros",
            sInfoEmpty: "Mostrando registros de 0 a 0 de um total de 0 registros",
            sInfoFiltered: "(filtrando um total de _MAX_ registros)",
            sSearch: "Buscar:",
            oPaginate: {
                sFirst: "Primeiro",
                sLast: "Último",
                sNext: "Seguinte",
                sPrevious: "Anterior"
            }
        },
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('hover-effect');
        }
    });

    // Chama a função para buscar as entregas disponíveis
    carregarEntregasDisponiveis();
});

function carregarEntregasDisponiveis() {
    const token = localStorage.getItem("token");

    $.ajax({
        url: 'https://api-rest-doacoes.onrender.com/transporters/available',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        },
        success: function (data) {
            console.log("📦 Dados recebidos do endpoint /transporters/available:", data);

            const tabela = $('#tabela_entregas_disponiveis').DataTable();
            tabela.clear();

            data.forEach(d => {
                tabela.row.add([
                    d.id,
                    d.destiny.nome || "Sem nome",
                    d.destiny.endereco
                        ? `${d.destiny.endereco.street}, ${d.destiny.endereco.number} - ${d.destiny.endereco.city}/${d.destiny.endereco.state}`
                        : "Sem endereço",
                    `
                    <a class="btn btn-ghost-primary table-action-btn" title="Aceitar entrega" style="color:green" onclick="aceitarEntrega(${d.id})">
                        <i class="fa-solid fa-thumbs-up"></i>
                    </a>
                    <a class="btn btn-ghost-primary table-action-btn" title="Rejeitar entrega" style="color:red" onclick="rejeitarEntrega(${d.id})">
                        <i class="fa-solid fa-thumbs-down"></i>
                    </a>
                    `
                ]);
            });

            tabela.draw();
        },
        error: function (err) {
            console.error("❌ Erro ao carregar entregas disponíveis:", err);
            alert('Erro ao carregar entregas disponíveis.');
        }
    });
}

// Modal de confirmação de aceite
let entregaIdSelecionada = null;

function aceitarEntrega(id) {
    entregaIdSelecionada = id;
    $('#entregaIdModal').text(id);
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEntrega'));
    modal.show();
}

document.getElementById("btnConfirmarAceite").addEventListener("click", function () {
    const token = localStorage.getItem("token");

    fetch(`https://api-rest-doacoes.onrender.com/transporters/accept/${entregaIdSelecionada}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.ok) {
            // alert("Entrega aceita com sucesso!");
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEntrega'));
            modal.hide();
            carregarEntregasDisponiveis();
        } else {
            return res.json().then(data => {
                throw new Error(data.message || "Erro ao aceitar a entrega.");
            });
        }
    })
    .catch(err => {
        console.error("❌ Erro ao aceitar entrega:", err);
        alert(err.message);
    });
});
