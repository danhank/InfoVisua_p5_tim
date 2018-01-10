function createHeightmap(img, w, h, xRes) {

    var img = img;
    var w = w;
    var h = h;
    var nx = xRes;
    var ny = 0;
    var cellSize = 0;

    var vectorfield;

    var hm = {};

    init();

    function init() {

        console.log('init');
        //how many cells in the width
        //cell size
        cellSize = w / nx;

        //how many cells in the height
        ny = floor(h / cellSize);
        console.log('nx: ' + nx + ' , ny: ' + ny);

        //create vector field
        //vectorfield = create2DArray(nx, ny);

        //resize image to fit dimensions
        //this makes things a bit easier and the height map can be drawn 1:1
        img.resize(w, h);

        //resize to cells
        //img.resize(nx,ny);

        //resize back to size
        //img.resize(w,h);

        //calculate slopes
        vectorfield = calcSlopes3(img, nx, ny);
    }

    function calcSlopes3(im, xdim, ydim) {
        console.log('calcSlopes3');
        var vfield = create2DArray(xdim, ydim);

        im.loadPixels();
        var globalMaxDiff = -1000000;
        for (var i = 0; i < xdim; i++) {
            for (var j = 0; j < ydim; j++) {
                // console.log('i: ' + i + ' j: ' + j);
                //get the center point of current cell
                var cx = floor(i * cellSize + 0.5 * cellSize);
                var cy = floor(j * cellSize + 0.5 * cellSize);

                var off = (cy * im.width + cx) * 4;
                var centerGrey = im.pixels[off];

                //  console.log('centerGrey: ' + centerGrey);
                maxDiff = -1000000;
                var maxV = null;

                var slopes = [];
                //check the neighbour cells
                for (var k = -1; k <= 1; k++) {
                    for (var l = -1; l <= 1; l++) {
                        if (k == 0 && l == 0) {
                            continue;
                        }
                        var neighbourX = i + k;
                        var neighbourY = j + l;

                        if (neighbourX < 0 || neighbourX > xdim - 1 || neighbourY < 0 || neighbourY > ydim - 1) {
                            continue;
                        }

                        var sampleX = floor(neighbourX * cellSize + 0.5 * cellSize);
                        var sampleY = floor(neighbourY * cellSize + 0.5 * cellSize);

                        var off = (sampleY * im.width + sampleX) * 4;
                        var sampleGrey = im.pixels[off];

                        var diff = centerGrey - sampleGrey;
                        var v = createVector(sampleX - cx, sampleY - cy);
                        v.normalize();
                        v.mult(diff);
                        slopes.push(v);

                    }
                }

                var slopeSum = createVector(0, 0);
                for (var m = 0; m < slopes.length; m++) {
                    var slope = slopes[m];
                    slopeSum.add(slope);
                }
                vfield[i][j] = slopeSum;
                if (slopeSum.mag() > globalMaxDiff) {
                    globalMaxDiff = slopeSum.mag();
                }
            }
        }

        //calc vector lengths
        for (var i = 0; i < xdim; i++) {
            for (var j = 0; j < ydim; j++) {
                var v = vfield[i][j];
                var len = map(v.mag(), 0, globalMaxDiff, 0, 1);
                v.setMag(len);
            }

        }

        return vfield;
    }

    function calcSlopes2(im, xdim, ydim) {
        console.log('calcSlopes2');
        var vfield = create2DArray(xdim, ydim);

        im.loadPixels();
        var globalMaxDiff = -1000000;
        for (var i = 0; i < xdim; i++) {
            for (var j = 0; j < ydim; j++) {
                //get the center point of current cell
                var cx = floor(i * cellSize + 0.5 * cellSize);
                var cy = floor(j * cellSize + 0.5 * cellSize);

                var off = (cy * im.width + cx) * 4;
                var centerGrey = im.pixels[off];

                // console.log('centerGrey: ' + centerGrey);
                maxDiff = -1000000;
                var maxV = null;

                //check the neighbour cells
                for (var k = -1; k <= 1; k++) {
                    for (var l = -1; l <= 1; l++) {
                        if (k == 0 && l == 0) {
                            continue;
                        }
                        var neighbourX = i + k;
                        var neighbourY = j + l;

                        if (neighbourX < 0 || neighbourX > xdim - 1 || neighbourY < 0 || neighbourY > ydim - 1) {
                            continue;
                        }

                        var sampleX = floor(neighbourX * cellSize + 0.5 * cellSize);
                        var sampleY = floor(neighbourY * cellSize + 0.5 * cellSize);

                        var off = (sampleY * im.width + sampleX) * 4;
                        var sampleGrey = im.pixels[off];

                        var diff = centerGrey - sampleGrey;
                        if (diff > maxDiff) {
                            maxDiff = diff;
                            maxV = createVector(sampleX - cx, sampleY - cy);
                            maxV.setMag(max(diff, 0));
                        }
                        if (diff > globalMaxDiff) {
                            globalMaxDiff = diff;
                        }

                    }
                }
                vfield[i][j] = maxV;
            }
        }

        //calc vector lengths
        for (var i = 0; i < xdim; i++) {
            for (var j = 0; j < ydim; j++) {
                var v = vfield[i][j];
                var len = map(v.mag(), 0, globalMaxDiff, 0, 1);
                v.setMag(len);
            }

        }

        return vfield;
    }

    function calcSlopes(im, xdim, ydim) {
        console.log('calcSlopes');
        var vfield = create2DArray(xdim, ydim);

        im.loadPixels();
        var globalMaxDiff = -1000000;
        for (var i = 0; i < xdim; i++) {
            for (var j = 0; j < ydim; j++) {
                //get the center point of current cell
                var cx = floor(i * cellSize + 0.5 * cellSize);
                var cy = floor(j * cellSize + 0.5 * cellSize);

                //set length of sample vector
                var len = cellSize;

                //create sample vector
                var v = createVector(len, 0);

                //nr samples
                var nrSamples = 20;
                var theta = radians(360 / nrSamples);
                //var centerGrey = im.get(cx,cy)[0];

                var off = (cy * im.width + cx) * 4;
                var centerGrey = im.pixels[off];

                //  console.log('centerGrey: ' + centerGrey);
                maxDiff = -1000000;
                var maxV = null;
                for (var k = 0; k < nrSamples; k++) {
                    v.rotate(theta);

                    //get the sample point
                    var sampleX = floor(cx + v.x);
                    var sampleY = floor(cx + v.y);

                    if (outOfBounds(sampleX, sampleY, im.width, im.height)) {
                        //   console.log('out of bounds: ' + sampleX + ', ' + sampleY);
                        continue;
                    }

                    //var sampleGrey = im.get(sampleX,sampleY)[0];
                    var off = (sampleY * im.width + sampleX) * 4;
                    var sampleGrey = im.pixels[off];
                    //console.log('sampleX: ' + sampleX + ' sampleY: ' + sampleY + 'sampleGrey: ' + sampleGrey);
                    var diff = centerGrey - sampleGrey;

                    // if(i == 1 && j== 3){
                    //     console.log('diff: ' + diff);
                    // }

                    if (diff > maxDiff) {
                        maxDiff = diff;
                        maxV = v.copy();
                        maxV.setMag(max(0, diff));
                    }
                    if (diff > globalMaxDiff) {
                        globalMaxDiff = diff;
                    }

                }
                vfield[i][j] = maxV;
            }
        }

        //calc vector lengths
        for (var i = 0; i < xdim; i++) {
            for (var j = 0; j < ydim; j++) {
                var v = vfield[i][j];
                var len = map(v.mag(), 0, globalMaxDiff, 0, 1);
                v.setMag(len);
            }

        }

        return vfield;
    }

    function outOfBounds(_x, _y, _w, _h) {
        return _x < 0 || _x > _w - 1 || _y < 0 || _y > _h - 1;
    }

    function create2DArray(xdim, ydim) {
        var arr = new Array(xdim);
        for (var i = 0; i < xdim; i++) {
            arr[i] = new Array(ydim);
        }
        return arr;
    }

    hm.drawHeightmap = function () {
        image(img, 0, 0);
    }

    hm.drawVectorField = function () {
        noFill();
        stroke(0);
        for (var i = 0; i < nx; i++) {
            for (var j = 0; j < ny; j++) {

                var x = i * cellSize;
                var y = j * cellSize;
                stroke(0, 100);
                rect(x, y, cellSize, cellSize);

                var cx = x + 0.5 * cellSize;
                var cy = y + 0.5 * cellSize;
                var v = vectorfield[i][j].copy();
                // if(v == null){
                //     console.log('i: ' + i + ' j: ' + j );
                // }



                v.setMag(map(v.mag(), 0, 1, 2, 0.5 * cellSize));

                noStroke();
                fill(0);
                ellipse(cx, cy, 3, 3);
                stroke('red');
                noFill();
                line(cx, cy, cx + v.x, cy + v.y);

            }

        }
    }

    hm.getSlope = function (x, y) {
        var cellX = floor(x / cellSize);
        var cellY = floor(y / cellSize);

        if (cellX < 0 || cellX > nx - 1 || cellY < 0 || cellY > ny - 1) {
            return createVector(0, 0);
        }

        var slope = vectorfield[cellX][cellY];
        return slope.copy();
    }

    return hm;

}