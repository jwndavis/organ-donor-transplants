(function () {

    L.mapbox.accessToken = 'pk.eyJ1IjoianduZGF2aXMiLCJhIjoiY2l6NzRsN2huMDAzNDJxbzFiOXl6d3BjbCJ9.LTLHf072E8bo_vHCfHOggA';


    var map = L.mapbox.map('map', 'mapbox.light', {
        zoomSnap: .1,
        center: [40, -100],
        zoom: 4,
        minZoom: 2,
        maxZoom: 10
    });

    omnivore.csv('data/transplant_donor_data2.csv')
        .on('ready', function (e) {
            drawMap(e.target.toGeoJSON());
            drawLegend(e.target.toGeoJSON());
        })
        .on('error', function (e) {
            console.log(e.error[0].message);
        });

    var options = {
        pointToLayer: function (feature, ll) {
            return L.circleMarker(ll, {
                opacity: 1,
                weight: 2.5,
                fillOpacity: 0
            });
        }
    }

    var labels = {
        "ALL_ORG": "All Organs",
        "KIDNEY": "Kidneys",
        "LIVER": "Livers",
        "PANCREAS": "Pancreas",
        "KID_PAN": "Kidney/Pancreas",
        "HEART": "Hearts",
        "LUNG": "Lungs",
        "HRT_LUN": "Heart/Lung",
        "INTESTINE": "Intestine"
    }

    var attributeValue = "ALL_ORG",
        normValue = "ALL_DON";

    function drawMap(data) {

        console.log(data);

        var transplantLayer = L.geoJson(data, options).addTo(map);
        var donorLayer = L.geoJson(data, options).addTo(map);

        //     map.fitBounds(transplantLayer.getBounds());

        transplantLayer.setStyle({
            color: 'green',
        });
        donorLayer.setStyle({
            color: 'blue',
        });
        
        resizeCircles(transplantLayer, donorLayer, 1991);

        sequenceUI(transplantLayer, donorLayer);

        addUitransplants(transplantLayer);

        addUidonors(donorLayer);

        //updateMap(transplantLayer, donorLayer);
        
    }
//    
//    function updateMap(transplantLayer, donorLayer) {
//        
//        var transplantLayer = L.geoJson(data, options).addTo(map);
//        var donorLayer = L.geoJson(data, options).addTo(map);
//
//        
//        var subtypes = addUitransplants(data),
//            addUidonors;
//            
//        dataLayer.eachLayer(function(layer) {
//            
//            var props = layer.feature.properties;
//            console.log(props);
//            
//            layer.setStyle({
//                color: resizeCircles(subtypes) 
//            });
//        });
//        
//    }

    function calcRadius(val) {
        var radius = Math.sqrt(val / Math.PI);
        return radius * 1.5;
    }

    function resizeCircles(transplantLayer, donorLayer, currentYear) {

        transplantLayer.eachLayer(function (layer) {
            var radius = calcRadius(Number(layer.feature.properties['T' + currentYear]));
            layer.setRadius(radius);
        });
        donorLayer.eachLayer(function (layer) {
            var radius = calcRadius(Number(layer.feature.properties['D' + currentYear]));
            layer.setRadius(radius);
        });

        retrieveInfo(transplantLayer, donorLayer, currentYear);

    }

    function sequenceUI(transplantLayer, donorLayer) {

        var sliderControl = L.control({
            position: 'bottomleft'
        });

        sliderControl.onAdd = function (map) {

            var controls = L.DomUtil.get("slider");

            L.DomEvent.disableScrollPropagation(controls);
            L.DomEvent.disableClickPropagation(controls);

            return controls;

        }

        sliderControl.addTo(map);

        var yearControl = L.control({
            position: 'bottomleft'
        });

        yearControl.onAdd = function (map) {

            var year = L.DomUtil.get("current-year");

            L.DomEvent.disableScrollPropagation(year);
            L.DomEvent.disableClickPropagation(year);

            return year;
        }

        yearControl.addTo(map);

        var output = $('#current-year span');

        $('.slider')
            .on('input change', function () {
                var currentYear = $(this).val();
                resizeCircles(transplantLayer, donorLayer, currentYear);

                output.html(currentYear);
            });

    }

    function addUitransplants(transplantLayer) {

        var transplantMenu = L.control({
            position: 'topright'
        });

        transplantMenu.onAdd = function (map) {

            var div = L.DomUtil.get("ui-organs");

            L.DomEvent.disableScrollPropagation(div);
            L.DomEvent.disableClickPropagation(div);

            return div;
        }
        transplantMenu.addTo(map);

        $('select[id="ALL_ORG"]').change(function () {

            attributeValue = $(this).val();

            drawMap(transplantLayer);
        });

    }

    function addUidonors(donorLayer) {

        var donorMenu = L.control({
            position: 'topright'
        });

        donorMenu.onAdd = function (map) {

            var div = L.DomUtil.get("ui-donors");

            L.DomEvent.disableScrollPropagation(div);
            L.DomEvent.disableClickPropagation(div);

            return div;
        }
        donorMenu.addTo(map);

        $('select[id="ALL_DON"]').change(function () {

            normValue = $(this).val();

            drawMap(donorLayer);
        });

    }

    function drawLegend(data) {

        var legend = L.control({
            position: 'bottomright'
        });
        legend.onAdd = function (map) {

            var div = L.DomUtil.get("legend");

            L.DomEvent.disableScrollPropagation(div);
            L.DomEvent.disableClickPropagation(div);

            return div;

        }
        legend.addTo(map);

        var dataValues = [];

        data.features.map(function (state) {

            for (var year in state.properties) {

                var attribute = state.properties[year];

                if (Number(attribute)) {

                    dataValues.push(attribute);
                }
            }
            //   console.log(dataValues);
        });

        var sortedValues = dataValues.sort(function (a, b) {
            return b - a;

            console.log(sortedValues);
        });

        var maxValues = Math.round(sortedValues[0] / 1000) * 1000;

        console.log(maxValues);

        var largeDiameter = calcRadius(maxValues) * 2,
            smallDiameter = largeDiameter / 2;

        $(".legend-circles").css('height', largeDiameter.toFixed());

        $('.legend-large').css({
            'width': largeDiameter.toFixed(),
            'height': largeDiameter.toFixed()
        });

        $('.legend-small').css({
            'width': smallDiameter.toFixed(),
            'height': smallDiameter.toFixed(),
            'top': largeDiameter - smallDiameter,
            'left': smallDiameter / 2
        });

        $(".legend-large-label").html(maxValues);
        $(".legend-small-label").html((maxValues / 2));

        $(".legend-large-label").css({
            'top': -11,
            'left': largeDiameter + 30,
        });

        $(".legend-small-label").css({
            'top': smallDiameter - 11,
            'left': largeDiameter + 30
        });

        $("<hr class='large'>").insertBefore(".legend-large-label")
        $("<hr class='small'>").insertBefore(".legend-small-label").css('top', largeDiameter - smallDiameter - 8);

    }

    function retrieveInfo(transplantLayer, donorLayer, currentYear) {

        var info = $('#info');

        donorLayer.on('mouseover', function (e) {

            info.removeClass('none').show();

            var props = e.layer.feature.properties;

            $('#info span').html(props.State_Name);
            $(".transplants span:first-child").html('(' + currentYear + ')');
            $(".donors span:first-child").html('(' + currentYear + ')');
            $(".transplants span:last-child").html(props['T' + currentYear]);
            $(".donors span:last-child").html(props['D' + currentYear]);

            e.layer.setStyle({
                fillOpacity: .6
            });

            donorLayer.on('mouseout', function (e) {
                info.hide();
                e.layer.setStyle({
                    fillOpacity: 0
                });
            });

            $(document).mousemove(function (e) {

                info.css({
                    "left": e.pageX + 6,
                    "top": e.pageY - info.height() - 25
                });

                if (info.offset().top < 4) {
                    info.css({
                        "top": e.pageY + 15
                    });
                }

                if (info.offset().left + info.width() >= $(document).width() - 40) {
                    info.css({
                        "left": e.pageX - info.width() - 80
                    });
                }
            });

            var transplantValues = [],
                donorValues = [];

            for (var i =    1991; i <= 2016; i++) {
                transplantValues.push(props['T' + i]);
                donorValues.push(props['D' + i]);
            }

            $('.transplantspark').sparkline(transplantValues, {
                width: '200px',
                height: '30px',
                lineColor: '#035a03',
                fillColor: '#57c957',
                spotRadius: 0,
                lineWidth: 2
            });

            $('.donorspark').sparkline(donorValues, {
                width: '200px',
                height: '30px',
                lineColor: 'blue',
                fillColor: 'cornflowerblue',
                spotRadius: 0,
                lineWidth: 2
            });
        });
    }
})();
