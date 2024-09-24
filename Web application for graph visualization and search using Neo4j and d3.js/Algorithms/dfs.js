function validateNodeSelectionDFS() {
    const startDropdown = document.getElementById('startNodeDropdownDFS');
    const endDropdown = document.getElementById('endNodeDropdownDFS');
    const confirmButton = document.getElementById('chooseNodesDFSConfirm');
    const warningMessage = document.getElementById('relationshipWarningDFS');

    if (startDropdown.value === endDropdown.value) {
        warningMessage.style.display = 'block';
        warningMessage.textContent = 'Start and end node cannot be the same.';
        confirmButton.disabled = true;
    } else {
        warningMessage.style.display = 'none';
        warningMessage.textContent = '';
        confirmButton.disabled = false;
    }
}
document.getElementById('chooseNodesDFSExplainAlg').addEventListener('click', function() {
    document.getElementById('whatIsDFS').style.display = 'flex';
});

document.getElementById('whatIsDFSClose').addEventListener('click', function() {
    document.getElementById('whatIsDFS').style.display = 'none';
});

function populateNodeDropdownsDFS() {
    let startDropdown = document.getElementById('startNodeDropdownDFS');
    let endDropdown = document.getElementById('endNodeDropdownDFS');
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

    validateNodeSelectionDFS();
}

document.getElementById('chooseNodesDFSConfirm').addEventListener('click', function() {
    let startNode = document.getElementById('startNodeDropdownDFS').value;
    let endNode = document.getElementById('endNodeDropdownDFS').value;

    let startNodeText = document.getElementById('startNodeDropdownDFS').selectedOptions[0].textContent;
    let endNodeText = document.getElementById('endNodeDropdownDFS').selectedOptions[0].textContent;

    console.log('Start Node ID:', startNode, 'End Node ID:', endNode);
    console.log('Start Node Text:', startNodeText, 'End Node Text:', endNodeText);

    document.getElementById('chooseNodesDFS').style.display = 'none';
    depthFirstSearch(startNode, endNode); 
});

document.getElementById('chooseNodesDFSCancel').addEventListener('click', function() {
    document.getElementById('chooseNodesDFS').style.display = 'none';
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    algorithmDropdown.value = ''; 
    document.getElementById('chooseAlgorithmModal').style.display = 'flex';
});

document.addEventListener("DOMContentLoaded", function() {
    const startDropdown = document.getElementById('startNodeDropdownDFS');
    const endDropdown = document.getElementById('endNodeDropdownDFS');

    startDropdown.addEventListener('change', validateNodeSelectionDFS);
    endDropdown.addEventListener('change', validateNodeSelectionDFS);
});

function depthFirstSearch(startNodeName, endNodeName) {
    console.log("HERE ARE THE NODES.");
    console.log(startNodeName);
    console.log(endNodeName);
    let nodes = globalNodes;
    let links = globalLinks;
    console.log("HERE ARE THE NODES.", nodes);
    console.log(links);

    let eventDescriptions = [];

    class Stack {
        constructor() {
            this.nodes = [];
        }

        push(value) {
            this.nodes.push(value);
            eventDescriptions.push(`Node '${value.properties.name}' pushed to stack.`);
        }

        pop() {
            const value = this.nodes.pop();
            eventDescriptions.push(`Node '${value.properties.name}' popped from the stack.`);
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

    function dfs(nodes, links, startNodeName, endNodeName) {
        const stack = new Stack();
        const visited = new Set();
        const cameFrom = new Map();
        const steps = [];

        const startNode = nodes.find(node => node.properties.name === startNodeName);
        const endNode = nodes.find(node => node.properties.name === endNodeName);

        if (!startNode || !endNode) {
            eventDescriptions.push("Failed to find start or end node.");
            return { path: "Failed to find a path", steps };
        }

        stack.push(startNode);
        visited.add(startNode.properties.name);
        eventDescriptions.push(`Start node '${startNodeName}' pushed to stack and marked as visited.`);

        while (!stack.isEmpty()) {
            const currentNode = stack.pop();
            steps.push([currentNode.properties.name]);

            if (currentNode.properties.name === endNode.properties.name) {
                eventDescriptions.push(`End node '${endNodeName}' reached.`);
                return { path: reconstructPath(cameFrom, currentNode), steps };
            }

            links.filter(link => 
                link.source.properties.name === currentNode.properties.name || 
                link.target.properties.name === currentNode.properties.name
            ).forEach(link => {
                const neighbor = link.source.properties.name === currentNode.properties.name
                    ? nodes.find(node => node.properties.name === link.target.properties.name)
                    : nodes.find(node => node.properties.name === link.source.properties.name);

                if (!visited.has(neighbor.properties.name)) {
                    visited.add(neighbor.properties.name);
                    cameFrom.set(neighbor.properties.name, { node: currentNode, linkId: link.id });
                    stack.push(neighbor);
                    steps.push([currentNode.properties.name, Number(link.id), neighbor.properties.name]);
                    eventDescriptions.push(`Neighbor node '${neighbor.properties.name}' pushed to stack.`);
                }
            });
        }

        eventDescriptions.push("Failed to find a path.");
        return { path: "Failed to find a path", steps };
    }

    let result = dfs(nodes, links, startNodeName, endNodeName);

    if (result.path === "Failed to find a path") {
        showDescButton("Depth First Search (DFS)", result.path, eventDescriptions);
        showErrorModal(`Failed to find a path between the selected nodes. [${startNodeName}] - [${endNodeName}]`);
    } else {
        let { path, steps } = result;
        console.log("PATH => ", path);
        let algorithm = ["Depth First Search (DFS)", path, steps];
        showDescButton("Depth First Search (DFS)", path, eventDescriptions);
        updateGraph(globalNodes, globalLinks, algorithm);
    }
}