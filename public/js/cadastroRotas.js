$(document).ready(function() {
    var map = new ol.Map({
        target: 'mapa',
        controls: [
            new ol.control.ScaleLine(),
            new ol.control.ZoomSlider()
        ],
        renderer: 'canvas',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()  // Usando OpenStreetMap diretamente
            })
        ],
        view: new ol.View({
            center: [-6217890.205764902, -1910870.6048274133],
            zoom: 4,
            maxZoom: 18,
            minZoom: 2
        })
    });

    // Função para geocodificar um endereço e retornar as coordenadas
    function geocodeEndereco(endereco, callback) {
        // Alteração na URL, agora sem o CORS Anywhere
        $.ajax({
            type: 'GET',
            url: 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(endereco),
            dataType: 'json',
            success: function(response) {
                if (response[0] != undefined) {
                    var lat = parseFloat(response[0].lat);
                    var lon = parseFloat(response[0].lon);
                    callback(lon, lat); // Passa as coordenadas para o callback
                }
            },
            error: function(jqXHR, textStatus) {
                alert('Erro ao geocodificar o endereço: ' + textStatus);
            }
        });
    }

    // Função para traçar a rota usando OpenRouteService
    function calcularRota(origem, destino) {
        var apiKey = '5b3ce3597851110001cf6248607bcd3900874bb5adfeac338aa1acbf'; // Substitua pela sua chave da API OpenRouteService
        var url = 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=' + apiKey + '&start=' + origem + '&end=' + destino;

        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            success: function(response) {
                if (response.routes && response.routes[0]) {
                    var route = response.routes[0].segments[0].steps;
                    var coordinates = [];

                    // Extrair as coordenadas da rota
                    route.forEach(function(step) {
                        coordinates.push([step.start_location[0], step.start_location[1]]);
                    });

                    // Adicionar a rota no mapa
                    var routeLine = new ol.geom.LineString(coordinates);
                    var routeFeature = new ol.Feature({
                        geometry: routeLine
                    });

                    var routeLayer = new ol.layer.Vector({
                        source: new ol.source.Vector({
                            features: [routeFeature]
                        }),
                        style: new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: '#FF0000',
                                width: 3
                            })
                        })
                    });

                    map.addLayer(routeLayer);
                    map.getView().fit(routeLine.getExtent(), { duration: 2000 });
                }
            },
            error: function(jqXHR, textStatus) {
                alert('Erro ao calcular a rota: ' + textStatus);
            }
        });
    }

    // Quando o botão for clicado
    $('button').click(function() {
        var enderecoOrigem = $('#enderecoOrigem').val();
        var enderecoDestino = $('#enderecoDestino').val();

        if (enderecoOrigem && enderecoDestino) {
            geocodeEndereco(enderecoOrigem, function(lonOrigem, latOrigem) {
                geocodeEndereco(enderecoDestino, function(lonDestino, latDestino) {
                    var origem = lonOrigem + ',' + latOrigem;
                    var destino = lonDestino + ',' + latDestino;

                    // Calcular e traçar a rota
                    calcularRota(origem, destino);
                });
            });
        }
    });
});
