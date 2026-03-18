
const { readFileSync } = require('fs');
const { resolve } = require('path');
const { Matrix4, Vector3, Quaternion } = require('three');

function getAbsoluteMatrix(json, nodeIdx) {
    let matrix = new Matrix4();
    let currentIdx = nodeIdx;
    
    // Build path to root
    const path = [];
    while (currentIdx !== undefined) {
        path.push(currentIdx);
        currentIdx = json.nodes.findIndex(n => n.children && n.children.includes(currentIdx));
        if (currentIdx === -1) currentIdx = undefined;
    }
    
    // Apply transforms from root to node
    path.reverse().forEach(idx => {
        const node = json.nodes[idx];
        const localMatrix = new Matrix4();
        if (node.matrix) {
            localMatrix.fromArray(node.matrix);
        } else {
            const pos = new Vector3(...(node.translation || [0, 0, 0]));
            const rot = new Quaternion(...(node.rotation || [0, 0, 0, 1]));
            const scale = new Vector3(...(node.scale || [1, 1, 1]));
            localMatrix.compose(pos, rot, scale);
        }
        matrix.multiply(localMatrix);
    });
    
    return matrix;
}

function processGLB(filename, targets) {
    const data = readFileSync(resolve(__dirname, 'public', filename));
    const jsonStart = data.indexOf('JSON') + 4;
    const jsonLength = data.readUInt32LE(jsonStart - 8);
    const json = JSON.parse(data.toString('utf8', jsonStart, jsonStart + jsonLength));

    console.log(`\n--- ${filename} Absolute Centers ---`);
    targets.forEach(target => {
        const nodeIdx = json.nodes.findIndex(n => n.name === target);
        if (nodeIdx === -1) {
            console.log(`${target}: Not found`);
            return;
        }
        
        const matrix = getAbsoluteMatrix(json, nodeIdx);
        const node = json.nodes[nodeIdx];
        
        let center = new Vector3(0, 0, 0);
        if (node.mesh !== undefined) {
            const mesh = json.meshes[node.mesh];
            const accessor = json.accessors[mesh.primitives[0].attributes.POSITION];
            const meshLocalCenter = new Vector3(
                (accessor.min[0] + accessor.max[0]) / 2,
                (accessor.min[1] + accessor.max[1]) / 2,
                (accessor.min[2] + accessor.max[2]) / 2
            );
            center = meshLocalCenter.applyMatrix4(matrix);
        } else {
            center.setFromMatrixPosition(matrix);
        }
        
        console.log(`${target}: [${center.x.toFixed(4)}, ${center.y.toFixed(4)}, ${center.z.toFixed(4)}]`);
    });
}

processGLB('A320.glb', ['Nose', 'GearNDoorC', 'GearLDoor', 'GearRDoor']);
processGLB('airplane.glb', ['front_gear', 'rear_gears']);
