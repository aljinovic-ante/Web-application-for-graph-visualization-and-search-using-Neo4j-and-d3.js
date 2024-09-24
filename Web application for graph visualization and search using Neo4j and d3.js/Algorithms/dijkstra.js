function checkNegative(){
    for(let link of globalLinks) {
        if(link.properties.distance < 0){
            console.log("UDALJENOST:", link.properties.distance);
            return false;
        }
    }
    return true;
}

document.addEventListener("DOMContentLoaded", function() {
    const startDropdown = document.getElementById('startNodeDropdownDijkstra');
    const endDropdown = document.getElementById('endNodeDropdownDijkstra');
    const dijkstraToggle = document.getElementById('dijkstraToggle');
    const leftLabel = document.querySelector('.toggle-container .toggle-label-left');
    const rightLabel = document.querySelector('.toggle-container .toggle-label-right');
    const message = document.getElementById('chooseNodesDijkstraMessage');

    function handleToggleChange() {
        if (dijkstraToggle.checked) {
            leftLabel.style.color = 'black';
            rightLabel.style.color = 'hsl(318, 74%, 38%)';
            rightLabel.style.fontWeight = 'bold';
            endDropdown.disabled = true;
            endDropdown.style.opacity = '0.5';
            message.innerHTML = '<strong>Choose the start node for Dijkstra\'s algorithm:</strong>';
        } else {
            rightLabel.style.color = 'black';
            rightLabel.style.fontWeight = 'normal';
            leftLabel.style.color = '#064c9c';
            endDropdown.disabled = false;
            endDropdown.style.opacity = '1';
            message.innerHTML = '<strong>Choose the start and end node for Dijkstra\'s algorithm:</strong>';
        }
        validateNodeSelectionDijkstra(); 
    }

    startDropdown.addEventListener('change', validateNodeSelectionDijkstra);
    endDropdown.addEventListener('change', validateNodeSelectionDijkstra);
    dijkstraToggle.addEventListener('change', handleToggleChange);

    handleToggleChange();
});

document.getElementById('chooseNodesDijkstraExplainAlg').addEventListener('click', function() {
    document.getElementById('whatIsDijkstra').style.display = 'flex';
});

document.getElementById('whatIsDijkstraClose').addEventListener('click', function() {
    document.getElementById('whatIsDijkstra').style.display = 'none';
});

function validateNodeSelectionDijkstra() {
    let disableFlagSameNodesSel = false;
    let disableFlagCheckNeg = false;

    const startDropdown = document.getElementById('startNodeDropdownDijkstra');
    const endDropdown = document.getElementById('endNodeDropdownDijkstra');
    const confirmButton = document.getElementById('chooseNodesDijkstraConfirm');
    const warningMessage = document.getElementById('relationshipWarningDijsktra');
    const algorithmWarning = document.getElementById('algorithmWarningDijsktra');
    const dijkstraToggle = document.getElementById('dijkstraToggle');
    warningMessage.style.display = 'none';
    warningMessage.textContent = '';
    algorithmWarning.style.display = 'none';
    algorithmWarning.textContent = '';

    console.log("Checking conditions: ", startDropdown.value, endDropdown.value, checkNegative());
    console.log("toggle: ", dijkstraToggle.checked);

    if (!dijkstraToggle.checked) {
        if (startDropdown.value === endDropdown.value) {
            console.log("Same nodes selected, showing warning.");
            warningMessage.style.display = 'block';
            warningMessage.textContent = 'Start and end node cannot be the same.';
            disableFlagSameNodesSel = true;
        }
    }
    
    if (!checkNegative()) {
        console.log("Negative weights detected, showing warning.");
        algorithmWarning.textContent = 'Dijkstra algorithm does NOT work with negative edge weights!';
        algorithmWarning.style.display = 'block';
        disableFlagCheckNeg = true;
    }
    
    confirmButton.disabled = disableFlagSameNodesSel || disableFlagCheckNeg;
}

function populateNodeDropdownsDijkstra() {
    let startDropdown = document.getElementById('startNodeDropdownDijkstra');
    let endDropdown = document.getElementById('endNodeDropdownDijkstra');
    let nodes = globalNodes;

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

    validateNodeSelectionDijkstra();
}

document.getElementById('chooseNodesDijkstraConfirm').addEventListener('click', function() {
    let startNode = document.getElementById('startNodeDropdownDijkstra').value;
    let endNode = document.getElementById('endNodeDropdownDijkstra').value;
    let dijkstraToggle = document.getElementById('dijkstraToggle').checked;

    let startNodeText = document.getElementById('startNodeDropdownDijkstra').selectedOptions[0].textContent;
    let endNodeText = document.getElementById('endNodeDropdownDijkstra').selectedOptions[0].textContent;

    console.log('Start Node ID:', startNode, 'End Node ID:', endNode);
    console.log('Start Node Text:', startNodeText, 'End Node Text:', endNodeText);

    document.getElementById('chooseNodesDijkstra').style.display = 'none';
    if (dijkstraToggle) {
        dijkstraAllPathsAlgorithm(startNode); 
    } else {
        dijkstraAlgorithm(startNode, endNode); 
    }
});

document.getElementById('chooseNodesDijkstraCancel').addEventListener('click', function() {
    document.getElementById('chooseNodesDijkstra').style.display = 'none';
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    algorithmDropdown.value = ''; 
    document.getElementById('chooseAlgorithmModal').style.display = 'flex';
});

function dijkstraAlgorithm(startNodeName, endNodeName) {
    console.log("HERE ARE THE NODES.");
    console.log(startNodeName);
    console.log(endNodeName);
    let nodes = globalNodes;
    let links = globalLinks;
    console.log("HERE ARE THE NODES.", nodes);
    console.log(links);

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

    function dijkstra(nodes, links, startNodeName, endNodeName) {
        const openSet = new PriorityQueue();
        const cameFrom = new Map();
        const cost = new Map(nodes.map(node => [node.properties.name, Infinity]));

        const startNode = nodes.find(node => node.properties.name === startNodeName);
        const endNode = nodes.find(node => node.properties.name === endNodeName);

        if (!startNode || !endNode) {
            eventDescriptions.push("Failed to find start or end node.");
            console.log("Failed to find start or end node.");
            return "Failed to find a path";
        }

        cost.set(startNode.properties.name, 0);
        openSet.enqueue(0, startNode);
        eventDescriptions.push(`Start node '${startNodeName}' initialized with cost 0 and enqueued.`);
        console.log(`Start Node: ${startNodeName}, Cost: 0`);

        let finalPath = [];
        let costsAtEachStep = [];

        while (!openSet.isEmpty()) {
            const currentNode = openSet.dequeue();
            eventDescriptions.push(`Processing node '${currentNode.properties.name}' with current cost ${cost.get(currentNode.properties.name)}.`);
            console.log(`Processing Node: ${currentNode.properties.name}, Current Cost: ${cost.get(currentNode.properties.name)}`);

            if (currentNode.properties.name === endNode.properties.name) {
                eventDescriptions.push(`End node '${endNodeName}' reached.`);
                console.log(`End Node Reached: ${endNodeName}`);
                finalPath = finalPath.concat(reconstructPath(cameFrom, currentNode));
                costsAtEachStep.push(new Map(cost));
                return { finalPath, costsAtEachStep };
            }

            const currentStep = [currentNode.properties.name];
            const unhighlightStep = [];

            links.filter(link => 
                link.source.properties.name === currentNode.properties.name || 
                link.target.properties.name === currentNode.properties.name
            ).forEach(link => {
                const neighbor = link.source.properties.name === currentNode.properties.name
                    ? nodes.find(node => node.properties.name === link.target.properties.name)
                    : nodes.find(node => node.properties.name === link.source.properties.name);

                const probableCost = cost.get(currentNode.properties.name) + link.properties.distance;
                eventDescriptions.push(`Checking link from '${currentNode.properties.name}' to '${neighbor.properties.name}' with distance ${link.properties.distance}.`);
                console.log(`Checking Link: ${currentNode.properties.name} -> ${neighbor.properties.name}, Distance: ${link.properties.distance}`);

                currentStep.push(Number(link.id));
                currentStep.push(neighbor.properties.name);

                if (probableCost < cost.get(neighbor.properties.name)) {
                    eventDescriptions.push(`Relaxation: Updating node '${neighbor.properties.name}' since new cost ${probableCost} is less than current cost ${cost.get(neighbor.properties.name)}.`);
                    console.log(`Updating Node: ${neighbor.properties.name}, New Cost: ${probableCost}`);
                    cameFrom.set(neighbor.properties.name, { node: currentNode, linkId: link.id });
                    cost.set(neighbor.properties.name, probableCost);
                    eventDescriptions.push(`Updated cost for node '${neighbor.properties.name}' to ${probableCost}.`);
                    openSet.enqueue(probableCost, neighbor);
                    eventDescriptions.push(`Neighbor node '${neighbor.properties.name}' enqueued with priority ${probableCost}.`);
                    console.log(`Neighbor Enqueued: ${neighbor.properties.name}, Priority: ${probableCost}`);
                } else {
                    eventDescriptions.push(`No update required for node '${neighbor.properties.name}'. Current cost is lower.`);
                    console.log(`No Update for Node: ${neighbor.properties.name}, Current Cost: ${cost.get(neighbor.properties.name)}`);
                }

                unhighlightStep.push(Number(link.id), neighbor.properties.name);
            });

            currentStep.push(unhighlightStep);
            finalPath.push(currentStep);
            costsAtEachStep.push(new Map(cost));
            //eventDescriptions.push(currentStep);
        }

        eventDescriptions.push("Failed to find a path.");
        console.log("Failed to find a path.");
        return "Failed to find a path";
    }

    let result = dijkstra(nodes, links, startNodeName, endNodeName);

    if (result === "Failed to find a path") {
        showDescButton("Dijkstra", result, eventDescriptions);
        showErrorModal(`Failed to find a path between the selected nodes. [${startNodeName}] - [${endNodeName}]`);
    } else {
        let { finalPath, costsAtEachStep } = result;
        console.log("PATH => ", finalPath);
        console.log("COSTS AT EACH STEP => ", costsAtEachStep);
        let algorithm = ["Dijkstra", finalPath, costsAtEachStep];
        showDescButton("Dijkstra", finalPath, eventDescriptions);
        updateGraph(globalNodes, globalLinks, algorithm);
    }
}

function dijkstraAllPathsAlgorithm(startNodeName) {
    console.log("HERE IS THE START NODE.");
    console.log(startNodeName);
    let nodes = globalNodes;
    let links = globalLinks;
    console.log("HERE ARE THE NODES.", nodes);
    console.log(links);

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
        eventDescriptions.push(`--------------`);
        console.log(`Reconstructed Path: ${nodePath.join(' -> ')}`);
        return totalPath;
    }

    function dijkstra(nodes, links, startNodeName) {
        const openSet = new PriorityQueue();
        const cameFrom = new Map();
        const cost = new Map(nodes.map(node => [node.properties.name, Infinity]));
        const allPaths = new Map();
        const costsAtEachStep = [];

        const startNode = nodes.find(node => node.properties.name === startNodeName);

        if (!startNode) {
            eventDescriptions.push("Failed to find the start node.");
            console.log("Failed to find the start node.");
            return "Failed to find a path";
        }

        cost.set(startNode.properties.name, 0);
        openSet.enqueue(0, startNode);
        eventDescriptions.push(`Start node '${startNodeName}' initialized with cost 0 and enqueued.`);
        console.log(`Start Node: ${startNodeName}, Cost: 0`);

        while (!openSet.isEmpty()) {
            const currentNode = openSet.dequeue();
            eventDescriptions.push(`Processing node '${currentNode.properties.name}' with current cost ${cost.get(currentNode.properties.name)}.`);
            console.log(`Processing Node: ${currentNode.properties.name}, Current Cost: ${cost.get(currentNode.properties.name)}`);

            links.filter(link => 
                link.source.properties.name === currentNode.properties.name || 
                link.target.properties.name === currentNode.properties.name
            ).forEach(link => {
                const neighbor = link.source.properties.name === currentNode.properties.name
                    ? nodes.find(node => node.properties.name === link.target.properties.name)
                    : nodes.find(node => node.properties.name === link.source.properties.name);

                const probableCost = cost.get(currentNode.properties.name) + link.properties.distance;
                eventDescriptions.push(`Checking link from '${currentNode.properties.name}' to '${neighbor.properties.name}' with distance ${link.properties.distance}.`);
                console.log(`Checking Link: ${currentNode.properties.name} -> ${neighbor.properties.name}, Distance: ${link.properties.distance}`);

                if (probableCost < cost.get(neighbor.properties.name)) {
                    eventDescriptions.push(`<strong>Relaxation</strong>: Updating node '${neighbor.properties.name}' since new cost ${probableCost} is less than current cost ${cost.get(neighbor.properties.name)}.`);
                    console.log(`Updating Node: ${neighbor.properties.name}, New Cost: ${probableCost}`);
                    cameFrom.set(neighbor.properties.name, { node: currentNode, linkId: link.id });
                    cost.set(neighbor.properties.name, probableCost);
                    eventDescriptions.push(`Updated cost for node '${neighbor.properties.name}' to ${probableCost}.`);
                    openSet.enqueue(probableCost, neighbor);
                    eventDescriptions.push(`Neighbor node '${neighbor.properties.name}' enqueued with priority ${probableCost}.`);
                    console.log(`Neighbor Enqueued: ${neighbor.properties.name}, Priority: ${probableCost}`);
                } else {
                    eventDescriptions.push(`No update required for node '${neighbor.properties.name}'. Current cost is lower.`);
                    console.log(`No Update for Node: ${neighbor.properties.name}, Current Cost: ${cost.get(neighbor.properties.name)}`);
                }
            });

            const path = reconstructPath(cameFrom, currentNode);
            if (path.length > 1) { 
                allPaths.set(currentNode.properties.name, path);
                eventDescriptions.push(`Path to node '${currentNode.properties.name}' updated.`);
                console.log(`Path to node '${currentNode.properties.name}' updated.`);
            }
            costsAtEachStep.push(new Map(cost));
        }

        return { allPaths: Array.from(allPaths.values()), costsAtEachStep };
    }

    let result = dijkstra(nodes, links, startNodeName);

    if (result === "Failed to find a path") {
        showDescButton("Dijkstra All Paths", result, eventDescriptions);
        showErrorModal(`Failed to find a path from the start node: [${startNodeName}]`);
    } else {
        let { allPaths, costsAtEachStep } = result;
        console.log("PATHS => ", allPaths);
        console.log("COSTS AT EACH STEP => ", costsAtEachStep);
        let algorithm = ["Dijkstra All Paths", allPaths, costsAtEachStep];
        showDescButton("Dijkstra All Paths", allPaths, eventDescriptions);
        updateGraph(globalNodes, globalLinks, algorithm);
    }
}

