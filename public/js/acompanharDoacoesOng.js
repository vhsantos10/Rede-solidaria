$(document).ready(function () {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
        alert("Você precisa estar logado.");
        window.location.href = "/View/login.html";
        return;
    }

    $("#loader").show();

    fetch(`https://api-rest-doacoes.onrender.com/donations/?ongId=${userId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => {
            if (!res.ok) throw new Error("Erro ao buscar solicitações.");
            return res.json();
        })
        .then(async solicitacoes => {
            const tbody = $('#tabela_solicitacoes_ong_body');
            tbody.empty();

            if ($.fn.DataTable.isDataTable('#tabela_solicitacoes_ong')) {
                $('#tabela_solicitacoes_ong').DataTable().destroy();
            }

            if (solicitacoes.length === 0) {
                tbody.append(`<tr><td colspan="7" class="text-center">Nenhuma solicitação encontrada.</td></tr>`);
            } else {
                for (const item of solicitacoes) {
                    console.log("🔍 Solicitacao recebida:", item); // 👈 AQUI
                    const produto = await fetch(`https://api-rest-doacoes.onrender.com/products/details/${item.productId}`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    }).then(res => res.ok ? res.json() : { title: "Produto não encontrado", donor: { name: "Desconhecido", address: {} } });
                    const endereco = produto.donor?.address;
                    const enderecoCompleto = endereco
                        ? `${endereco.street}, ${endereco.number}${endereco.complement ? ', ' + endereco.complement : ''}, ${endereco.city} - ${endereco.state}, CEP: ${endereco.cep}`
                        : "Sem endereço";

                    const podeBaixarComprovante = item.sentAt !== "";

                    const pdfIcon = `
  <button class="btn btn-link gerar-pdf" title="Gerar nota de entrega" data-item='${JSON.stringify(item)}'>
    <i class="fa-solid fa-file-pdf" style="color:red; margin-left:10px;"></i>
  </button>
`;
                    const telefone = "5511930169366"//produto.donor?.phone || null;
                    const linkWhatsApp = telefone
                        ? `<a href="https://wa.me/${telefone.replace(/\D/g, '')}" target="_blank" title="Falar com o doador no WhatsApp">
         <i class="fa-brands fa-whatsapp" style="color:green; margin-left:10px;"></i>
       </a>`
                        : `<i class="fa-brands fa-whatsapp" title="Telefone indisponível" style="color:gray; margin-left:10px; opacity:0.5;"></i>`;
                    const linha = `
                    <tr>
                        <td>${produto.title || "Sem nome"}</td>
                        <td>${item.quantity}</td>
                        <td>${item.measure}</td>
                        <td>${new Date(item.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td>${item.acceptedAt ? "ACEITA" : "PENDENTE"}</td>
                        <td>${item.pickedUpAt ? new Date(item.pickedUpAt).toLocaleDateString("pt-BR") : "Sem transportador"}</td>
                        <td>${item.deliveredByTransporterAt ? new Date(item.deliveredByTransporterAt).toLocaleDateString("pt-BR") : "Em espera"}</td>
                        <td>
                        ${pdfIcon}
                            <button class="btn" data-bs-toggle="modal"
                                    data-bs-target="#modal_status_detalhado"
                                    data-solicitacao='${JSON.stringify(item)}'>📊</button>
                        ${linkWhatsApp}
                                    </td>
                    </tr>
                `;
                    tbody.append(linha);
                }
            }

            $('#tabela_solicitacoes_ong').DataTable({
                destroy: true,
                language: {
                    sProcessing: "Processando...",
                    sLengthMenu: "Mostrar _MENU_ registros",
                    sZeroRecords: "Nenhum resultado encontrado",
                    sEmptyTable: "Nenhum dado disponível",
                    sInfo: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                    sInfoEmpty: "Mostrando 0 até 0 de 0 registros",
                    sInfoFiltered: "(filtrado de _MAX_ registros no total)",
                    sSearch: "Buscar:",
                    oPaginate: {
                        sFirst: "Primeiro",
                        sLast: "Último",
                        sNext: "Próximo",
                        sPrevious: "Anterior"
                    }
                }
            });

            $("#loader").hide();
        })
        .catch(err => {
            console.error("Erro ao carregar solicitações:", err);
            $("#loader").hide();
            alert("Erro ao carregar solicitações.");
        });
});

$('#modal_status_detalhado').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget);
    const dados = button.data('solicitacao');

    // AQUI está a linha que faltava:
    doacaoAtualId = dados.id;

    $('#status_solicitada').text(new Date(dados.createdAt).toLocaleDateString("pt-BR"));
    $('#status_aceita').text(dados.acceptedAt ? new Date(dados.acceptedAt).toLocaleDateString("pt-BR") : "Pendente");
    $('#status_enviada').text(dados.pickedUpAt ? new Date(dados.pickedUpAt).toLocaleDateString("pt-BR") : "Pendente");
    $('#status_entregue').text(dados.deliveredByTransporterAt ? new Date(dados.deliveredByTransporterAt).toLocaleDateString("pt-BR") : "Pendente");
});


// Evento do botão "Concluir doação"
$('#modal_status_detalhado .btn-success').on('click', function () {
    const token = localStorage.getItem("token");

    if (!doacaoAtualId || !token) {
        alert("Informações insuficientes para concluir a doação.");
        return;
    }

    fetch(`https://api-rest-doacoes.onrender.com/transporters/complete/${doacaoAtualId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            if (!res.ok) throw new Error("Erro ao concluir doação.");
            return res.json();
        })
        .then(data => {
            // alert("✅ Doação concluída com sucesso!");
            location.reload(); // Atualiza a página para refletir a mudança
        })
        .catch(err => {
            console.error("Erro ao concluir doação:", err);
            alert("❌ Falha ao concluir a doação.");
        });
});

$(document).on('click', '.gerar-pdf', async function () {
    const item = $(this).data('item');
    const token = localStorage.getItem("token");

    const produto = await fetch(`https://api-rest-doacoes.onrender.com/products/details/${item.productId}`, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json());

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const endereco = produto.donor?.address;
    const enderecoCompleto = endereco
        ? `${endereco.street}, ${endereco.number}${endereco.complement ? ', ' + endereco.complement : ''}, ${endereco.city} - ${endereco.state}, CEP: ${endereco.cep}`
        : "Endereço não informado";

    doc.setFontSize(16);
    doc.text("Recibo de Doação", 20, 20);

    doc.setFontSize(12);
    doc.text(`Nome da Entidade: ${produto.donor?.name || "Desconhecido"}`, 20, 35);
    doc.text(`CNPJ: ${produto.donor?.cnpj || "Não informado"}`, 20, 42);
    doc.text(`Endereço: ${enderecoCompleto}`, 20, 49);

    doc.text(`Recebemos a importância de: ${item.quantity} ${item.measure} de ${produto.title || "Produto desconhecido"}`, 20, 65);
    doc.text(`Referente à doação realizada em: ${new Date(item.createdAt).toLocaleDateString("pt-BR")}`, 20, 72);

    doc.text(`São Paulo, ${new Date().toLocaleDateString("pt-BR")}`, 20, 95);

    doc.save(`recibo_doacao_${item.id}.pdf`);
});
