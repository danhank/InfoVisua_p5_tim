var terrain;
var img;

var particles = [];

function preload() {
	img = loadImage('assets/heightmap_test5.png');
}

function setup() {
	createCanvas(768, 1024);

	var w = 768;
	var h = 1024;

	//anzahl zellen in der x richtung im vectorfield
	var xResolution = 50;
	terrain = createHeightmap(img, w, h, xResolution);

	frameRate(30);
}

function draw() {
	background(255);


	terrain.drawHeightmap();
	//terrain.drawVectorField();

	//move particles
	for (var i = 0; i < particles.length; i++) {
		var p = particles[i];

		var slope = terrain.getSlope(p.x, p.y);

		p.x += slope.x;
		p.y += slope.y;
	}

	//draw particles
	fill(0);
	noStroke();
	for (var i = 0; i < particles.length; i++) {
		var p = particles[i];
		ellipse(p.x, p.y, 3, 3);
	}


}

function mousePressed() {
	var p = createVector(mouseX, mouseY);
	particles.push(p);
}
