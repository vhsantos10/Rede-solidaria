/* dashboard.js */
$(function () {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/View/login.html";
    return;
  }

  const payload = JSON.parse(atob(token.split('.')[1]));
  const role = payload.role;

  if (payload.name) {
    const nomeSeguro = $('<div>').text(payload.name).html();
    $("#userDropdown").html(nomeSeguro);
  }

  const $cards = $("#dashboard-cards");
  const $chart = $("#dashboard-chart");

  if (role === "donor") {
    $cards.append(`
      <div class="col-md-4">
        <div class="card shadow-sm rounded p-3">
          <h5>Produtos Cadastrados</h5>
          <p class="display-6 fw-bold" id="produtosCadastrados">12</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm rounded p-3">
          <h5>Doações Solicitadas</h5>
          <p class="display-6 fw-bold" id="doacoesSolicitadas">5</p>
        </div>
      </div>
    `);
  }

  if (role === "ong") {
  $cards.append(`
    <div class="col-md-4">
      <a href="/View/acompanhaDoacoesOng.html" class="text-decoration-none text-dark">
        <div class="card shadow-sm rounded p-3 h-100">
          <h5>Doações Recebidas</h5>
          <p class="display-6 fw-bold" id="doacoesRecebidas">7</p>
        </div>
      </a>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm rounded p-3 h-100">
        <h5>Doações Aguardando Entrega</h5>
        <p class="display-6 fw-bold" id="doacoesAguardando">2</p>
      </div>
    </div>
  `);
}

  if (role === "transporter") {
    $cards.append(`
      <div class="col-md-4">
        <div class="card shadow-sm rounded p-3">
          <h5>Entregas Pendentes</h5>
          <p class="display-6 fw-bold " id="entregasPendentes">4</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm rounded p-3">
          <h5>Entregas Concluídas</h5>
          <p class="display-6 fw-bold" id="entregasConcluidas">10</p>
        </div>
      </div>
    `);

//     $chart.append(`
//   <div class="grafico-wrapper">
//     <canvas id="graficoStatus"></canvas>
//   </div>
// `);



//     const ctx = document.getElementById('graficoStatus').getContext('2d');
//     new Chart(ctx, {
//       type: 'doughnut',
//       data: {
//         labels: ['Pendentes', 'Concluídas'],
//         datasets: [{
//           data: [4, 10],
//           backgroundColor: ['#dc3545', '#28a745']
//         }]
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           legend: { position: 'bottom' },
//           title: { display: true, text: 'Status das Entregas' }
//         }
//       }
//     });
  }
});
