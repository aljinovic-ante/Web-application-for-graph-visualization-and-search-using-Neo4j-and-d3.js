function validateNodeSelectionBFS() {
    const startDropdown = document.getElementById('startNodeDropdownBFS');
    const endDropdown = document.getElementById('endNodeDropdownBFS');
    const confirmButton = document.getElementById('chooseNodesBFSConfirm');
    const warningMessage = document.getElementById('relationshipWarningbfs');

    if (startDropdown.value === endDropdown.value) {
        console.log("cfm");
        warningMessage.style.display = 'block';
        warningMessage.textContent = 'Start and end node cannot be the same.';
        confirmButton.disabled = true;
    } else {
        console.log("NOT CFM");

        warningMessage.style.display = 'none';
        warningMessage.textContent = '';
        confirmButton.disabled = false;
    }
}
document.getElementById('chooseNodesBFSExplainAlg').addEventListener('click', function() {
    document.getElementById('whatIsBFS').style.display = 'flex';
});

document.getElementById('whatIsBFSClose').addEventListener('click', function() {
    document.getElementById('whatIsBFS').style.display = 'none';
});

function populateNodeDropdownsBFS() {
    let startDropdown = document.getElementById('startNodeDropdownBFS');
    let endDropdown = document.getElementById('endNodeDropdownBFS');
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

    validateNodeSelectionBFS();
}

document.getElementById('chooseNodesBFSConfirm').addEventListener('click', function() {
    let startNode = document.getElementById('startNodeDropdownBFS').value;
    let endNode = document.getElementById('endNodeDropdownBFS').value;

    let startNodeText = document.getElementById('startNodeDropdownBFS').selectedOptions[0].textContent;
    let endNodeText = document.getElementById('endNodeDropdownBFS').selectedOptions[0].textContent;

    console.log('Start Node ID:', startNode, 'End Node ID:', endNode);
    console.log('Start Node Text:', startNodeText, 'End Node Text:', endNodeText);

    document.getElementById('chooseNodesBFS').style.display = 'none';
    breadthFirstSearch(startNode, endNode); 
});

document.getElementById('chooseNodesBFSCancel').addEventListener('click', function() {
    document.getElementById('chooseNodesBFS').style.display = 'none';
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    algorithmDropdown.value = ''; 
    document.getElementById('chooseAlgorithmModal').style.display = 'flex';
});

document.addEventListener("DOMContentLoaded", function() {
    const startDropdown = document.getElementById('startNodeDropdownBFS');
    const endDropdown = document.getElementById('endNodeDropdownBFS');

    startDropdown.addEventListener('change', validateNodeSelectionBFS);
    endDropdown.addEventListener('change', validateNodeSelectionBFS);
    validateNodeSelectionBFS();
});

function breadthFirstSearch(startNodeName, endNodeName) {
    console.log("HERE ARE THE NODES.");
    console.log(startNodeName);
    console.log(endNodeName);
    let nodes = globalNodes;
    let links = globalLinks;
    console.log("HERE ARE THE NODES.", nodes);
    console.log(links);

    let eventDescriptions = [];

    class Queue {
        constructor() {
            this.nodes = [];
        }

        enqueue(value) {
            this.nodes.push(value);
            eventDescriptions.push(`Node '${value.properties.name}' enqueued.`);
        }

        dequeue() {
            const value = this.nodes.shift();
            eventDescriptions.push(`Node '${value.properties.name}' dequeued.`);
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
        return totalPath;
    }

    function bfs(nodes, links, startNodeName, endNodeName) {
        const queue = new Queue();
        const visited = new Set();
        const cameFrom = new Map();
        const steps = [];

        const startNode = nodes.find(node => node.properties.name === startNodeName);
        const endNode = nodes.find(node => node.properties.name === endNodeName);

        if (!startNode || !endNode) {
            eventDescriptions.push("Failed to find start or end node.");
            return { path: "Failed to find a path", steps };
        }

        queue.enqueue(startNode);
        visited.add(startNode.properties.name);
        eventDescriptions.push(`Start node '${startNodeName}' enqueued and marked as visited.`);

        while (!queue.isEmpty()) {
            const currentNode = queue.dequeue();
            steps.push([currentNode.properties.name]);

            if (currentNode.properties.name === endNode.properties.name) {
                eventDescriptions.push(`End node '${endNodeName}' reached.`);
                return { path: reconstructPath(cameFrom, currentNode), steps };
            }

            links.filter(link => link.source.properties.name === currentNode.properties.name || link.target.properties.name === currentNode.properties.name)
                .forEach(link => {
                    const neighbor = link.source.properties.name === currentNode.properties.name
                        ? nodes.find(node => node.properties.name === link.target.properties.name)
                        : nodes.find(node => node.properties.name === link.source.properties.name);

                    if (!visited.has(neighbor.properties.name)) {
                        visited.add(neighbor.properties.name);
                        cameFrom.set(neighbor.properties.name, { node: currentNode, linkId: link.id });
                        queue.enqueue(neighbor);
                        steps.push([currentNode.properties.name, Number(link.id), neighbor.properties.name]);
                        eventDescriptions.push(`Neighbor node '${neighbor.properties.name}' enqueued.`);
                    }
                });
        }

        eventDescriptions.push("Failed to find a path.");
        return { path: "Failed to find a path", steps };
    }

    let result = bfs(nodes, links, startNodeName, endNodeName);

    if (result.path === "Failed to find a path") {
        showDescButton("Breadth First Search (BFS)", result.path, eventDescriptions);
        showErrorModal(`Failed to find a path between the selected nodes. [${startNodeName}] - [${endNodeName}]`);
    } else {
        let { path, steps } = result;
        console.log("PATH => ", path);
        let algorithm = ["Breadth First Search (BFS)", path, steps];
        showDescButton("Breadth First Search (BFS)", path, eventDescriptions);
        updateGraph(globalNodes, globalLinks, algorithm);
    }
}



