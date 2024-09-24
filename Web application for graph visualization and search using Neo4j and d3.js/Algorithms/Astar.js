function checkNegative(){
    for(let link of globalLinks) {
        if(link.properties.distance < 0){
            console.log("",link.properties.distance);
            return false;
        }
    }
    return true;
}

document.getElementById('chooseNodesAstarExplainAlg').addEventListener('click', function() {
    document.getElementById('whatIsAstar').style.display = 'flex';
});

document.getElementById('whatIsAstarClose').addEventListener('click', function() {
    document.getElementById('whatIsAstar').style.display = 'none';
});

function validateNodeSelectionASTAR() {
    let disableFlagSEN = false;
    let disableFlagCN = false;

    const startDropdown = document.getElementById('startNodeDropdown');
    const endDropdown = document.getElementById('endNodeDropdown');
    const confirmButton = document.getElementById('chooseNodesAstarConfirm');
    const warningMessage = document.getElementById('relationshipWarningASTAR');
    const algorithmWarning = document.getElementById('algorithmWarning');

    warningMessage.style.display = 'none';
    warningMessage.textContent = '';
    algorithmWarning.style.display = 'none';
    algorithmWarning.textContent = '';

    if (startDropdown.value === endDropdown.value) {
        warningMessage.style.display = 'block';
        warningMessage.textContent = 'Start and end node cannot be the same.';
        disableFlagSEN = true;
    } 

    if(!checkNegative()){
        algorithmWarning.textContent = 'A* algorithm does NOT work with negative edge weights!';
        algorithmWarning.style.display = 'block';
        disableFlagCN = true;
    } 
    confirmButton.disabled = disableFlagSEN || disableFlagCN;
}

function populateNodeDropdownsASTAR() {
    let startDropdown = document.getElementById('startNodeDropdown');
    let endDropdown = document.getElementById('endNodeDropdown');
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

    validateNodeSelectionASTAR();
}

document.getElementById('chooseNodesAstarConfirm').addEventListener('click', function() {
    let startNode = document.getElementById('startNodeDropdown').value;
    let endNode = document.getElementById('endNodeDropdown').value;

    let startNodeText = document.getElementById('startNodeDropdown').selectedOptions[0].textContent;
    let endNodeText = document.getElementById('endNodeDropdown').selectedOptions[0].textContent;

    console.log('Start Node ID:', startNode, 'End Node ID:', endNode);
    console.log('Start Node Text:', startNodeText, 'End Node Text:', endNodeText);

    document.getElementById('chooseNodesAstar').style.display = 'none';
    Astar(startNode, endNode); 
});

document.getElementById('chooseNodesAstarCancel').addEventListener('click', function() {
    document.getElementById('chooseNodesAstar').style.display = 'none';
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    algorithmDropdown.value = ''; 
    document.getElementById('chooseAlgorithmModal').style.display = 'flex';
});

document.addEventListener("DOMContentLoaded", function() {
    const startDropdown = document.getElementById('startNodeDropdown');
    const endDropdown = document.getElementById('endNodeDropdown');

    startDropdown.addEventListener('change', validateNodeSelectionASTAR);
    endDropdown.addEventListener('change', validateNodeSelectionASTAR);
});
//f(n)=g(n)+h(n) tj tezina + pozicija
//undir
function Astar(startNodeName, endNodeName) {
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
    }

    function heuristic(nodeA, nodeB) {
        const distance = Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
        eventDescriptions.push(`Heuristic calculated between '${nodeA.properties.name}' and '${nodeB.properties.name}': ${Math.round(distance)}`);
        return Math.round(distance);
    }

    function reconstructPath(cameFrom, currentNode) {
        const totalPath = [];
        let currentKey = currentNode.properties.name;
        while (cameFrom.has(currentKey)) {
            const record = cameFrom.get(currentKey);
            totalPath.unshift(currentKey);
            totalPath.unshift(Number(record.linkId));
            currentKey = record.node.properties.name;
        }
        totalPath.unshift(currentKey);
        const nodePath = totalPath.filter(item => isNaN(item));
        eventDescriptions.push(`Reconstructed path to node '${currentNode.properties.name}': ${nodePath.join(' -> ')}`);
        console.log(`Reconstructed Path: ${nodePath.join(' -> ')}`);
        return totalPath;
    }

    function aStarAlgorithm(nodes, links, startNodeName, endNodeName) {
        const openSet = new PriorityQueue();
        const cameFrom = new Map();
        const startToCurrent = new Map(nodes.map(node => [node.properties.name, { actual: Infinity, heuristic: 0 }]));
        const totalCost = new Map();

        const startNode = nodes.find(node => node.properties.name === startNodeName);
        const endNode = nodes.find(node => node.properties.name === endNodeName);

        if (!startNode || !endNode) {
            eventDescriptions.push("Failed to find start or end node.");
            console.log("Failed to find start or end node.");
            return "Failed to find a path";
        }

        startToCurrent.set(startNode.properties.name, { actual: 0, heuristic: heuristic(startNode, endNode) });
        totalCost.set(startNode.properties.name, heuristic(startNode, endNode));
        eventDescriptions.push(`Start node '${startNodeName}' initialized with cost 0 and heuristic ${heuristic(startNode, endNode)}.`);
        console.log(`Start Node: ${startNodeName}, Cost: 0`);

        openSet.enqueue(totalCost.get(startNode.properties.name), startNode);

        let finalPath = [];
        let costsAtEachStep = [];

        while (!openSet.isEmpty()) {
            const currentNode = openSet.dequeue();
            eventDescriptions.push(`Processing node '${currentNode.properties.name}' with current cost ${startToCurrent.get(currentNode.properties.name).actual}.`);
            console.log(`Processing Node: ${currentNode.properties.name}, Current Cost: ${startToCurrent.get(currentNode.properties.name).actual}`);

            if (currentNode.properties.name === endNode.properties.name) {
                eventDescriptions.push(`End node '${endNodeName}' reached.`);
                console.log(`End Node Reached: ${endNodeName}`);
                finalPath = finalPath.concat(reconstructPath(cameFrom, currentNode));
                costsAtEachStep.push(new Map(startToCurrent));
                return { finalPath, costsAtEachStep };
            }

            const currentStep = [currentNode.properties.name];
            const unhighlightStep = [];

            links.forEach(link => {
                let neighbor = null;
                if (link.source.properties.name === currentNode.properties.name) {
                    neighbor = nodes.find(node => node.properties.name === link.target.properties.name);
                } else if (link.target.properties.name === currentNode.properties.name) {
                    neighbor = nodes.find(node => node.properties.name === link.source.properties.name);
                }

                if (neighbor) {
                    const tentativeStartToCurrent = startToCurrent.get(currentNode.properties.name).actual + link.properties.distance;
                    eventDescriptions.push(`Checking link from '${currentNode.properties.name}' to '${neighbor.properties.name}' with distance ${link.properties.distance}.`);
                    console.log(`Checking Link: ${currentNode.properties.name} -> ${neighbor.properties.name}, Distance: ${link.properties.distance}`);

                    currentStep.push(Number(link.id));
                    currentStep.push(neighbor.properties.name);

                    if (tentativeStartToCurrent < startToCurrent.get(neighbor.properties.name).actual) {
                        eventDescriptions.push(`Relaxation: Updating node '${neighbor.properties.name}' since current cost ${tentativeStartToCurrent} is less than previous cost ${startToCurrent.get(neighbor.properties.name).actual}.`);
                        console.log(`Updating Node: ${neighbor.properties.name}, New Cost: ${tentativeStartToCurrent}`);
                        cameFrom.set(neighbor.properties.name, { node: currentNode, linkId: link.id });
                        startToCurrent.set(neighbor.properties.name, { actual: tentativeStartToCurrent, heuristic: heuristic(neighbor, endNode) });
                        totalCost.set(neighbor.properties.name, tentativeStartToCurrent + heuristic(neighbor, endNode));
                        eventDescriptions.push(`Updated cost for node '${neighbor.properties.name}' to ${tentativeStartToCurrent} and total cost ${tentativeStartToCurrent + heuristic(neighbor, endNode)}.`);
                        console.log(`Updated Cost for Node: ${neighbor.properties.name}, Cost: ${tentativeStartToCurrent}`);

                        if (!openSet.nodes.some(element => element.value.properties.name === neighbor.properties.name)) {
                            openSet.enqueue(totalCost.get(neighbor.properties.name), neighbor);
                            eventDescriptions.push(`Node '${neighbor.properties.name}' enqueued with priority ${totalCost.get(neighbor.properties.name)}.`);
                            console.log(`Neighbor Enqueued: ${neighbor.properties.name}, Priority: ${totalCost.get(neighbor.properties.name)}`);
                        }
                    }
                    unhighlightStep.push(Number(link.id), neighbor.properties.name);
                }
            });

            currentStep.push(unhighlightStep);
            finalPath.push(currentStep);
            costsAtEachStep.push(new Map(startToCurrent));
            //eventDescriptions.push(currentStep);
        }

        eventDescriptions.push("Failed to find a path.");
        console.log("Failed to find a path.");
        return "Failed to find a path";
    }

    let result = aStarAlgorithm(nodes, links, startNodeName, endNodeName);

    if (result === "Failed to find a path") {
        showDescButton("A*", result, eventDescriptions);
        showErrorModal(`Failed to find a path between the selected nodes. [${startNodeName}] - [${endNodeName}]`);
    } else {
        let { finalPath, costsAtEachStep } = result;
        console.log("PATH => ", finalPath);
        console.log("COSTS AT EACH STEP => ", costsAtEachStep);
        let algorithm = ["A*", finalPath, costsAtEachStep];
        showDescButton("A*", finalPath, eventDescriptions);
        updateGraph(globalNodes, globalLinks, algorithm);
    }
}
