// musedata.connect() verbindung zu einem muse-messgerät, mit fake() werden uns erfundene werde zur verfügung gestellt
var muse = musedata.fake();

var lineArray = [];
var posArray = [];
var pos; //vector for position
var vel; //vector for velocity
var acc; //vector for acceleration

var rythm = 4;

//variable storing dynamic threshold
var thresh = dynamicThreshold();


//empty arrays for individual parts of trace
var vertexStart = [];
var vertexEnd = [];
var vertexStroke = [];
var lastPartArray = [vertexStart,vertexEnd,vertexStroke];

function setup() {
  createCanvas(768,1024);
  frameRate(30);

  var startTempo;
  startTempo = 2;


  pos = createVector(width/2,0);      //pos für startposition
  vel = createVector(0,startTempo);   //vel für beschleunigung gegen unten
  acc = createVector(1,0);            //acc für links/rechts ausschlag
}

function draw() {
  background(240);

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
  if(_alpha > threshold && rythm < 8){
    rythm += .02;
    //vel.y += .01;
  } else if (_alpha < threshold && rythm > 2) {
    rythm -= .05;
    //vel.y -= .02;
  }
  // do{
  //     rythm -= 0.1;
  //   } while(_alpha > threshold && rythm > 1.9);
  //
  // do{
  //     rythm += 0.1;
  //   } while(_alpha < threshold && rythm < 20);
  /* ----------------------------------- */

//calculation & physics
/* --------------------------------- */
  //sobald vel.x (=0) grösser als randomVel ist, fährt man in gegen links
  if(vel.x > rythm){
    acc.set(-museAcc,0);
  }
  //sobald vel.x (=0) kleiner als negativ randomVel ist, fährt man in gegen rechts
  else if(vel.x < -rythm){
    acc.set(museAcc,0);
  }

  // text('vel.x: ' + vel.x,10,200);
  // text('rythm: ' + rythm,10,260);
  // text('Alpha: ' + _alpha, 10,280);
  // text('Thresh: ' + threshold, 10,300);

  //update velocity
  vel.add(acc);

  //update position
  //new pos = old pos + vel
  pos.add(vel);
  posArray.push(createVector(pos.x,pos.y));
  /* --------------------------------- */

//line
/* --------------------------------- */
  push();
  if(pos.y > height/2 && pos.y < 1500-height/2){
    translate(0,height/2-pos.y);
  }
  else if(pos.y >= 1500-height/2) {
    translate(0,-1500 + height);
  }
  noFill();
  stroke(50);
  if(_alpha > threshold){
    stroke(250,0,0);
  }

  var red = 0;
  beginShape();
  for(var i = 0; i < posArray.length; i++){
    var p = posArray[i];
    stroke(100);
    vertex(p.x,p.y);
    red++;
  }
  endShape();
  ellipse(pos.x,pos.y,7,7);
  //etInterval(drawEllipse(pos.x,pos.y),1000);

  if(posArray.length > 2){
    beginShape();
    var lastPoint = posArray[posArray.length-1];
    var seclastPoint = posArray[posArray.length-2];
    var randomRed;
    randomRed = random(100,160);
    strokeWeight(2);
    for(var i = 1; i < posArray.length; i++){
      var posPoint = posArray[posArray.length-(i*1)];
      stroke(randomRed,0,255);
      vertex(posPoint.x,posPoint.y);
    }
    // vertex(lastPoint.x,lastPoint.y);
    // vertex(seclastPoint.x,seclastPoint.y);
    endShape();
  }
  pop();

  if(pos.y > 1500){
    lineArray.push(posArray);
    pos.y = 0;
    pos.x = posArray[0].x;
    vel.y = 2;
    posArray = [];                //clear posArray for a new line


    // for(var i = 0; i < lineArray.length; i++){
    //   console.log('Anzahl Linien: ' + lineArray.length);
    //   var counter = 0;
    //   noFill();
    //   stroke(220);
    //   beginShape();
    //   //vertex für einzelne linien, die bereits runter gefahren sind
    //   for(var i = 0; i < lineArray[counter].length; i++){
    //     var p = lineArray[counter][i];
    //     vertex(p.x,p.y);
    //   }
    //   endShape();
    //   counter++;
    // }
  }
}

function drawEllipse(x,y){
  fill(200,100,100);
  noStroke();
  ellipse(x,y,7,7);
}
