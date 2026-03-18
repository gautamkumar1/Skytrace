
const { readFileSync } = require('fs');
const { resolve } = require('path');

async function checkOffsets() {
    const data = readFileSync(resolve(__dirname, 'public/A320.glb'));
    const jsonStart = data.indexOf('JSON') + 4;
    const jsonLength = data.readUInt32LE(jsonStart - 8);
    const jsonStr = data.toString('utf8', jsonStart, jsonStart + jsonLength);
    const json = JSON.parse(jsonStr);

    const accessors = json.accessors;
    const bufferViews = json.bufferViews;
    const buffer = data.slice(jsonStart + jsonLength + 8);

    function getMeshCenter(meshName) {
        const mesh = json.meshes.find(m => m.name === meshName || m.name === meshName + '.mesh');
        if (!mesh) return null;
        
        const primitive = mesh.primitives[0];
        const posAccessorIdx = primitive.attributes.POSITION;
        const accessor = accessors[posAccessorIdx];
        
        return {
            min: accessor.min,
            max: accessor.max,
            center: accessor.min.map((min, i) => (min + accessor.max[i]) / 2)
        };
    }

    const targets = ['GearLDoor', 'GearRDoor', 'GearNDoorC', 'GearNWell'];
    console.log('--- A320.glb Gear Offsets (Relative to Parent Group) ---');
    targets.forEach(t => {
        const info = getMeshCenter(t);
        if (info) {
            console.log(`${t}: Center [${info.center.join(', ')}]`);
        } else {
            console.log(`${t}: Not found`);
        }
    });

    console.log('\n--- airplane.glb Gear Offsets ---');
    const dataPlane = readFileSync(resolve(__dirname, 'public/airplane.glb'));
    const jsonStartPlane = dataPlane.indexOf('JSON') + 4;
    const jsonLengthPlane = dataPlane.readUInt32LE(jsonStartPlane - 8);
    const jsonPlane = JSON.parse(dataPlane.toString('utf8', jsonStartPlane, jsonStartPlane + jsonLengthPlane));
    
    const targetsPlane = ['front_gear', 'rear_gears'];
    targetsPlane.forEach(t => {
        const mesh = jsonPlane.meshes.find(m => m.name === t);
        if (mesh) {
            const accessor = jsonPlane.accessors[mesh.primitives[0].attributes.POSITION];
            const center = accessor.min.map((min, i) => (min + accessor.max[i]) / 2);
            console.log(`${t}: Center [${center.join(', ')}]`);
        }
    });
}

checkOffsets().catch(console.error);
