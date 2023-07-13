'use strict';

/*!
 * Initiates event coundown
 */

var eventCountdownElement = document.getElementById("event-countdown");
if(eventCountdownElement){
    var introTimer = countdown(
        function(ts) {
            if(ts.value > 0){
                document.getElementById("d-left").innerHTML = ts.days;
                document.getElementById("h-left").innerHTML = ("0" + ts.hours).slice(-2);
                document.getElementById("m-left").innerHTML = ("0" + ts.minutes).slice(-2);
                document.getElementById("s-left").innerHTML = ("0" + ts.seconds).slice(-2);
            }
        },
        new Date("2023-12-17T00:00:00Z"),
        countdown.DAYS|countdown.HOURS|countdown.MINUTES|countdown.SECONDS);
}

'use strict';

/*!
 * Header animation for ML in PL Theme
 */

const canvas = document.getElementById("intro-background"),
      ctx = canvas.getContext("2d"),
      fps = 30,  // To make it less cpu intensive, we only update the canvas every 30 frames
      framesInterval = 1000 / 30;

let then = 0,
    width = 0,
    height = 0,
    bgParticles = [], // Background particles
    mgParticles = [], // Middle ground particles
    fgParticles = [], // Foreground particles
    connectionDistanceThreshold = 125,
    backgroundColor = "#FFFFFF",
    bgParticlesCfg = {
        colors: "#EEE",
        lineColors: "#EEE",
        sizeMin: 4,
        sizeRange: 3,
        speedMax: 0.4,
        groups: [[0, 1], [0, 2], [1, 2]],
        density: 0.00015
    },
    mgParticlesCfg = {
        colors: "#AAA",
        lineColors: "#AAA",
        sizeMin: 2,
        sizeRange: 2,
        speedMax: 0.6,
        groups: [[]], // This group of particles has no connecting lines
        density: 0.00015
    },
    fgParticlesCfg = {
        colors: {"#6DB6C6": 0.2, "#000000": 0.8},
        lineColors: {"#000": 0.3, "#222": 0.3, "#444": 0.3},
        sizeMin: 2,
        sizeRange: 5,
        speedMax: 0.8,
        groups: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4], [0], [1], [2], [3], [4], [0], [1], [2], [3], [4]],
        density: 0.0003
    };

// Helper functions
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function rulletChoice(dict){
    let total = 0;
    for (let key in dict) total += dict[key];
    let r = Math.random() * total;
    for (let key in dict){
        r -= dict[key];
        if (r < 0) return key;
    }
}

// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean=0, stdev=1) {
    let u = 1 - Math.random(); //Converting [0,1) to (0,1)
    let v = Math.random();
    let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

function distVec2d(vec1, vec2){
    return Math.sqrt(Math.pow(vec1.x - vec2.x, 2) + Math.pow(vec1.y - vec2.y, 2));
}

function wrappedDistVec2d(vec1, vec2){
    let dist = distVec2d(vec1, vec2);
    if (dist > width / 2) dist = width - dist;
    return dist;
}

function drawParticle(p){
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI, false);
    ctx.fill();
}

function drawLine(p1, p2){
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineWidth = 1;
    ctx.strokeStyle = p1.lineColor;
    ctx.stroke();
}

function updateParticle(p){
    let prevSinVal = Math.sin(p.x / p.freq) * p.amp;
    p.x += p.velX;
    let nextSinVal = Math.sin(p.x / p.freq) * p.amp;
    p.y += p.velY * (prevSinVal - nextSinVal);

    // Wrap around the left and right
    if(p.x < -connectionDistanceThreshold) p.x = width + connectionDistanceThreshold; 
    else if(p.x > width + connectionDistanceThreshold) p.x = -connectionDistanceThreshold;
    if(p.y + p.size >= height) p.velY *= -1;
}

function drawParticles(particles){
    // Update position of particles
    for (let p of particles) updateParticle(p);

    // Draw lines between particles in the same group
    for (let i = 0; i < particles.length - 1; i++){
        // Skip particles that are not in any group - can't connect to any other particle
        if (particles[i].groups.length === 0) continue;

        for(let j = i + 1;  j < particles.length; j++){
            const p1 = particles[i],
                  p2 = particles[j];

            // This part can be done faster by creating indexes for groups, but I'm too lazy to implemt it
            if(distVec2d(p1, p2) > connectionDistanceThreshold) continue;

            for (let g of p1.groups){  
                if (p2.groups.includes(g)){
                    drawLine(p1, p2);
                    break;
                }
            }
        }
    }

    // Draw all particles
    for (let p of particles) drawParticle(p);
}
    
function draw(){
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    drawParticles(bgParticles);
    drawParticles(mgParticles);
    drawParticles(fgParticles);
}
    
function createParticles(x, y, width, height, particlesCfg) {
    let newParticlesCount = width * height * particlesCfg.density,
        newParticles = [];

    // Create new particles
    for(let i = 0; i < newParticlesCount; i++){
        newParticles.push({
            x: Math.random() * (width + 2 * connectionDistanceThreshold) + x - connectionDistanceThreshold,
            y: gaussianRandom(0, 1) * 1 / 3 * height + y,
            velX: (Math.random() * 2 - 1) * particlesCfg.speedMax,
            velY: 1,
            freq: Math.random() * 100 + 100,
            amp: Math.random() * 100,
            size: Math.random() * particlesCfg.sizeRange + particlesCfg.sizeMin,
            color: typeof particlesCfg.colors === "string" ? particlesCfg.colors : rulletChoice(particlesCfg.colors),
            lineColor: typeof particlesCfg.lineColors === "string" ? particlesCfg.lineColors : rulletChoice(particlesCfg.lineColors),
            groups: randomChoice(particlesCfg.groups),
        });
    }

    return newParticles;
}

function spawnParticles(x, y, width, height) {
    bgParticles.push(...createParticles(x, y, width, height, bgParticlesCfg));
    mgParticles.push(...createParticles(x, y, width, height, mgParticlesCfg));
    fgParticles.push(...createParticles(x, y, width, height, fgParticlesCfg));
}

function removeOutOfBoundsParticles(particles) {
    return particles.filter(function(p){
        return !(p.x < 0 || p.x > width || p.y < 0 || p.y > height);
    });
}
    
function resize() {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Reset and generate new particles 
    // (this is easier than trying to resize the existing ones)
    bgParticles = [];
    mgParticles = [];
    fgParticles = [];
    spawnParticles(0, 0, width, height);
}

function render() {
    const now = Date.now();
    let timeElapsed = now - then;

    // Stop animation when tab is not visible to save resources
    if(document.hidden){
        then = now;
        timeElapsed = 0;
    }

    // Limit framerate
    if (timeElapsed >= framesInterval){
        // Get ready for next frame by setting then=now,
        // also, adjust for screen refresh rate
        then = now - (timeElapsed % framesInterval);

        // Check if resize is needed
        if(width !== canvas.offsetWidth || height !== canvas.offsetHeight) resize();

        // Update animation
        draw();
    }
    requestAnimationFrame(render);
}

render();
    

/*!
 * ML in PL Theme, based on Grayscale Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery to collapse the navbar on scroll
$(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
});

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

// remove the focused state after click,
// otherwise bootstrap will still highlight the link
$("a").mouseup(function(){
    $(this).blur();
})

/*
// Google Maps Scripts
// When the window has finished loading create our google map below
google.maps.event.addDomListener(window, 'load', init);

function init() {
    // Basic options for a simple Google Map
    // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var mapOptions = {
        // How zoomed in you want the map to start at (always required)
        zoom: 15,

        // The latitude and longitude to center the map (always required)
        center: new google.maps.LatLng(40.6700, -73.9400), // New York

        // Disables the default Google Maps UI components
        disableDefaultUI: true,
        scrollwheel: false,
        draggable: false,

        // How you would like to style the map. 
        // This is where you would paste any style found on Snazzy Maps.
        styles: [{
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 17
            }]
        }, {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 20
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 17
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 29
            }, {
                "weight": 0.2
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 18
            }]
        }, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 16
            }]
        }, {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 21
            }]
        }, {
            "elementType": "labels.text.stroke",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#000000"
            }, {
                "lightness": 16
            }]
        }, {
            "elementType": "labels.text.fill",
            "stylers": [{
                "saturation": 36
            }, {
                "color": "#000000"
            }, {
                "lightness": 40
            }]
        }, {
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 19
            }]
        }, {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 20
            }]
        }, {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 17
            }, {
                "weight": 1.2
            }]
        }]
    };

    // Get the HTML DOM element that will contain your map 
    // We are using a div with id="map" seen below in the <body>
    var mapElement = document.getElementById('map');

    // Create the Google Map using out element and options defined above
    var map = new google.maps.Map(mapElement, mapOptions);

    // Custom Map Marker Icon - Customize the map-marker.png file to customize your icon
    var image = 'img/map-marker.png';
    var myLatLng = new google.maps.LatLng(40.6700, -73.9400);
    var beachMarker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        icon: image
    });
}
*/