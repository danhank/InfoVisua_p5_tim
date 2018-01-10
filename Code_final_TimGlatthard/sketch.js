// musedata.connect() verbindung zu einem muse-messgerät, mit fake() werden uns erfundene werde zur verfügung gestellt
//var muse = musedata.connect('http://127.0.0.1:8081');
var muse = musedata.fake();

var id = 1;
var img;
var imgHomescreen;
var imgFahren;
var imgDashboard;

var downhillLenght = 2500;
var startTempo = 2;
var rythm = 6;

//for dashboard
var resizeFactor = 1024/downhillLenght-0.05;
//console.log(resizeFactor);

var lineArray = [];
var posArray = [];
var alphaArray = [];
var pos; //vector for position
var vel; //vector for velocity
var acc; //vector for acceleration
var startDirectionArray = [-1,1]; // array for start to the right  (1) or to the left (-1)
var startDirection = startDirectionArray[Math.floor(Math.random()*startDirectionArray.length)];

//variable storing dynamic threshold
var thresh = dynamicThreshold();

var startButton;
var restartButton;


//empty arrays for individual parts of trace
var vertexStart = [];
var vertexEnd = [];
var vertexStroke = [];
var lastPartArray = [vertexStart,vertexEnd,vertexStroke];


// -------------------------------------------------------------------------------------
// GENERAL FUNCTIONS
// -------------------------------------------------------------------------------------
function restart(){
  loop();
  restartButton.hide();
  //select new random direction for start
  startDirection = startDirectionArray[Math.floor(Math.random()*startDirectionArray.length)];
}

function start(){
  loop();
  startButton.hide();
  //console.log('Startwert gefahrene Linie: '+  acc.x);
  img = imgFahren;
  imgWidth = 768;
  imgHeight = imgFahren.height*0.48;
}

// -------------------------------------------------------------------------------------
// PRELOAD FUNCTION
// -------------------------------------------------------------------------------------

function preload(){
  //img for home screen
  imgHomescreen = loadImage('assets/homescreen_v8.png');
  //bg for bg while fahren
  imgFahren = loadImage('assets/fahren_BG_v6.png');
  //BG for dashboard
  imgDashboard = loadImage('assets/dashboard_BG_v12.png');

  FontCovesBold = loadFont('assets/Coves Bold.otf');
  FontCovesLight = loadFont('assets/Coves Light.otf');
}


// -------------------------------------------------------------------------------------
// SETUP FUNCTION
// -------------------------------------------------------------------------------------
function setup() {
  createCanvas(768,1024);
  frameRate(30);

  pos = createVector(width/2,140);      //pos für startposition
  vel = createVector(0,startTempo);   //vel für beschleunigung gegen unten
  acc = createVector(startDirection,0);            //acc für links/rechts ausschlag

  restartButton = createButton('NEUE FAHRT STARTEN');
  restartButton.position(width/2-20,height-300);
  restartButton.mousePressed(restart);
  restartButton.addClass('restartButton');
  restartButton.hide();

  startButton = createButton('START');
  startButton.position(width/2-80,height/2+300);
  startButton.addClass('startButton');
  startButton.mousePressed(start);

  img = imgHomescreen;
  imgWidth = 769;
  imgHeight = 1024;

  noLoop();
}

// -------------------------------------------------------------------------------------
// DRAW FUNCTION
// -------------------------------------------------------------------------------------
function draw() {

  background(250);
  image(img, 0, 0, imgWidth, imgHeight);




//text
/* --------------------------------- */
  // noStroke();
  // fill(0);
  // if(acc.x > 0 ){
  //   fill(250,0,0);
  // }
  // textSize(16);
  // var beschl;
  // if(acc.x > 0){
  //   beschl = 'rechts';
  // } else{
  //   beschl = 'links';
  // }
  // var beschZahl = acc.x;
  // beschZahl = beschZahl.toFixed(4);
  //
  // var richtung;
  // if(vel.x > 0){
  //   richtung = 'rechts';
  // } else{
  //   richtung = 'links';
  // }
  // var richtungZahl = vel.x;
  // richtungZahl = richtungZahl.toFixed(4);
  //
  // var tempo = vel.y;
  // tempo = tempo.toFixed(4);
  //
  // var posZahl = pos.x;
  // posZahl = posZahl.toFixed(0);
  //
  // text('Beschleunigung: ' + beschl + ' ('+beschZahl+')',10,40);
  // fill(0);
  // text('Richtung: ' + richtung + ' ('+richtungZahl+')',10,60);
  // text('Tempo: ' + tempo,10,80);
  // text('Position X: ' + (posZahl-300),10,100);
  // text('Position Y: ' + pos.y,10,120);



  /* ----------------------------------- */

// messurement & data
/* --------------------------------- */
  var delta_relative = muse.get('/muse/elements/delta_relative');

  // .getAlpha() liefert durchschnittswert vom alpha-wert aller elektroden mit guten kontakt
  var _alpha = muse.getAlpha();
  //console.log('alpha ist so viel: '+_alpha);
  var _beta = muse.getBeta();
  //console.log('beta ist so viel: '+_beta);
  var _gamma = muse.getGamma();
  //console.log('gamma ist so viel: '+_gamma);
  var _theta = muse.getTheta();
  //console.log('theta ist so viel: '+_theta);


  /* ** messurement ** */
  museAcc = map(_alpha,0,1,.1,1.5); //random(0.1,1.5);

  museAccShort = museAcc.toFixed(2);
  accXShort = acc.x.toFixed(2);
  // text('museAcc: ' + museAccShort,10,160);
  // text('acc.x: ' + accXShort,10,180);

  var threshold = thresh.threshold(_alpha);
  if(_alpha > threshold && rythm < 7){
    rythm += .01;
    if(vel.y > 2){
      vel.y -= .01;
    }
  } else if (_alpha < threshold && rythm > 3) {
    rythm -= .1;
    if(vel.y < 7){
      vel.y += .01;
    }
  }
  /* ----------------------------------- */

//calculation & physics
/* --------------------------------- */
  //sobald vel.x (=0) grösser als randomVel ist, fährt man in gegen links
  var randomNumber = random(0,2);
  if(vel.x > rythm+randomNumber){
    acc.set(-museAcc,0);
  }
  //sobald vel.x (=0) kleiner als negativ randomVel ist, fährt man in gegen rechts
  else if(vel.x < -rythm+(-randomNumber)){
    acc.set(museAcc,0);
  }

//text console
  // fill(0);
  // noStroke();
  // textSize(12);
  // text('ID: ' + id,10,20);
  // text('acc.x: ' + acc.x,10,180);
  // text('vel.x: ' + vel.x,10,200);
  // text('Tempo: ' + vel.y,10,220);
  // text('rythm: ' + rythm,10,260);
  // text('Alpha: ' + _alpha, 10,280);
  // text('Thresh: ' + threshold, 10,300);

  //update velocity
  vel.add(acc);

  //update position
  //new pos = old pos + vel
  pos.add(vel);
  posArray.push(createVector(pos.x,pos.y));

  //store current alpha value
  alphaArray.push(_alpha);
  /* --------------------------------- */

//line
/* --------------------------------- */
  push();
  if(pos.y > height/2 && pos.y < downhillLenght-height/2){
    translate(0,height/2-pos.y);
    image(img, 0, 0, imgWidth, imgHeight);
  }
  else if(pos.y >= downhillLenght-height/2) {
    translate(0,-downhillLenght + height);
    image(img, 0, 0, imgWidth, imgHeight);
  }
  noFill();
  stroke(50);
  if(_alpha > threshold){
    stroke(250,0,0);
  }

  var red = 0;
//line behind skifahrer
  beginShape();
  for(var i = 0; i < posArray.length; i++){
  //original
    var p = posArray[i];
    stroke(118,33,50);
    strokeWeight(3);
    vertex(p.x,p.y);
  }
  endShape();
//circle which represents skifahrer
  stroke(140,48,70);
  strokeWeight(2);
  ellipse(pos.x,pos.y,10,10);

  pop();


  if(pos.y > downhillLenght-40){
    lineArray.push(posArray);
  //reset startvalues for next line
    pos.y = 140;
    pos.x = posArray[0].x;
    vel.y = startTempo;
    vel.x = 2;
    acc.x = startDirection;
    rythm = 6;
    noLoop();
    background(250);
    restartButton.show();

    dashboard(id);
    posArray = [];                //clear posArray for a new line
    alphaArray = [];
    startTempo = 2;            //clear alphaArray for a new line
    id++;
    //console.log('Startwert fuer neue Linie: '+  acc.x);
  }
}

function dashboard(id){
  //background(250);

  image(imgDashboard, 0, 0, imgDashboard.width/2, imgDashboard.height/2);
  textSize(18);
  fill(0);
  noStroke();
  //text('Dashboard',width/2,height/2);
  beginShape();
  //console.log(lineArray[id-1].length);

//vertex für die gerade gefahrene linien
  for(var i = 0; i < lineArray[id-1].length; i++){
    var p = lineArray[id-1][i];
    stroke(118,33,50);
    strokeWeight(2);
    noFill();
    //map height of whole line to canvas height 1024px
    vertex(p.x*resizeFactor+20,p.y*resizeFactor+100);
  }
  //console.log('alpha Length: '+alphaArray.length);
  //console.log('pos Length: '+lineArray[id-1].length);
  endShape();

  console.log('Anzahl Linien: '+lineArray.length);

//vertex für einzelne linien, die bereits runter gefahren sind
  var opacity = 90;
  for(var b = 0; b < lineArray.length; b++){
    beginShape();
    for(var i = 0; i < lineArray[b].length; i++){
      var p = lineArray[b][i];
      stroke(90,145,242,opacity);
      strokeWeight(1);
      noFill();
      //map height of whole line to canvas height 1024px
      vertex(p.x*resizeFactor+20,p.y*resizeFactor+100);
    }
    console.log('Linie '+(b+1)+' hat '+lineArray[b].length + ' Meter');
    meter = lineArray[b].length;
    endShape();
  }

  // get average alpha value
  var sumAlpha = alphaArray.reduce(add, 0);
  function add(a, b) {
      return a + b;
  }

  var averageAlpha = (sumAlpha/alphaArray.length)*100;
  //(console.log(averageAlpha);

//dashboard text
  fill(160,55,80);
  noStroke();
  textFont(FontCovesBold);
  textSize(20);
  text(id, 625,322);
  text(averageAlpha.toFixed(2)+' %',625,379);
  text((meter/2.4).toFixed(0) + ' Meter',625,436);


  if(id > 1){
    fill(127,85,95);
    textFont(FontCovesLight);
    textSize(16);
    text('bereits gefahrene Spuuren', 450,633);
    beginShape();
    stroke(90,145,242,90);
    strokeWeight(2);
    noFill();
    vertex(625,630);
    vertex(675,630);
    endShape();
  }
}
