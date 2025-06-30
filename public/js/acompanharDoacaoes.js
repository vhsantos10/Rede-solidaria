$(document).ready(function () {
    const token = localStorage.getItem("token");
    const donorId = localStorage.getItem("userId");

    if (!token || !donorId) {
        alert("Você precisa estar logado.");
        window.location.href = "/View/login.html";
        return;
    }

    $("#loader").show(); // Mostra o spinner

    fetch(`https://api-rest-doacoes.onrender.com/products/?donorId=${donorId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar produtos.");
        return res.json();
    })
    .then(dados => {
        const tbody = $('#tabela_acompanhar_doacoes_body');
        tbody.empty();

        dados.forEach(item => {
            const endereco = item.donor?.address 
                ? `${item.donor.address.street}, ${item.donor.address.number}${item.donor.address.complement ? ', ' + item.donor.address.complement : ''}, ${item.donor.address.city} - ${item.donor.address.state}, CEP: ${item.donor.address.cep}` 
                : "Sem endereço";

            const linha = `
                <tr>
                    <td>${item.title}</td>
                    <td>${item.quantity}</td>
                    <td>${item.measure}</td>
                    <td>${item.description || 'Sem descrição'}</td>
                    <td>${new Date(item.registeredAt).toLocaleDateString("pt-BR")}</td>
                    <td><a class="btn btn-ghost-primary" data-id="${item.id}" onclick="Carregar(this)" style="color:green"><i class="fa-solid fa-pen-to-square"></i></a></td>
                </tr>
            `;
            tbody.append(linha);
        });

        $('#loader').hide(); // Esconde o spinner
        $('#tabela_acompanhar_doacoes').css("display", "table").css("opacity", "1").DataTable({
            destroy: true,
            language: {
                sProcessing: "Processando...",
                sLengthMenu: "Mostrando _MENU_ registros",
                sZeroRecords: "Nenhum resultado encontrado",
                sEmptyTable: "Nenhum dado disponível",
                sInfo: "Mostrando _START_ até _END_ de _TOTAL_ registros",
                sInfoEmpty: "Mostrando 0 até 0 de 0 registros",
                sInfoFiltered: "(filtrado de _MAX_ registros)",
                sSearch: "Buscar:",
                oPaginate: {
                    sFirst: "Primeiro", sLast: "Último", sNext: "Seguinte", sPrevious: "Anterior"
                }
            }
        });
    })
    .catch(err => {
        console.error("Erro ao carregar produtos:", err);
        $('#loader').hide();
        alert("Erro ao carregar produtos.");
    });
});

// Função para carregar detalhes
function Carregar(el) {
    const token = localStorage.getItem("token");
    const productId = $(el).data("id");

    fetch(`https://api-rest-doacoes.onrender.com/products/details/${productId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar detalhes.");
        return res.json();
    })
    .then(data => {
        $('#id_doacao').val(data.id);
        $('#tipo_doacao').val(data.title);
        $('#quantidade_doacao').val(data.quantity);
        $('#medida_doacao').val(data.measure);
        $('#descricao_doacao').val(data.description);
        $('#data_registro_doacao').val(new Date(data.registeredAt).toLocaleDateString("pt-BR"));
        $('#modal_acompanhar_doacoes').modal('show');
    })
    .catch(err => {
        console.error("Erro ao carregar detalhes:", err);
        alert("Erro ao carregar detalhes da doação.");
    });
}
