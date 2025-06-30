$(document).ready(function () {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Você precisa estar logado.");
        window.location.href = "/View/login.html";
        return;
    }

    let produtosDisponiveis = [];
    let dataTable = null;

    $("#loader").show();

    fetch("https://api-rest-doacoes.onrender.com/products/available", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : Promise.reject("Erro ao buscar produtos disponíveis."))
    .then(produtos => {
        produtosDisponiveis = produtos;
        const select = $('#selectProduto');
        select.empty().append('<option value="">Selecione um produto</option>');
        const titulosUnicos = [...new Set(produtos.map(p => p.title))];
        titulosUnicos.forEach(title => {
            select.append(`<option value="${title}">${title}</option>`);
        });
        $("#loader").hide();
    })
    .catch(err => {
        console.error("Erro ao carregar produtos:", err);
        alert("Erro ao carregar produtos disponíveis.");
        $("#loader").hide();
    });

    $('#btnBuscarProduto').click(function () {
        const produtoSelecionado = $('#selectProduto').val();
        if (!produtoSelecionado) {
            alert("Selecione um produto.");
            return;
        }

        $("#loader").show();
        const produtosFiltrados = produtosDisponiveis.filter(p => p.title === produtoSelecionado);
        if (produtosFiltrados.length === 0) {
            alert("Nenhum produto encontrado.");
            $("#loader").hide();
            return;
        }

        const promessas = produtosFiltrados.map(p =>
            fetch(`https://api-rest-doacoes.onrender.com/products/details/${p.id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            }).then(res => res.ok ? res.json() : null)
        );

        Promise.all(promessas)
            .then(detalhesList => {
                detalhesList = detalhesList.filter(d => d);
                const linhas = detalhesList.map(detalhes => {
                    const endereco = detalhes.donor?.address
                        ? `${detalhes.donor.address.street}, ${detalhes.donor.address.number}${detalhes.donor.address.complement ? ', ' + detalhes.donor.address.complement : ''}, ${detalhes.donor.address.city} - ${detalhes.donor.address.state}, CEP: ${detalhes.donor.address.cep}`
                        : "Endereço não informado";

                    return [
                        detalhes.id,
                        detalhes.donor?.name || "Sem nome",
                        detalhes.title,
                        endereco,
                        `${detalhes.quantity} ${detalhes.measure}`,
                        `<a class="btn btn-ghost-primary" title="Solicitar entrega" onclick="Carregar(${detalhes.id})">
                            <i class="fa-solid fa-truck" style="color: green;"></i>
                        </a>`
                    ];
                });

                if (!dataTable) {
                    dataTable = $('#tabela_doacoes').DataTable({
                        data: linhas,
                        columns: [
                            { title: "ID" },
                            { title: "Nome do Doador" },
                            { title: "Item" },
                            { title: "Endereço" },
                            { title: "Quantidade" },
                            { title: "Opções", orderable: false }
                        ],
                        language: {
                            sProcessing: "Processando...",
                            sLengthMenu: "Mostrando _MENU_ registros",
                            sZeroRecords: "Nenhum resultado encontrado",
                            sEmptyTable: "Nenhum dado disponível",
                            sInfo: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                            sInfoEmpty: "Mostrando 0 a 0 de 0 registros",
                            sInfoFiltered: "(filtrado de _MAX_ registros)",
                            sSearch: "Buscar:",
                            oPaginate: { sFirst: "Primeiro", sLast: "Último", sNext: "Seguinte", sPrevious: "Anterior" }
                        }
                    });
                } else {
                    dataTable.clear().rows.add(linhas).draw();
                }

                $('#tabela_doacoes').show();
                $("#loader").hide();
            })
            .catch(err => {
                console.error("Erro geral ao buscar detalhes:", err);
                alert("Erro ao carregar detalhes.");
                $("#loader").hide();
            });
    });
});

function Carregar(id) {
    const token = localStorage.getItem("token");
    fetch(`https://api-rest-doacoes.onrender.com/products/details/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : Promise.reject("Erro ao buscar detalhes."))
    .then(data => {
        $('#modal_doacaoLabel').text(`Solicitar Doação - ${data.title}`);
        $('.modal-body').html(`
            <p><strong>Nome do Doador:</strong> ${data.donor?.name || "N/A"}</p>
            <p><strong>Item:</strong> ${data.title}</p>
            <p><strong>Endereço:</strong> ${data.donor?.address ? `${data.donor.address.street}, ${data.donor.address.number}, ${data.donor.address.city} - ${data.donor.address.state}` : "N/A"}</p>
            <p><strong>Quantidade Disponível:</strong> ${data.availableQuantity} ${data.measure}</p>
            <input type="hidden" id="produtoId" value="${data.id}">
            <div class="mt-2">
                <label>Quantidade desejada:</label>
                <input type="number" id="quantidadeDesejada" class="form-control" min="1" placeholder="Digite a quantidade">
            </div>
            <div class="mt-2">
                <label>Unidade de medida:</label>
                <select id="medidaDesejada" class="form-control">
                    <option value="${data.measure}">${data.measure}</option>
                </select>
            </div>
            <div id="mensagemStatus" class="mt-2 text-center"></div>
        `);
        $('#modal_doacao').modal('show');
    })
    .catch(err => {
        console.error("Erro ao carregar detalhes:", err);
        alert("Erro ao carregar detalhes do produto.");
    });
}

$('#modal_doacao').on('click', '.btn-editar', function() {
    const token = localStorage.getItem("token");
    const ongId = localStorage.getItem("userId"); //$('#ongId').val();
    const produtoId = $('#produtoId').val();
    const quantidade = $('#quantidadeDesejada').val();
    const medida = $('#medidaDesejada').val();

    if (!ongId || !quantidade || !medida) {
        $('#mensagemStatus').html(`<div class="alert alert-danger">Preencha todos os campos antes de solicitar.</div>`);
        return;
    }

    fetch("https://api-rest-doacoes.onrender.com/donations/", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId: produtoId, ongId: ongId, quantity: quantidade, measure: medida })
    })
    .then(async res => {
        const resultado = await res.json();
        if (!res.ok) throw new Error(resultado.error || "Erro ao solicitar doação.");
        $('#mensagemStatus').html(`<div class="alert alert-success">Solicitação realizada com sucesso!</div>`);
    })
    .catch(err => {
        console.error("Erro ao solicitar doação:", err);
        $('#mensagemStatus').html(`<div class="alert alert-danger">${err.message}</div>`);
    });
});
