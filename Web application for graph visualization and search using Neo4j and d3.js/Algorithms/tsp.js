document.addEventListener("DOMContentLoaded", function() {
    const startDropdown = document.getElementById('startNodeDropdownTSP');
    const tspToggle = document.getElementById('tspToggle');
    const leftLabel = document.querySelector('.toggle-container .toggle-label-left4');
    const rightLabel = document.querySelector('.toggle-container .toggle-label-right4');
    const message = document.getElementById('chooseNodesTSPMessage');

    function handleToggleChange() {
        if (tspToggle.checked) {
            leftLabel.style.color = 'black';
            rightLabel.style.color = 'hsl(318, 74%, 38%)';
            rightLabel.style.fontWeight = 'bold';
            message.innerHTML = '<strong>Sorted Edges Algorithm selected.</strong>';
            startDropdown.disabled = true;
        } else {
            rightLabel.style.color = 'black';
            rightLabel.style.fontWeight = 'normal';
            leftLabel.style.color = '#064c9c';
            message.innerHTML = '<strong>Nearest Neighbour Algorithm selected</strong>';
            startDropdown.disabled = false;
        }
    }

    handleToggleChange();

    startDropdown.addEventListener('change', validateNodeSelectionTSP);
    tspToggle.addEventListener('change', handleToggleChange);
});
document.getElementById('chooseNodesTSPAlgorithmsExplainAlg').addEventListener('click', function() {
    document.getElementById('whatIsTSPAlgorithms').style.display = 'flex';
});

document.getElementById('whatIsTSPAlgorithmsClose').addEventListener('click', function() {
    document.getElementById('whatIsTSPAlgorithms').style.display = 'none';
});

function validateNodeSelectionTSP() {
    const startDropdown = document.getElementById('startNodeDropdownTSP');
    const confirmButton = document.getElementById('chooseNodesTSPConfirm');
    const warningMessage = document.getElementById('relationshipWarningTSP');

    if (!startDropdown.value) {
        warningMessage.style.display = 'block';
        warningMessage.textContent = 'Please select a start node.';
        confirmButton.disabled = true;
    } else {
        warningMessage.style.display = 'none';
        warningMessage.textContent = '';
        confirmButton.disabled = false;
    }
}

function populateNodeDropdownsTSP() {
    let startDropdown = document.getElementById('startNodeDropdownTSP');
    let nodes = globalNodes;

    console.log("Here are the nodes:", nodes);

    startDropdown.innerHTML = '';

    nodes.forEach(node => {
        let option = document.createElement('option');
        option.textContent = node.properties.name;
        option.value = node.id;

        startDropdown.appendChild(option);
    });

    validateNodeSelectionTSP();
}

document.getElementById('chooseNodesTSPConfirm').addEventListener('click', function() {
    let startNode = document.getElementById('startNodeDropdownTSP').value;
    let tspToggle = document.getElementById('tspToggle').checked;

    let startNodeText = document.getElementById('startNodeDropdownTSP').selectedOptions[0].textContent;
    console.log("textttt",startNodeText);
    document.getElementById('chooseNodesTSP').style.display = 'none';
    if (tspToggle) {
        console.log("TSP Path selected");
        sortedEdgesTSP(globalNodes,globalLinks); 
    } else {
        console.log("TSP Nearest Neighbour selected");
        nearestNeighbor(startNodeText,globalNodes,globalLinks); 
    }
});

document.getElementById('chooseNodesTSPCancel').addEventListener('click', function() {
    document.getElementById('chooseNodesTSP').style.display = 'none';
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    algorithmDropdown.value = ''; 
    document.getElementById('chooseAlgorithmModal').style.display = 'flex';
});

document.addEventListener("DOMContentLoaded", function() {
    const startDropdown = document.getElementById('startNodeDropdownTSP');

    startDropdown.addEventListener('change', validateNodeSelectionTSP);
});

function nearestNeighbor(startNode, globalNodes, globalLinks) {
    let eventDescriptions = [];
    let currentNode = startNode;
    const visited = new Set([startNode]);
    const path = [];
    const nodeNamesPath = [startNode]; 
    const totalPathDistance = { distance: 0 };

    path.push(startNode);
    eventDescriptions.push(`Starting at node '${startNode}'`);

    function findNearestNode(currentNode, globalNodes, globalLinks, visited) {
        let nearest = { node: null, distance: Infinity, linkId: null };

        globalLinks.forEach(link => {
            const sourceName = link.source.properties.name;
            const targetName = link.target.properties.name;
            const distance = link.properties.distance;
            const linkId = link.id;

            if (sourceName === currentNode && !visited.has(targetName)) {
                if (distance < nearest.distance) {
                    nearest = { node: targetName, distance: distance, linkId: linkId };
                }
            } else if (targetName === currentNode && !visited.has(sourceName)) {
                if (distance < nearest.distance) {
                    nearest = { node: sourceName, distance: distance, linkId: linkId };
                }
            }
        });

        eventDescriptions.push(`Nearest node to '${currentNode}' is '${nearest.node}' with distance ${nearest.distance}.`);
        return nearest;
    }

    while (visited.size < globalNodes.length) {
        let nearest = findNearestNode(currentNode, globalNodes, globalLinks, visited);
        if (!nearest.node) {
            eventDescriptions.push(`Failed to find a path that visits all nodes. Last node reached: [${currentNode}]`);
            showDescButton("Nearest Neighbor", `Failed to find a path that visits all nodes. Last node reached: [${currentNode}]`, eventDescriptions);
            showErrorModal(`Failed to find a path that visits all nodes. Last node reached: [${currentNode}]`);
            return;
        }
        visited.add(nearest.node);
        path.push(Number(nearest.linkId), nearest.node);
        nodeNamesPath.push(nearest.node);
        totalPathDistance.distance += nearest.distance;
        currentNode = nearest.node;
        eventDescriptions.push(`Visited node '${nearest.node}'. Current path: ${nodeNamesPath.join(' -> ')}. Total distance: ${totalPathDistance.distance}`);
    }

    let returnToStart = globalLinks.find(link => 
        (link.source.properties.name === currentNode && link.target.properties.name === startNode) ||
        (link.target.properties.name === currentNode && link.source.properties.name === startNode)
    );
    if (returnToStart) {
        path.push(Number(returnToStart.id), startNode);
        nodeNamesPath.push(startNode);
        totalPathDistance.distance += returnToStart.properties.distance;
        eventDescriptions.push(`Returning to start node '${startNode}'. Final path: ${nodeNamesPath.join(' -> ')}. Total distance: ${totalPathDistance.distance}`);
    } else {
        eventDescriptions.push(`Failed to return to start node from [${currentNode}] to [${startNode}]`);
        showDescButton("Nearest Neighbor", `Failed to return to start node from [${currentNode}] to [${startNode}]`, eventDescriptions);
        showErrorModal(`Failed to return to start node from [${currentNode}] to [${startNode}]`);
        return;
    }

    console.log("Completed path:", path);
    console.log("Total path distance:", totalPathDistance.distance);
    let algorithm = ["Nearest Neighbor", path];
    showDescButton("Nearest Neighbor", path, eventDescriptions);
    updateGraph(globalNodes, globalLinks, algorithm);
}



function sortedEdgesTSP(globalNodes, globalLinks) {
    let eventDescriptions = [];
    const sortedLinks = globalLinks.sort((a, b) => a.properties.distance - b.properties.distance);

    class UnionFind {
        constructor(elements) {
            this.parent = {};
            elements.forEach(e => this.parent[e] = e);
        }

        find(id) {
            while (this.parent[id] !== id) {
                id = this.parent[id];
            }
            return id;
        }

        union(x, y) {
            let rootX = this.find(x);
            let rootY = this.find(y);
            if (rootX !== rootY) {
                this.parent[rootY] = rootX;
                return true;
            }
            return false;
        }
    }

    const uf = new UnionFind(globalNodes.map(node => node.properties.name));
    const degrees = new Map(globalNodes.map(node => [node.properties.name, 0]));
    let path = [];
    const nodeNamesPath = [];

    eventDescriptions.push("Step 1: Sort all edges by their distance in increasing order.");

    sortedLinks.forEach(link => {
        const {source, target} = link;
        const sourceName = source.properties.name;
        const targetName = target.properties.name;
        const distance = link.properties.distance;
        eventDescriptions.push(`${sourceName} -(${distance})-> ${targetName}`);
    });

    for (let link of sortedLinks) {
        const {source, target, id} = link;
        const sourceName = source.properties.name;
        const targetName = target.properties.name;

        if (degrees.get(sourceName) < 2 && degrees.get(targetName) < 2) {
            eventDescriptions.push(`Considering edge between '${sourceName}' and '${targetName}' with distance ${link.properties.distance}.`);
            if (uf.union(sourceName, targetName) || new Set(globalNodes.map(node => uf.find(node.properties.name))).size === 1) {
                path.push(sourceName, Number(id), targetName);
                nodeNamesPath.push(sourceName, targetName); 
                degrees.set(sourceName, degrees.get(sourceName) + 1);
                degrees.set(targetName, degrees.get(targetName) + 1);
                eventDescriptions.push(`Added edge between '${sourceName}' and '${targetName}'. Current path: ${Array.from(new Set(nodeNamesPath)).join(' -> ')}`);
            } else {
                eventDescriptions.push(`Edge between '${sourceName}' and '${targetName}' forms a cycle or exceeds degree rules. Skipping this edge.`);
            }
        } else {
            eventDescriptions.push(`Edge between '${sourceName}' and '${targetName}' exceeds degree rules. Skipping this edge.`);
        }
    }

    const allConnected = new Set(globalNodes.map(node => uf.find(node.properties.name))).size === 1;
    const allNodesVisited = Array.from(degrees.values()).every(deg => deg === 2);

    if (allConnected && allNodesVisited) {
        eventDescriptions.push("Successfully constructed a Hamiltonian circuit.");
        let algorithm = ["Sorted Edges TSP", path];
        showDescButton("Sorted Edges TSP", path, eventDescriptions);
        updateGraph(globalNodes, globalLinks, algorithm);
    } else {
        eventDescriptions.push("Failed to construct a valid Hamiltonian circuit.");
        showDescButton("Sorted Edges TSP", "Failed to construct a valid Hamiltonian circuit.", eventDescriptions);
        showErrorModal("Failed to construct a valid Hamiltonian circuit");
    }
}




