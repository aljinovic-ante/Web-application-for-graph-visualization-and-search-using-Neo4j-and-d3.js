document.getElementById('chooseNodesGBFSExplainAlg').addEventListener('click', function() {
    document.getElementById('whatIsGBFS').style.display = 'flex';
});

document.getElementById('whatIsGBFSClose').addEventListener('click', function() {
    document.getElementById('whatIsGBFS').style.display = 'none';
});


function validateNodeSelectionGBFS() {
    let disableFlagSEN = false;
    let disableFlagCN = false;

    const startDropdown = document.getElementById('startNodeDropdownGBFS');
    const endDropdown = document.getElementById('endNodeDropdownGBFS');
    const confirmButton = document.getElementById('chooseNodesGBFSConfirm');
    const warningMessage = document.getElementById('relationshipWarningGBFS');
    const algorithmWarning = document.getElementById('algorithmWarningGBFS');

    warningMessage.style.display = 'none';
    warningMessage.textContent = '';
    algorithmWarning.style.display = 'none';
    algorithmWarning.textContent = '';
    if (startDropdown.value === endDropdown.value) {
        console.log("Same nodes selected, showing warning.");
        warningMessage.style.display = 'block';
        warningMessage.textContent = 'Start and end node cannot be the same.';
        disableFlagSEN = true;
    }

    confirmButton.disabled = disableFlagSEN || disableFlagCN;
    
}

function populateNodeDropdownsGBFS() {
    let startDropdown = document.getElementById('startNodeDropdownGBFS');
    let endDropdown = document.getElementById('endNodeDropdownGBFS');
    let nodes = globalNodes;
    let links = globalLinks; 

    console.log("Here are the nodes:", nodes);

    startDropdown.innerHTML = '';
    endDropdown.innerHTML = '';

    nodes.sort((a, b) => a.properties.name.localeCompare(b.properties.name)).forEach(node => {
        let option1 = document.createElement('option');
        option1.textContent = node.properties.name;
    
        let option2 = document.createElement('option');
        option2.textContent = node.properties.name;
    
        startDropdown.appendChild(option1);
        endDropdown.appendChild(option2);
    });

    validateNodeSelectionGBFS();
}

document.getElementById('chooseNodesGBFSConfirm').addEventListener('click', function() {
    let startNode = document.getElementById('startNodeDropdownGBFS').value;
    let endNode = document.getElementById('endNodeDropdownGBFS').value;

    let startNodeText = document.getElementById('startNodeDropdownGBFS').selectedOptions[0].textContent;
    let endNodeText = document.getElementById('endNodeDropdownGBFS').selectedOptions[0].textContent;

    console.log('Start Node ID:', startNode, 'End Node ID:', endNode);
    console.log('Start Node Text:', startNodeText, 'End Node Text:', endNodeText);

    document.getElementById('chooseNodesGBFS').style.display = 'none';
    GBFS(startNode, endNode,globalNodes, globalLinks); 
});

document.getElementById('chooseNodesGBFSCancel').addEventListener('click', function() {
    document.getElementById('chooseNodesGBFS').style.display = 'none';
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    algorithmDropdown.value = ''; 
    document.getElementById('chooseAlgorithmModal').style.display = 'flex';
});

document.addEventListener("DOMContentLoaded", function() {
    const startDropdown = document.getElementById('startNodeDropdownGBFS');
    const endDropdown = document.getElementById('endNodeDropdownGBFS');

    startDropdown.addEventListener('change', validateNodeSelectionGBFS);
    endDropdown.addEventListener('change', validateNodeSelectionGBFS);
});

function GBFS(startNodeName, endNodeName, globalNodes, globalLinks) {
    console.log("Starting node:", startNodeName);
    console.log("Ending node:", endNodeName);
    let nodes = globalNodes;
    let links = globalLinks;
    console.log("Nodes in graph:", nodes);
    console.log("Links in graph:", links);

    let eventDescriptions = [];

    class PriorityQueue {
        constructor() {
            this.nodes = [];
        }

        enqueue(priority, value) {
            const existingNodeIndex = this.nodes.findIndex(node => node.value.properties.name === value.properties.name);
            if (existingNodeIndex !== -1) {
                if (this.nodes[existingNodeIndex].priority > priority) {
                    this.nodes[existingNodeIndex].priority = priority;
                    this.nodes.sort((a, b) => a.priority - b.priority);
                }
            } else {
                this.nodes.push({ priority, value });
                this.nodes.sort((a, b) => a.priority - b.priority);
            }
            eventDescriptions.push(`Node '${value.properties.name}' enqueued with priority ${priority}.`);
            console.log(`Enqueued Node: ${value.properties.name}, Priority: ${priority}`);
        }

        dequeue() {
            const value = this.nodes.shift().value;
            eventDescriptions.push(`Node '${value.properties.name}' dequeued.`);
            console.log(`Dequeued Node: ${value.properties.name}`);
            return value;
        }

        isEmpty() {
            return this.nodes.length === 0;
        }

        toArray() {
            return this.nodes.map(node => ({ priority: node.priority, value: node.value.properties.name }));
        }
    }

    function heuristic(nodeA, nodeB) {
        const distance = Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
        eventDescriptions.push(`Heuristic calculated between '${nodeA.properties.name}' and '${nodeB.properties.name}': ${Math.round(distance)}`);
        return Math.round(distance);
    }

    function reconstructPath(cameFrom, endNode) {
        let currentNode = endNode;
        const totalPath = [currentNode.properties.name];
        while (cameFrom.has(currentNode.properties.name)) {
            const { predecessor, linkId } = cameFrom.get(currentNode.properties.name);
            totalPath.unshift(Number(linkId));
            totalPath.unshift(predecessor.properties.name);
            currentNode = predecessor;
        }
        const nodePath = totalPath.filter(item => isNaN(item));
        eventDescriptions.push(`Reconstructed path to node '${currentNode.properties.name}': ${nodePath.join(' -> ')}`);
        return totalPath;
    }

    function greedyBFS(nodes, links, startNodeName, endNodeName) {
        const openSet = new PriorityQueue();
        const cameFrom = new Map();
        const visited = new Set();
        const heuristicCost = new Map();

        const startNode = nodes.find(node => node.properties.name === startNodeName);
        const endNode = nodes.find(node => node.properties.name === endNodeName);

        if (!startNode || !endNode) {
            eventDescriptions.push("Failed to find start or end node.");
            return "Failed to find a path";
        }

        openSet.enqueue(0, startNode);
        heuristicCost.set(startNode.properties.name, heuristic(startNode, endNode));
        eventDescriptions.push(`Starting Greedy Best-First Search from node '${startNode.properties.name}' to node '${endNode.properties.name}'.`);

        let finalPath = [];
        let costsAtEachStep = [];

        while (!openSet.isEmpty()) {
            const currentNode = openSet.dequeue();
            eventDescriptions.push(`Processing node '${currentNode.properties.name}'.`);
            visited.add(currentNode.properties.name);

            if (currentNode.properties.name === endNode.properties.name) {
                eventDescriptions.push(`End node '${endNodeName}' reached.`);
                finalPath = finalPath.concat(reconstructPath(cameFrom, currentNode));
                costsAtEachStep.push(new Map(heuristicCost));
                return { finalPath, costsAtEachStep };
            }

            const currentStep = [currentNode.properties.name];
            const unhighlightStep = [];

            links.forEach(link => {
                let neighbor = null;
                if (link.startNode === currentNode.id) {
                    neighbor = nodes.find(node => node.id === link.endNode);
                } else if (link.endNode === currentNode.id) {
                    neighbor = nodes.find(node => node.id === link.startNode);
                }

                if (neighbor && !visited.has(neighbor.properties.name)) {
                    const priority = heuristic(neighbor, endNode);
                    cameFrom.set(neighbor.properties.name, {
                        predecessor: currentNode,
                        linkId: link.id
                    });
                    openSet.enqueue(priority, neighbor);
                    heuristicCost.set(neighbor.properties.name, priority);
                    currentStep.push(Number(link.id));
                    currentStep.push(neighbor.properties.name);
                }
            });

            currentStep.push(unhighlightStep);
            finalPath.push(currentStep);
            costsAtEachStep.push(new Map(heuristicCost));
            //eventDescriptions.push(currentStep);
        }

        eventDescriptions.push("Failed to find a path.");
        return "Failed to find a path";
    }

    let result = greedyBFS(nodes, links, startNodeName, endNodeName);

    if (result === "Failed to find a path") {
        showDescButton("Greedy Best-First Search (GBFS)", result, eventDescriptions);
        showErrorModal(`Failed to find a path between the selected nodes: [${startNodeName}] - [${endNodeName}]`);
    } else {
        let { finalPath, costsAtEachStep } = result;
        console.log("PATH => ", finalPath);
        console.log("COSTS AT EACH STEP => ", costsAtEachStep);
        let algorithm = ["Greedy Best-First Search (GBFS)", finalPath, costsAtEachStep];
        showDescButton("Greedy Best-First Search (GBFS)", finalPath, eventDescriptions);
        updateGraph(globalNodes, globalLinks, algorithm);
    }
}


