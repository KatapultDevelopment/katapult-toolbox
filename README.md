# katapult-toolbox
katapult-geometry.js - Javascript GIS Mapping Calculations

katapult-functions.js - misc useful helper functions

## NPM Support
Versions 3.0.2 and higher export named ES6 modules.

For the bare imports version, see version 2.0.0.

For the html imports version, see version 1.1.6.

## Installation
Install with npm
```
npm install --save https://github.com/KatapultDevelopment/katapult-toolbox.git#3.0.2
```

Then import the modules you need
```javascript
import { KatapultFunctions, KatapultGeometry } from 'katapult-toolbox';
```

## Usage 
```KatapultGeometry.latLongToXY(lat, long)``` - Calculate XY projection of LL in UTM Feet
