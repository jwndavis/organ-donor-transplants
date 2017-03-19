(function () {

    L.mapbox.accessToken = 'pk.eyJ1IjoianduZGF2aXMiLCJhIjoiY2l6NzRsN2huMDAzNDJxbzFiOXl6d3BjbCJ9.LTLHf072E8bo_vHCfHOggA';

    // create the Leaflet map using mapbox.light tiles
    var map = L.mapbox.map('map', 'mapbox.light', {
        zoomSnap: .1,
        center: [40, -100],
        zoom: 4,
        minZoom: 2,
        maxZoom: 10
    });





    // load CSV data
    omnivore.csv('data/transplants_states2.csv')
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
    
    // define the attributes for the labels
        var labels = {
            "ALL_ORG": "All Organs",
            "KIDNEY": "Kidneys",
            "LIVER": "Livers",
            "HEART": "Hearts",
            "PANCREAS": "Pancreas",
            "KID_PAN": "Kidney/Pancreas",
            "LUNG": "Lungs",
            "HRT_LUN": "Heart/Lung",
            "INTESTINE": "Intestine"
        }

        // set global variables mapped attribute, and normalizing attribute
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
        
    }

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

        // create Leaflet control for the slider
        var sliderControl = L.control({
            position: 'bottomleft'
        });
        
        // when added to the map
        sliderControl.onAdd = function (map) {

            // select the element with id of 'slider'
            var controls = L.DomUtil.get("slider");

            // disable the mouse events
            L.DomEvent.disableScrollPropagation(controls);
            L.DomEvent.disableClickPropagation(controls);

            // add slider to the control
            return controls;

        }
        
        // add the control to the map
        sliderControl.addTo(map);

        var yearControl = L.control({
            position: 'bottomleft'
        });
        
        yearControl.onAdd = function(map) {

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
        
        transplantMenu.onAdd = function(map) {
            
            // select the element with id of 'legend'
                var div = L.DomUtil.get("ui-organs");

                // disable the mouse events
                L.DomEvent.disableScrollPropagation(div);
                L.DomEvent.disableClickPropagation(div);

                // add legend to the control
                return div;
        }
        transplantMenu.addTo(map);
        
            // select the user interaction controls for each attirbute id in the div element and changing the attribute when clicked
            $('select[id="ALL_ORG"]').change(function() {

                // reassigning the global attributeValue and returning that value
                attributeValue = $(this).val();

                // redrawing the counties in the updateMap function
                //updateMap(transplantLayer);

            });

        }
    
    function addUidonors(donorLayer) {

        var donorMenu = L.control({
            position: 'topright'
        });
        
        donorMenu.onAdd = function(map) {
            
            // select the element with id of 'legend'
                var div = L.DomUtil.get("ui-donors");

                // disable the mouse events
                L.DomEvent.disableScrollPropagation(div);
                L.DomEvent.disableClickPropagation(div);

                // add legend to the control
                return div;
        }
        donorMenu.addTo(map);
        
            // select the user interaction controls for each attirbute id in the div element and changing the attribute when clicked
            $('select[id="ALL_DON"]').change(function() {

                // reassigning the global attributeValue and returning that value
                attributeValue = $(this).val();

                // redrawing the counties in the updateMap function
                //updateMap(donorLayer);

            });

        }
    
    function drawLegend(data) {

        // create Leaflet control for the legend
        var legend = L.control({
            position: 'bottomright'
        });
        // when added to the map
        legend.onAdd = function (map) {

                // select the element with id of 'legend'
                var div = L.DomUtil.get("legend");

                // disable the mouse events
                L.DomEvent.disableScrollPropagation(div);
                L.DomEvent.disableClickPropagation(div);

                // add legend to the control
                return div;

            }
            // add the control to the map
        legend.addTo(map);

        var dataValues = [];

        data.features.map(function(state) {

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

            //raise opacity level as visual affordance
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