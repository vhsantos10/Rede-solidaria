$(document).ready(function () {
  
    $('#tabela_acompanhar_doacoes_ong').DataTable({
      "language": {
          "sProcessing": "Procesando...",
          "sLengthMenu": "Mostrando _MENU_ registros",
          "sZeroRecords": "nenhum resultado encontrado",
          "sEmptyTable": "Não há dados disponíveis nesta tabela",
          "sInfo": "Mostrando registros de _START_ a _END_ de um total de _TOTAL_ registros",
          "sInfoEmpty": "Mostrando registros de 0 a 0 de um total de 0 registros",
          "sInfoFiltered": "(filtrando um total de _MAX_ registros)",
          "sInfoPostFix": "",
          "sSearch": "Buscar:",
          "sUrl": "",
          "sInfoThousands": ",",
          "sLoadingRecords": "Carregando...",
          "oPaginate": {
              "sFirst": "Primero",
              "sLast": "Último",
              "sNext": "Seguinte",
              "sPrevious": "Anterior"
          },
          "oAria": {
              "sSortAscending": ": Marque para classificar a coluna em ordem crescente",
              "sSortDescending": ": Marque para classificar a coluna decrescente"
          }
      },
      "createdRow": function (row, data, dataIndex) {
          $(row).addClass('hover-effect'); // Adiciona uma classe personalizada para hover
      }
  });    
  
  
});

  function Carregar(){

    $("#modal_acompanhar_doacoes_ong").modal("show")
  
  }