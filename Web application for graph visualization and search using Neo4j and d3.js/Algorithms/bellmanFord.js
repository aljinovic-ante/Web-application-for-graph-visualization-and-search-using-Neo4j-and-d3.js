document.addEventListener("DOMContentLoaded", function() {
    const startDropdown = document.getElementById('startNodeDropdownBellmanFord');
    const endDropdown = document.getElementById('endNodeDropdownBellmanFord');
    const bellmanFordToggle = document.getElementById('bellmanFordToggle');
    const leftLabel = document.querySelector('.toggle-container .toggle-label-left2');
    const rightLabel = document.querySelector('.toggle-container .toggle-label-right2');
    const message = document.getElementById('chooseNodesBellmanFordMessage');

    function handleToggleChange() {
        if (bellmanFordToggle.checked) {
            leftLabel.style.color = 'black';
            rightLabel.style.color = 'hsl(318, 74%, 38%)';
            rightLabel.style.fontWeight = 'bold';
            endDropdown.disabled = true;
            endDropdown.style.opacity = '0.5';
            message.innerHTML = '<strong>Choose the start node for Bellman-Ford algorithm:</strong>';
        } else {
            rightLabel.style.color = 'black';
            rightLabel.style.fontWeight = 'normal';
            leftLabel.style.color = '#064c9c';
            endDropdown.disabled = false;
            endDropdown.style.opacity = '1';
            message.innerHTML = '<strong>Choose the start and end node for Bellman-Ford algorithm:</strong>';
        }
        validateNodeSelectionBellmanFord(); 
    }

    startDropdown.addEventListener('change', validateNodeSelectionBellmanFord);
    endDropdown.addEventListener('change', validateNodeSelectionBellmanFord);
    bellmanFordToggle.addEventListener('change', handleToggleChange);

    handleToggleChange();
});

document.getElementById('chooseNodesBellmanFordExplainAlg').addEventListener('click', function() {
    document.getElementById('whatIsBellmanFord').style.display = 'flex';
});

document.getElementById('whatIsBellmanFordClose').addEventListener('click', function() {
    document.getElementById('whatIsBellmanFord').style.display = 'none';
});

function validateNodeSelectionBellmanFord() {
    const startDropdown = document.getElementById('startNodeDropdownBellmanFord');
    const endDropdown = document.getElementById('endNodeDropdownBellmanFord');
    const confirmButton = document.getElementById('chooseNodesBellmanFordConfirm');
    const warningMessage = document.getElementById('relationshipWarningBellmanFord');
    const bellmanFordToggle = document.getElementById('bellmanFordToggle');

    warningMessage.style.display = 'none';
    warningMessage.textContent = '';
    confirmButton.disabled = false;

    if (!bellmanFordToggle.checked && startDropdown.value === endDropdown.value) {
        warningMessage.style.display = 'block';
        warningMessage.textContent = 'Start and end node cannot be the same.';
        confirmButton.disabled = true;
    }
}

function populateNodeDropdownsBellmanFord() {
    const startDropdown = document.getElementById('startNodeDropdownBellmanFord');
    const endDropdown = document.getElementById('endNodeDropdownBellmanFord');
    const nodes = globalNodes;

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

    validateNodeSelectionBellmanFord();
}

document.getElementById('chooseNodesBellmanFordConfirm').addEventListener('click', function() {
    const startNode = document.getElementById('startNodeDropdownBellmanFord').value;
    const endNode = document.getElementById('endNodeDropdownBellmanFord').value;
    const bellmanFordToggle = document.getElementById('bellmanFordToggle').checked;

    const startNodeText = document.getElementById('startNodeDropdownBellmanFord').selectedOptions[0].textContent;
    const endNodeText = document.getElementById('endNodeDropdownBellmanFord').selectedOptions[0].textContent;

    console.log('Start Node ID:', startNode, 'End Node ID:', endNode);
    console.log('Start Node Text:', startNodeText, 'End Node Text:', endNodeText);

    document.getElementById('chooseNodesBellmanFord').style.display = 'none';
    if (bellmanFordToggle) {
        bellmanFordAlgorithmAllPaths(startNode); 
    } else {
        bellmanFordAlgorithm(startNode, endNode); 
    }
});

document.getElementById('chooseNodesBellmanFordCancel').addEventListener('click', function() {
    document.getElementById('chooseNodesBellmanFord').style.display = 'none';
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    algorithmDropdown.value = ''; 
    document.getElementById('chooseAlgorithmModal').style.display = 'flex';
});

function bellmanFordAlgorithm(startNodeName, endNodeName) {
    console.log("START NODE:", startNodeName);
    console.log("END NODE:", endNodeName);
    let nodes = globalNodes;
    let links = globalLinks;
    console.log("NODES:", nodes);
    console.log("LINKS:", links);

    let eventDescriptions = [];

    function reconstructPath(cameFrom, currentNodeName) {
        const totalPath = [];
        let currentKey = currentNodeName;
        while (cameFrom.has(currentKey)) {
            const record = cameFrom.get(currentKey);
            totalPath.unshift(currentKey);
            totalPath.unshift(Number(record.linkId));
            currentKey = record.node.properties.name;
        }
        totalPath.unshift(currentKey);
        const nodePath = totalPath.filter(item => isNaN(item));
        eventDescriptions.push(`Reconstructed path to node '${currentKey}': ${nodePath.join(' -> ')}`);
        return totalPath;
    }

    function bellmanFord(nodes, links, startNodeName, endNodeName) {
        const cameFrom = new Map();
        const cost = new Map(nodes.map(node => [node.properties.name, Infinity]));

        const startNode = nodes.find(node => node.properties.name === startNodeName);
        const endNode = nodes.find(node => node.properties.name === endNodeName);

        if (!startNode || !endNode) {
            eventDescriptions.push("Failed to find start or end node.");
            return "Failed to find a path";
        }

        cost.set(startNode.properties.name, 0);
        eventDescriptions.push(`Starting from node '${startNodeName}', setting its cost to 0.`);

        let finalPath = [];
        let costsAtEachStep = [];
        let sourcesAtEachStep = [];

        for (let i = 0; i < nodes.length - 1; i++) {
            eventDescriptions.push(`Iteration ${i + 1}: Relaxing all edges.`);
            const currentStep = [];
            const unhighlightStep = [];
            const currentCosts = new Map(cost);
            const currentSources = [];

            let updated = false;

            for (const link of links) {
                const sourceNode = nodes.find(node => node.properties.name === link.source.properties.name);
                const targetNode = nodes.find(node => node.properties.name === link.target.properties.name);
                const newCost = cost.get(sourceNode.properties.name) + link.properties.distance;

                currentStep.push(sourceNode.properties.name);
                currentStep.push(Number(link.id));
                currentStep.push(targetNode.properties.name);
                console.log("--------" + sourceNode.properties.name + " " + targetNode.properties.name + "------");

                eventDescriptions.push(`Checking edge from '${sourceNode.properties.name}' to '${targetNode.properties.name}' with distance ${link.properties.distance}.`);
                if (newCost < cost.get(targetNode.properties.name)) {
                    eventDescriptions.push(`<strong>Relaxation</strong>: Updating node '${targetNode.properties.name}' since new cost ${newCost} is less than current cost ${cost.get(targetNode.properties.name)}.`);
                    cost.set(targetNode.properties.name, newCost);
                    cameFrom.set(targetNode.properties.name, { node: sourceNode, linkId: link.id });
                    currentSources.push([sourceNode.properties.name, targetNode.properties.name]);
                    eventDescriptions.push(`Found a cheaper path to '${targetNode.properties.name}'. Updated cost to ${newCost}.`);
                    updated = true;
                } else {
                    eventDescriptions.push(`No update required for node '${targetNode.properties.name}'. Current cost is lower.`);
                }

                unhighlightStep.push(Number(link.id), targetNode.properties.name);
            }

            currentStep.push(unhighlightStep);
            finalPath.push(currentStep);
            costsAtEachStep.push(currentCosts);
            sourcesAtEachStep.push(currentSources);

            if (!updated) {
                eventDescriptions.push(`No updates in iteration ${i + 1}. Algorithm can stop early.`);
                break;
            }
        }

        for (const link of links) {
            const sourceNode = nodes.find(node => node.properties.name === link.source.properties.name);
            const targetNode = nodes.find(node => node.properties.name === link.target.properties.name);
            const newCost = cost.get(sourceNode.properties.name) + link.properties.distance;

            eventDescriptions.push(`Checking for negative-weight cycles involving edge from '${sourceNode.properties.name}' to '${targetNode.properties.name}'.`);
            if (newCost < cost.get(targetNode.properties.name)) {
                eventDescriptions.push("Graph contains a negative-weight cycle.");
                return "Graph contains a negative-weight cycle";
            }
        }

        const path = reconstructPath(cameFrom, endNode.properties.name);
        if (path.length <= 1) {
            eventDescriptions.push("No path found from the start node to the end node.");
            return "No path found";
        }

        return { finalPath, costsAtEachStep, sourcesAtEachStep, fullPath: path };
    }

    let result = bellmanFord(nodes, links, startNodeName, endNodeName);

    if (result === "Failed to find a path") {
        showDescButton("Bellman-Ford", result, eventDescriptions);
        showErrorModal(`Failed to find a path from the start node: [${startNodeName}] to end node: [${endNodeName}]`);
    } else if (result === "Graph contains a negative-weight cycle") {
        showDescButton("Bellman-Ford", result, eventDescriptions);
        showErrorModal(`The graph contains a negative-weight cycle.`);
    } else if (result === "No path found") {
        showDescButton("Bellman-Ford", result, eventDescriptions);
        showErrorModal(`No path found from the start node: [${startNodeName}] to end node: [${endNodeName}]`);
    } else {
        let { finalPath, costsAtEachStep, sourcesAtEachStep, fullPath } = result;
        console.log("PATH => ", finalPath);
        console.log("COSTS AT EACH STEP => ", costsAtEachStep);
        console.log("SOURCES AT EACH STEP => ", sourcesAtEachStep);
        console.log("FULL PATH => ", fullPath);
        let algorithm = ["Bellman-Ford", finalPath, costsAtEachStep, sourcesAtEachStep, fullPath];
        showDescButton("Bellman-Ford", finalPath, eventDescriptions);
        updateGraph(globalNodes, globalLinks, algorithm);
    }
}

async function bellmanFordAlgorithmAllPaths(startNodeName) {
    console.log(startNodeName);
    let nodes = globalNodes;
    let links = globalLinks;
    console.log("HERE ARE THE NODES.", nodes);
    console.log(links);

    let eventDescriptions = [];

    if (links.length === 0) {
        eventDescriptions.push("The graph has no edges. Bellman-Ford algorithm cannot be applied.");
        showDescButton("Bellman-Ford All Paths", "Graph has no edges", eventDescriptions);
        showErrorModal("The graph has no edges. Bellman-Ford algorithm cannot be applied.");
        return;
    }

    function reconstructPath(cameFrom, currentNodeName) {
        const totalPath = [];
        let currentKey = currentNodeName;
        while (cameFrom.has(currentKey)) {
            const record = cameFrom.get(currentKey);
            totalPath.unshift(currentKey);
            totalPath.unshift(Number(record.linkId)); 
            currentKey = record.node.properties.name; 
        }
        totalPath.unshift(currentKey); 
        const nodePath = totalPath.filter(item => isNaN(item)); 
        eventDescriptions.push(`Reconstructed path to node '${currentNodeName}': ${nodePath.join(' -> ')}`);
        eventDescriptions.push(`--------------`);
        console.log(`Reconstructed Path: ${nodePath.join(' -> ')}`); 
        return totalPath; 
    }
    

    function bellmanFord(nodes, links, startNodeName) {
        const cameFrom = new Map();
        const cost = new Map(nodes.map(node => [node.properties.name, Infinity]));
        const allPaths = new Map();

        const startNode = nodes.find(node => node.properties.name === startNodeName);

        if (!startNode) {
            eventDescriptions.push("Failed to find the start node.");
            return "Failed to find a path";
        }

        cost.set(startNode.properties.name, 0);
        eventDescriptions.push(`Start node '${startNodeName}' initialized with cost 0.`);

        const costsAtEachStep = [];

        for (let i = 0; i < nodes.length - 1; i++) {
            eventDescriptions.push(`Iteration ${i + 1} of edge relaxation started.`);
            for (const link of links) {
                const sourceNode = nodes.find(node => node.properties.name === link.source.properties.name);
                const targetNode = nodes.find(node => node.properties.name === link.target.properties.name);
                const newCost = cost.get(sourceNode.properties.name) + link.properties.distance;

                eventDescriptions.push(`Checking link from '${sourceNode.properties.name}' to '${targetNode.properties.name}' with distance ${link.properties.distance}.`);
                if (newCost < cost.get(targetNode.properties.name)) {
                    eventDescriptions.push(`<strong>Relaxation</strong>: Updating node '${targetNode.properties.name}' since new cost ${newCost} is less than current cost ${cost.get(targetNode.properties.name)}.`);
                    cost.set(targetNode.properties.name, newCost);
                    cameFrom.set(targetNode.properties.name, { node: sourceNode, linkId: link.id });
                    eventDescriptions.push(`Updated cost for node '${targetNode.properties.name}' to ${newCost}. That link is part of the shortest path.`);
                } else {
                    eventDescriptions.push(`No update required for node '${targetNode.properties.name}'. Current cost is lower.`);
                }
            }
            costsAtEachStep.push(new Map(cost)); 
        }

        for (const link of links) {
            const sourceNode = nodes.find(node => node.properties.name === link.source.properties.name);
            const targetNode = nodes.find(node => node.properties.name === link.target.properties.name);
            const newCost = cost.get(sourceNode.properties.name) + link.properties.distance;

            eventDescriptions.push(`Checking for negative-weight cycle on link from '${sourceNode.properties.name}' to '${targetNode.properties.name}'.`);
            if (newCost < cost.get(targetNode.properties.name)) {
                eventDescriptions.push("Graph contains a negative-weight cycle.");
                return "Graph contains a negative-weight cycle";
            } else {
                eventDescriptions.push(`No negative-weight cycle detected on link from '${sourceNode.properties.name}' to '${targetNode.properties.name}'.`);
            }
        }

        nodes.forEach(node => {
            const path = reconstructPath(cameFrom, node.properties.name);
            if (path.length > 1) {
                const nodePath = path.filter(item => isNaN(item)); 
                allPaths.set(node.properties.name, path); 
                eventDescriptions.push(`Path to node '${node.properties.name}': ${nodePath.join(' -> ')}`);
            }
        });

        return {
            paths: Array.from(allPaths.values()),
            costsAtEachStep: costsAtEachStep.map(costMap => Array.from(costMap.entries()))
        };
    }

    let result = bellmanFord(nodes, links, startNodeName);

    if (result === "Failed to find a path") {
        showDescButton("Bellman-Ford All Paths", result, eventDescriptions);
        showErrorModal(`Failed to find a path from the start node: [${startNodeName}]`);
    } else if (result === "Graph contains a negative-weight cycle") {
        showDescButton("Bellman-Ford All Paths", result, eventDescriptions);
        showErrorModal(`The graph contains a negative-weight cycle.`);
    } else {
        console.log("PATHS => ", result.paths);
        console.log("COSTS AT EACH STEP => ", result.costsAtEachStep);
        let algorithm = ["Bellman-Ford All Paths", result.paths, result.costsAtEachStep];
        showDescButton("Bellman-Ford All Paths", result.paths, eventDescriptions);
        updateGraph(globalNodes, globalLinks, algorithm);
    }
}
