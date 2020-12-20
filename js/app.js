(function () {
    
    L.mapbox.accessToken = 'pk.eyJ1IjoianduZGF2aXMiLCJhIjoiY2l6NzRsN2huMDAzNDJxbzFiOXl6d3BjbCJ9.LTLHf072E8bo_vHCfHOggA';

    var map = L.mapbox.map('map')
        .setView([40, -92], 4)
        .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/outdoors-v9'));
    
   // var map = L.mapbox.map('map', 'mapbox.outdoors', {
    //    zoomSnap: .1,
    //    center: [40, -92],
    //    zoom: 4,
    //    minZoom: 3,
    //    maxZoom: 7
   // });

    omnivore.csv('data/transplant_donor_data2.csv')
        .on('ready', function (e) {
            drawMap(e.target.toGeoJSON());
            drawLegend(e.target.toGeoJSON());
            retrieveInfo(e.target.toGeoJSON());
        })
        .on('error', function (e) {
            console.log(e.error[0].message);
        });

    var options = {
        pointToLayer: function (feature, ll) {
            return L.circleMarker(ll, {
                opacity: 1,
                weight: 1.7,
                fillOpacity: 0
            });
        }
    }

    var currentYear = "1991",
        currentTransplantType = "ALL",
        currentDonorType = "ALL"

    var transplantLayer,
        donorLayer;

    function drawMap(data) {

        transplantLayer = L.geoJson(data, options).addTo(map);

        donorLayer = L.geoJson(data, options).addTo(map);

        transplantLayer.setStyle({
            color: 'green',
        });

        donorLayer.setStyle({
            color: 'blue',
        });

        resizeCircles();

        sequenceUI();

        addUitransplants();

    }

    function calcRadius(val) {
        var radius = Math.sqrt(val / Math.PI);
        return radius * 1.7;
    }


    function resizeCircles() {

        transplantLayer.eachLayer(function (layer) {
            var radius = calcRadius(Number(layer.feature.properties['T' + currentYear + '_' + currentTransplantType]));
            if (Number(radius)) {
                layer.setRadius(radius);
            }
        });
        donorLayer.eachLayer(function (layer) {
            var radius = calcRadius(Number(layer.feature.properties['D' + currentYear + '_' + currentDonorType]));
            if (Number(radius)) {
                layer.setRadius(radius);
            }
        });

    }

    function sequenceUI() {

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
                currentYear = $(this).val();
                resizeCircles();

                output.html(currentYear);
            });

    }

    function addUitransplants() {

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

        if ($('select[id="SEL_ORG"]')) {

            $('select[id="SEL_ORG"]').change(function () {

                currentTransplantType = $(this).val();

                resizeCircles(currentTransplantType);
            });
        }
        if ($('select[id="SEL_DON"]')) {

            $('select[id="SEL_DON"]').change(function () {

                currentDonorType = $(this).val();

                resizeCircles(currentDonorType);
            });

        }

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

        });

        var sortedValues = dataValues.sort(function (a, b) {
            return b - a;

            console.log(sortedValues);
        });

        var maxValues = Math.round(sortedValues[0] / 1000) * 1000;

        var largeDiameter = calcRadius(maxValues) * 2,
            smallDiameter = largeDiameter / 2,
            xsmallDiameter = largeDiameter / 4;

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

        $('.legend-xsmall').css({
            'width': xsmallDiameter.toFixed(),
            'height': xsmallDiameter.toFixed(),
            'top': largeDiameter - xsmallDiameter,
            'left': xsmallDiameter * 1.5
        });

        $(".legend-large-label").html(maxValues);
        $(".legend-small-label").html((maxValues / 2));
        $(".legend-xsmall-label").html((maxValues / 4));

        $(".legend-large-label").css({
            'top': -11,
            'left': largeDiameter + 30
        });

        $(".legend-small-label").css({
            'top': smallDiameter - 11,
            'left': largeDiameter + 30
        });

        $(".legend-xsmall-label").css({
            'top': largeDiameter - xsmallDiameter - 11,
            'left': largeDiameter + 30
        });

        $("<hr class='large'>").insertBefore(".legend-large-label")
        $("<hr class='small'>").insertBefore(".legend-small-label").css('top', largeDiameter - smallDiameter - 8);
        $("<hr class='xsmall'>").insertBefore(".legend-xsmall-label").css('top', largeDiameter - xsmallDiameter - 8);

    }

    function retrieveInfo() {

        var info = $('#info');

        donorLayer.on('mouseover', function (e) {

            info.removeClass('none').show();

            var props = e.layer.feature.properties;

            $('#info span').html(props.State);
            $(".transplants span:first-child").html('(' + currentTransplantType + ' ' + currentYear + ')');
            $(".donors span:first-child").html('(' + currentDonorType + ' ' + currentYear + ')');
            $(".transplants span:last-child").html(props['T' + currentYear + '_' + currentTransplantType]);
            $(".donors span:last-child").html(props['D' + currentYear + '_' + currentDonorType]);

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

            for (var i = 1991; i <= 2016; i++) {
                transplantValues.push(props['T' + i + '_' + currentTransplantType]);
                donorValues.push(props['D' + i + '_' + currentDonorType]);
            }

            $('.transplantspark').sparkline(transplantValues, {
                width: '225px',
                height: '30px',
                lineColor: '#035a03',
                fillColor: '#57c957',
                spotRadius: 0,
                lineWidth: 2
            });

            $('.donorspark').sparkline(donorValues, {
                width: '225px',
                height: '30px',
                lineColor: 'blue',
                fillColor: 'cornflowerblue',
                spotRadius: 0,
                lineWidth: 2
            });
        });
    }
})();