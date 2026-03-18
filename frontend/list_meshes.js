
const { readFileSync } = require('fs');
const { resolve } = require('path');

async function listMeshes() {
    const data = readFileSync(resolve(__dirname, 'public/A320.glb'));
    const jsonStart = data.indexOf('JSON') + 4;
    const jsonLength = data.readUInt32LE(jsonStart - 8);
    const jsonStr = data.toString('utf8', jsonStart, jsonStart + jsonLength);
    const json = JSON.parse(jsonStr);
    
    console.log('--- All Nodes (Recursive) ---');
    function printNode(nodeIdx, indent = '') {
        const node = json.nodes[nodeIdx];
        console.log(`${indent}${node.name || 'unnamed'} (Index: ${nodeIdx})${node.mesh !== undefined ? ` [Mesh: ${json.meshes[node.mesh].name}]` : ''}`);
        if (node.children) {
            node.children.forEach(childIdx => printNode(childIdx, indent + '  '));
        }
    }
    
    // Find root nodes (nodes not referenced by any other node)
    const childNodes = new Set();
    json.nodes.forEach(node => {
        if (node.children) node.children.forEach(c => childNodes.add(c));
    });
    
    json.nodes.forEach((node, i) => {
        if (!childNodes.has(i)) {
            printNode(i);
        }
    });
}

listMeshes().catch(console.error);
