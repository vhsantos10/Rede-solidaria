$(document).ready(function () {
    const token = localStorage.getItem("token");
    const donorId = localStorage.getItem("userId");

    if (!token || !donorId) {
        mostrarModalErro("Você precisa estar logado.");
        window.location.href = "/View/login.html";
        return;
    }

    $("#loader").show();
    const tabela = $('#tabela_doacoes_solicitadas');
    const tbody = $('#tabela_body');

    fetch(`https://api-rest-doacoes.onrender.com/donations/by-donor/?donorId=${donorId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => res.ok ? res.json() : Promise.reject("Erro ao buscar doações"))
        .then(doacoes => {
            tbody.empty();

            if (doacoes.length === 0) {
                $("#loader").hide();
                mostrarModalErro("Nenhuma solicitação de doação encontrada.");
                return;
            }

            doacoes.forEach(d => {
                const linha = `
                    <tr>
                        <td>${d.title}</td>
                        <td>${d.ong?.name || "ONG não informada"}</td>
                        <td>${d.requestedQuantity}</td>
                        <td>${d.requestedMeasure}</td>
                        <td>${new Date(d.requestedAt).toLocaleDateString("pt-BR")}</td>
                        <td>${d.acceptedAt ? new Date(d.acceptedAt).toLocaleDateString("pt-BR") : "Pendente"}</td>
                        <td style="text-align:center;">
                            <a href="#" onclick="abrirModal(${d.donationId})" title="Gerenciar Solicitação">
                                <i class="fa-solid fa-check-circle text-success"></i>
                            </a>
                            ${d.acceptedAt && !d.sentAt
                                ? `<a href="#" onclick="marcarComoEnviada(${d.donationId})" title="Marcar como enviada">
                                     <i class="fa-solid fa-truck-fast text-primary ms-2"></i>
                                   </a>`
                                : ""}
                        </td>
                    </tr>`;
                tbody.append(linha);
            });

            $("#loader").hide();
            tabela.show().css("opacity", "1").DataTable({
                destroy: true,
                language: {
                    sProcessing: "Processando...",
                    sLengthMenu: "Mostrando _MENU_ registros",
                    sZeroRecords: "Nenhum resultado encontrado",
                    sEmptyTable: "Nenhum dado disponível",
                    sInfo: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    sInfoEmpty: "Mostrando 0 a 0 de 0 registros",
                    sInfoFiltered: "(filtrado de _MAX_ registros)",
                    sSearch: "Buscar:",
                    oPaginate: {
                        sFirst: "Primeiro",
                        sLast: "Último",
                        sNext: "Seguinte",
                        sPrevious: "Anterior"
                    }
                }
            });
        })
        .catch(err => {
            console.error("Erro ao carregar doações solicitadas:", err);
            $("#loader").hide();
            mostrarModalErro("Erro ao carregar doações solicitadas.");
        });
});

// Abrir modal de confirmação
function abrirModal(doacaoId) {
    $('#solicitacaoId').val(doacaoId);
    $('#modalConfirmarSolicitacao').modal('show');
}

// Aceitar solicitação
$('#btnAceitarSolicitacao').click(function () {
    const token = localStorage.getItem("token");
    const doacaoId = $('#solicitacaoId').val();

    fetch(`https://api-rest-doacoes.onrender.com/donations/accept?donationId=${doacaoId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => {
            if (!res.ok) throw new Error("Erro ao aceitar a solicitação.");
            return res.json();
        })
        .then(doacao => {
            const novaQtd = doacao.productQuantity - doacao.quantity;
            return fetch(`https://api-rest-doacoes.onrender.com/products/${doacao.productId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ availableQuantity: novaQtd })
            });
        })
        .then(res => {
            if (!res.ok) throw new Error("Erro ao atualizar o produto.");
            $('#modalConfirmarSolicitacao').modal('hide');
            mostrarModalSucesso("Doação aceita com sucesso!");
            setTimeout(() => location.reload(), 2000);
        })
        .catch(err => {
            console.error(err);
            mostrarModalErro("Erro ao processar a solicitação.");
        });
});

function marcarComoEnviada(doacaoId) {
    const token = localStorage.getItem("token");

    fetch(`https://api-rest-doacoes.onrender.com/transporters/accept/${doacaoId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Erro ao aceitar a entrega.");
        mostrarModalSucesso("✅ Entrega aceita pelo transportador!");
        setTimeout(() => location.reload(), 2000);
    })
    .catch(err => {
        console.error("Erro:", err);
        mostrarModalErro("❌ Erro ao aceitar a entrega.");
    });
}



function mostrarModalSucesso(msg) {
  $('#mensagemFeedback')
    .html(`<i class="fa-solid fa-circle-check text-success me-2"></i>${msg}`);
  $('#modalFeedback').modal('show');
}

function mostrarModalErro(msg) {
  $('#mensagemFeedback')
    .html(`<i class="fa-solid fa-circle-exclamation text-danger me-2"></i>${msg}`);
  $('#modalFeedback').modal('show');
}

