
const { readFileSync } = require('fs');
const { resolve } = require('path');

function dumpInfo(filename, targetNodes) {
    const data = readFileSync(resolve(__dirname, 'public', filename));
    const jsonStart = data.indexOf('JSON') + 4;
    const jsonLength = data.readUInt32LE(jsonStart - 8);
    const json = JSON.parse(data.toString('utf8', jsonStart, jsonStart + jsonLength));

    console.log(`\n=== Info for ${filename} ===`);
    
    targetNodes.forEach(target => {
        const nodeIdx = json.nodes.findIndex(n => n.name === target);
        if (nodeIdx === -1) {
            console.log(`${target}: Not found`);
            return;
        }
        
        const node = json.nodes[nodeIdx];
        console.log(`Node: ${target} (Index: ${nodeIdx})`);
        console.log(`  Translation: ${JSON.stringify(node.translation || [0, 0, 0])}`);
        console.log(`  Rotation: ${JSON.stringify(node.rotation || [0, 0, 0, 1])}`);
        console.log(`  Scale: ${JSON.stringify(node.scale || [1, 1, 1])}`);
        
        if (node.mesh !== undefined) {
            const mesh = json.meshes[node.mesh];
            console.log(`  Mesh: ${mesh.name} (Index: ${node.mesh})`);
            mesh.primitives.forEach((prim, i) => {
                const acc = json.accessors[prim.attributes.POSITION];
                console.log(`    Primitive ${i} POSITION: min=${JSON.stringify(acc.min)}, max=${JSON.stringify(acc.max)}`);
                const size = acc.min.map((min, j) => acc.max[j] - min);
                console.log(`    Size: ${JSON.stringify(size)}`);
            });
        }
        
        if (node.children) {
            console.log(`  Children: ${JSON.stringify(node.children)}`);
            node.children.forEach(childIdx => {
                const child = json.nodes[childIdx];
                console.log(`    Child ${childIdx}: ${child.name || 'unnamed'}`);
                if (child.mesh !== undefined) {
                    const mesh = json.meshes[child.mesh];
                    console.log(`      Mesh: ${mesh.name}`);
                    const acc = json.accessors[mesh.primitives[0].attributes.POSITION];
                    console.log(`      POSITION: min=${JSON.stringify(acc.min)}, max=${JSON.stringify(acc.max)}`);
                }
            });
        }
    });
}

dumpInfo('A320.glb', ['Fuselage', 'Nose', 'GearNDoorC', 'GearLDoor', 'GearRDoor']);
dumpInfo('airplane.glb', ['front_gear', 'rear_gears', 'body']);
