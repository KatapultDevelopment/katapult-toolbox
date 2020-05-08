import proj4 from 'proj4';

/*global proj4*/
window.addEventListener('load', function() {
    proj4.defs('EPSG:4326', "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs ");
});

self.k = self.k || {};

//calculates distance between two lat/long points in meters
self.k.calcDistance = function(lat1, lon1, lat2, lon2) {
    var p1 = self.k.latLongToXY(Number(lat1), Number(lon1));
    var p2 = self.k.latLongToXY(Number(lat2), Number(lon2), p1.srid);
    return self.k.calcDistanceXY(p1, p2);
};
self.k.calcDistanceXY = function(p1, p2) {
    return Math.sqrt(Math.pow(Number(p1.x) - Number(p2.x), 2) + Math.pow(Number(p1.y) - Number(p2.y), 2))
};
self.k.calcMidPoint = function(lat1, lon1, lat2, lon2) {
    var p1 = self.k.latLongToXY(Number(lat1), Number(lon1));
    var p2 = self.k.latLongToXY(Number(lat2), Number(lon2), p1.srid);
    var midpoint = self.k.calcMidPointXY(p1, p2);
    midpoint.srid = p1.srid;
    return self.k.xyToLatLong(midpoint);
};
self.k.calcMidPointXY = function(p1, p2) {
    return {
        x: (Number(p1.x) + Number(p2.x)) / 2,
        y: (Number(p1.y) + Number(p2.y)) / 2
    }
}
self.k.calcBearing = function(lat1, lon1, lat2, lon2) {
    var p1 = self.k.latLongToXY(Number(lat1), Number(lon1));
    var p2 = self.k.latLongToXY(Number(lat2), Number(lon2), p1.srid);
    return self.k.calcBearingXY(p1, p2);
};
self.k.calcBearingXY = function(p1, p2) {
    var dy = Number(p2.y) - Number(p1.y);
    var dx = Number(p2.x) - Number(p1.x);
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    theta = 90 - theta; // 0 deg = North
    if (theta < 0) theta = 360 + theta; // range [0, 360)-
    return theta;
};
//Depricated, Use self.k.calcBearing
self.k.calcBearingLL = function(lat1, lon1, lat2, lon2) {
    return self.k.calcBearing(Number(lat1), Number(lon1), Number(lat2), Number(lon2));
};
// calcuates shortest distance between point and line in meters
self.k.calcDistanceToLine = function(pointLat, pointLon, linePoint1_Lat, linePoint1_Lon, linePoint2_Lat, linePoint2_Lon) {
    var p = self.k.latLongToXY(Number(pointLat), Number(pointLon));
    var p1 = self.k.latLongToXY(Number(linePoint1_Lat), Number(linePoint1_Lon), p.srid);
    var p2 = self.k.latLongToXY(Number(linePoint2_Lat), Number(linePoint2_Lon), p.srid);
    var pointOnLine = self.k.snapToLineXY(p, p1, p2);
    return Math.sqrt(pointOnLine.dx * pointOnLine.dx + pointOnLine.dy * pointOnLine.dy);
};
self.k.snapToLine = function(pointLat, pointLon, linePoint1_Lat, linePoint1_Lon, linePoint2_Lat, linePoint2_Lon, allowOverflow) {
    var p = self.k.latLongToXY(Number(pointLat), Number(pointLon));
    var p1 = self.k.latLongToXY(Number(linePoint1_Lat), Number(linePoint1_Lon), p.srid);
    var p2 = self.k.latLongToXY(Number(linePoint2_Lat), Number(linePoint2_Lon), p.srid);
    var pointOnLine = self.k.snapToLineXY(p, p1, p2, allowOverflow);
    pointOnLine.srid = p.srid;
    return self.k.xyToLatLong(pointOnLine);
};
self.k.snapToLineXY = function(p, p1, p2, allowOverflow) {
    var x = Number(p1.x),
        y = Number(p1.y),
        dx = Number(p2.x) - x,
        dy = Number(p2.y) - y,
        dot = dx * dx + dy * dy,
        t;

    if (dot > 0) {
        t = ((Number(p.x) - x) * dx + (Number(p.y) - y) * dy) / dot;

        if (t > 1 && !allowOverflow) {
            x = Number(p2.x);
            y = Number(p2.y);
        }
        else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = Number(p.x) - x;
    dy = Number(p.y) - y;

    return {
        x: x,
        y: y,
        dx: dx,
        dy: dy
    };
};
// Snap Point lat and long, Center Point lat and long, optional distance in meters, and optional bearing [0 - 360] with 0 at North
self.k.snapPosition = function(pointLat, pointLon, centerLat, centerLon, distance_meters, bearing) {
    var center = self.k.latLongToXY(centerLat, centerLon);
    var point = self.k.latLongToXY(pointLat, pointLon, center.srid);
    var snapPoint = self.k.snapPositionXY(point, center, distance_meters, bearing);
    snapPoint.srid = center.srid;
    return self.k.xyToLatLong(snapPoint);
};
self.k.snapPositionXY = function(point, center, distance_meters, bearing) {
    if (distance_meters == null) {
        distance_meters = self.k.calcDistanceXY(center, point);
    }
    if (bearing == null) {
        bearing = self.k.calcBearingXY(center, point);
    }
    var mathBearing = (90 - bearing) * Math.PI / 180;
    var utmX = distance_meters * Math.cos(mathBearing) + center.x;
    var utmY = distance_meters * Math.sin(mathBearing) + center.y;
    return {
        x:utmX,
        y:utmY
    };
};
self.k.snapToCircle = function(pointLat, pointLon, centerLat, centerLon, radius_meters) {
    var point = self.k.latLongToXY(Number(pointLat), Number(pointLon));
    var center = self.k.latLongToXY(Number(centerLat), Number(centerLon), point.srid);
    var pointOnCircle = self.k.snapToCircleXY(point, center, radius_meters);
    pointOnCircle.srid = point.srid;
    return self.k.xyToLatLong(pointOnCircle);
};
self.k.snapToCircleXY = function(point, center, radius) {
    // where P is the point, C is the center, and R is the radius:
    // V = (P - C); Answer = C + V / |V| * R;
    // where |V| is length of V.
    var vX = Number(point.x) - Number(center.x);
    var vY = Number(point.y) - Number(center.y);
    var magV = Math.sqrt(vX*vX + vY*vY);
    var aX = Number(center.x) + vX / magV * radius;
    var aY = Number(center.y) + vY / magV * radius;
    return {
        x:aX,
        y:aY
    };
};
self.k.calcProj4 = function(lat, long) {
    var zone = 1 + Math.floor((Number(long) + 180) / 6);
    var srid = 32600 + zone;
    var hemisphere = "";
    var NS = "N";
    if (Number(lat) <= 0) {
        srid += 100;
        hemisphere = " +south";
        NS = "S";
    }
    // Turn SRID into a string for proj4js indexing
    srid += '';
    var proj4String = "+title=WGS 84 / UTM zone " + zone + NS + " +proj=utm +zone=" + zone + hemisphere + " +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
    proj4.defs(srid, proj4String);
    return {
        srid: srid,
        proj4: proj4String
    };
};
//self.k.latLongToXY(lat, long[, srid]) - pass lat and long and it will be projected into correct UTM zone
//   optionally pass srid to project into that coordinate system
//   returns {x:x, y:y, srid:srid}
// TODO make it work with srid's that weren't previously calculated by the library
self.k.latLongToXY = function(lat, long, srid) {
    srid = srid || self.k.calcProj4(lat, long).srid;
    var coords = {
        x: long,
        y: lat
    };
    // run proj4 transform - proj4(fromProjection[, toProjection, coordinates])
    var transformed = proj4(proj4('EPSG:4326'), proj4(srid), coords);
    transformed.x = transformed.x;
    transformed.y = transformed.y;
    transformed.srid = srid;
    return transformed;
};
//self.k.xyToLatLong(xOrPoint[, y, srid]) - pass a point {x:x, y:y, srid:srid} or x, y, srid
//    srid should be the epsg srid of the projected points
//    returns {lat:lat, long:long}
// TODO make it work with srid's that weren't previously calculated by the library
self.k.xyToLatLong = function(xOrPoint, y, srid) {
    var point = xOrPoint;
    if (typeof xOrPoint != 'object') {
        point = {
            x: xOrPoint,
            y: y,
            srid: srid
        };
    }
    var transformed = proj4(proj4(point.srid), proj4('EPSG:4326'), point);
    return {
        lat: transformed.y,
        long: transformed.x
    };
};
// round a number to a given decimal place
self.k.round = function(value, exp) {
    if (typeof exp === 'undefined' || +exp === 0)
        return Math.round(value);

    value = +value;
    exp = +exp;

    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
        return NaN;

    // Shift
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
};
// Given points p1 and p2, calculate the vector starting at p1 and ending at p2
self.k.calculateVector = function (p1, p2) {
    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    };
};
// Given two vectors v1 and v2, add vector v2 to v1
self.k.addVectors = function(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    };
};
// Given two vectors v1 and v2, subtract vector v2 from v1
self.k.subtractVectors = function (v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    };
};
// Calculate the dot product of vectors v1 and v2
self.k.dotProduct = function (v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
};
// Calculate the unit vector of a vector
self.k.calculateUnitVector = function (vector) {
    var norm = self.k.vectorNorm(vector);
    if (norm != 0) {
        return {
            x: vector.x / norm,
            y: vector.y / norm
        };
    }
};
// Calculate the norm of a vector
self.k.vectorNorm = function (vector) {
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
};
// Project vector v1 onto v2
self.k.projectVectors = function (v1, v2) {// projects v1 onto v2
    var norm = self.k.vectorNorm(v2);
    if (norm != 0) {
        var r = self.k.dotProduct(v1, v2) / Math.pow(norm, 2);
        if (r > 0.99999999999 && r < 1.00000000001) {
            // fix rounding error
            return {
                x: v2.x,
                y: v2.y
            };
        }
        else if (r > -1e-11 && r < 1e-11) {
            // fix rounding error
            return {
                x: 0,
                y: 0
            };
        }
        else {
            return {
                x: r * v2.x,
                y: r * v2.y
            };
        }
    } else {
        return {
            x: v1.x,
            y: v1.y
        };
    }
};
// Scale a vector by c
self.k.scaleVector = function (c, vector) {
    return {
        x: c * vector.x,
        y: c * vector.y
    };
};
// Starting a point p, add move by a vector
self.k.calculatePointFromVector = function (p, vector) {
    return {
        x: p.x + vector.x,
        y: p.y + vector.y,
        srid: p.srid
    };
};