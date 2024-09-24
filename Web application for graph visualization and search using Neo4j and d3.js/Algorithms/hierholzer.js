function validateNodeSelectionHierholzer() {

}
function populateNodeDropdownsHierholzer() {
    validateNodeSelectionHierholzer();
}
document.getElementById('chooseNodesHierholzerExplainAlg').addEventListener('click', function() {
    document.getElementById('whatIsHierholzer').style.display = 'flex';
});

document.getElementById('whatIsHierholzerClose').addEventListener('click', function() {
    document.getElementById('whatIsHierholzer').style.display = 'none';
});

document.addEventListener("DOMContentLoaded", function() {
    const hierholzerToggle = document.getElementById('hierholzerToggle');
    const leftLabel = document.querySelector('.toggle-container .toggle-label-left3');
    const rightLabel = document.querySelector('.toggle-container .toggle-label-right3');
    const message = document.getElementById('chooseNodesHierholzerMessage');

    function handleToggleChange() {
        if (hierholzerToggle.checked) {
            leftLabel.style.color = 'black';
            rightLabel.style.color = 'hsl(318, 74%, 38%)';
            rightLabel.style.fontWeight = 'bold';
            message.innerHTML = '<strong>Eulerian Cycle selected.</strong>';
        } else {
            rightLabel.style.color = 'black';
            rightLabel.style.fontWeight = 'normal';
            leftLabel.style.color = '#064c9c';
            message.innerHTML = '<strong>Eulerian Path selected.</strong>';
        }
    }

    handleToggleChange();

    hierholzerToggle.addEventListener('change', handleToggleChange);
});
document.getElementById('chooseNodesHierholzerConfirm').addEventListener('click', function() {
    const hierholzerToggle = document.getElementById('hierholzerToggle').checked;

    document.getElementById('chooseNodesHierholzer').style.display = 'none';
    if (hierholzerToggle) {
        console.log("Hierholzer Cycle selected");
        HierholzerCycle(globalNodes, globalLinks); 
    } else {
        console.log("Hierholzer Path selected");
        hierholzerPath(globalNodes, globalLinks); 
    }
});

document.getElementById('chooseNodesHierholzerCancel').addEventListener('click', function() {
    document.getElementById('chooseNodesHierholzer').style.display = 'none';
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    algorithmDropdown.value = ''; 
    document.getElementById('chooseAlgorithmModal').style.display = 'flex';
});

function HierholzerCycle(nodes, edges) {
    let eventDescriptions = [];
    const modifiedEdges = edges.map(edge => ({
        id: Number(edge.id),
        source: edge.startNode,
        target: edge.endNode,
        used: false
    }));

    function findUnusedEdges(nodeId) {
        return modifiedEdges.filter(edge => (
            (edge.source === nodeId || edge.target === nodeId) && !edge.used
        ));
    }

    function getNodeNameById(nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        return node.properties.name;
    }

    function markEdgeAsUsed(edge) {
        edge.used = true;
        const reverseEdge = modifiedEdges.find(e => e.source === edge.target && e.target === edge.source && !e.used);
        if (reverseEdge) {
            reverseEdge.used = true;
        }
        eventDescriptions.push(`Marked edge between '${getNodeNameById(edge.source)}' and '${getNodeNameById(edge.target)}' as used.`);
    }

    function hasEulerianCycle() {
        if (modifiedEdges.length === 0) {
            eventDescriptions.push(`Graph has no edges. Eulerian cycle not possible.`);
            return false;
        }

        const degreeMap = new Map();
        modifiedEdges.forEach(edge => {
            degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
            degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
        });

        for (let degree of degreeMap.values()) {
            if (degree % 2 !== 0) {
                eventDescriptions.push(`Node with odd degree found. Eulerian cycle not possible.`);
                return false;
            }
        }

        const visited = new Set();
        function dfs(nodeId) {
            visited.add(nodeId);
            findUnusedEdges(nodeId).forEach(edge => {
                const nextNode = edge.source === nodeId ? edge.target : edge.source;
                if (!visited.has(nextNode)) dfs(nextNode);
            });
        }

        const startNode = Array.from(degreeMap.keys()).find(nodeId => degreeMap.get(nodeId) > 0);
        if (startNode) {
            dfs(startNode);
            for (let nodeId of degreeMap.keys()) {
                if (degreeMap.get(nodeId) > 0 && !visited.has(nodeId)) {
                    eventDescriptions.push(`Graph is not connected. Eulerian cycle not possible.`);
                    return false;
                }
            }
        }

        eventDescriptions.push(`Graph has all vertices with even degrees and is connected.`);
        return true;
    }

    if (!hasEulerianCycle()) {
        showDescButton("Hierholzer", "Graph does not contain an Eulerian cycle.", eventDescriptions);
        showErrorModal(`Graph does not contain an Eulerian cycle.`);
        return;
    }

    const startNode = nodes[0].id;
    const stack = [startNode];
    const eulerianCycle = [];
    const pathEdges = [];

    eventDescriptions.push(`Starting Hierholzer's algorithm from node '${getNodeNameById(startNode)}'.`);

    while (stack.length > 0) {
        const currentNode = stack[stack.length - 1];
        let unusedEdges = findUnusedEdges(currentNode);

        if (unusedEdges.length > 0) {
            const edge = unusedEdges[0];
            markEdgeAsUsed(edge);
            const nextNode = edge.source === currentNode ? edge.target : edge.source;
            stack.push(nextNode);
            pathEdges.push({ from: currentNode, to: nextNode, id: edge.id });
            eventDescriptions.push(`Traversing edge from '${getNodeNameById(currentNode)}' to '${getNodeNameById(nextNode)}'.`);
        } else {
            eulerianCycle.push(stack.pop());
        }
    }

    eulerianCycle.reverse();

    const formattedCycle = [];
    for (let i = 0; i < eulerianCycle.length - 1; i++) {
        const fromNode = eulerianCycle[i];
        const toNode = eulerianCycle[i + 1];
        const edge = pathEdges.find(e => (e.from === fromNode && e.to === toNode) || (e.from === toNode && e.to === fromNode));
        formattedCycle.push(getNodeNameById(fromNode));
        if (edge) {
            formattedCycle.push(edge.id);
        }
    }
    formattedCycle.push(getNodeNameById(eulerianCycle[eulerianCycle.length - 1]));

    console.log("eulerianCycle ", eulerianCycle.map(getNodeNameById));
    console.log("pathEdges", pathEdges);
    console.log("formattedCycle", formattedCycle);

    if (pathEdges.length === edges.length) {
        eventDescriptions.push("Successfully constructed an Eulerian cycle.");
        let algorithm = ["Hierholzer", formattedCycle];
        showDescButton("Hierholzer", formattedCycle, eventDescriptions);
        updateGraph(nodes, edges, algorithm);
    } else {
        eventDescriptions.push("Graph does not contain an Eulerian cycle.");
        showDescButton("Hierholzer", "Graph does not contain an Eulerian cycle.", eventDescriptions);
        showErrorModal(`Graph does not contain an Eulerian cycle.`);
    }
}

function hierholzerPath(nodes, edges) {
    let eventDescriptions = [];
    const modifiedEdges = edges.map(edge => ({
        id: Number(edge.id),
        source: edge.startNode,
        target: edge.endNode,
        used: false
    }));

    function findUnusedEdges(nodeId) {
        return modifiedEdges.filter(edge => (
            (edge.source === nodeId || edge.target === nodeId) && !edge.used
        ));
    }

    function getNodeNameById(nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        return node.properties.name;
    }

    function markEdgeAsUsed(edge) {
        edge.used = true;
        const reverseEdge = modifiedEdges.find(e => e.source === edge.target && e.target === edge.source && !e.used);
        if (reverseEdge) {
            reverseEdge.used = true;
        }
        eventDescriptions.push(`Marked edge between '${getNodeNameById(edge.source)}' and '${getNodeNameById(edge.target)}' as used.`);
    }

    function hasEulerianPath() {
        if (modifiedEdges.length === 0) {
            eventDescriptions.push(`Graph has no edges. Eulerian path not possible.`);
            return false;
        }

        const degreeMap = new Map();
        modifiedEdges.forEach(edge => {
            degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
            degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
        });

        let oddDegreeCount = 0;
        let startNode = null;
        for (let [nodeId, degree] of degreeMap.entries()) {
            if (degree % 2 !== 0) {
                oddDegreeCount++;
                if (startNode === null) {
                    startNode = nodeId;
                }
            }
            if (startNode === null || degree > 0) {
                startNode = nodeId;
            }
        }

        eventDescriptions.push(`Graph has ${oddDegreeCount} vertices with odd degrees.`);
        if (oddDegreeCount !== 0 && oddDegreeCount !== 2) {
            eventDescriptions.push(`Eulerian path not possible due to incorrect number of vertices with odd degrees.`);
            return false;
        }

        const visited = new Set();
        function dfs(nodeId) {
            visited.add(nodeId);
            findUnusedEdges(nodeId).forEach(edge => {
                const nextNode = edge.source === nodeId ? edge.target : edge.source;
                if (!visited.has(nextNode)) {
                    dfs(nextNode);
                }
            });
        }

        if (startNode) {
            dfs(startNode);
            for (let nodeId of degreeMap.keys()) {
                if (degreeMap.get(nodeId) > 0 && !visited.has(nodeId)) {
                    eventDescriptions.push(`Graph is not connected. Eulerian path not possible.`);
                    return false;
                }
            }
        }

        eventDescriptions.push(`Graph is connected and all vertices with non-zero degree are visited.`);
        return true;
    }

    if (!hasEulerianPath()) {
        showDescButton("Hierholzer", "Graph does not contain an Eulerian path.", eventDescriptions);
        showErrorModal(`Graph does not contain an Eulerian path.`);
        return;
    }

    const oddDegreeVertices = [];
    const degreeMap = new Map();
    modifiedEdges.forEach(edge => {
        degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
        degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
    });
    degreeMap.forEach((degree, nodeId) => {
        if (degree % 2 !== 0) {
            oddDegreeVertices.push(nodeId);
        }
    });

    let startNode;
    if (oddDegreeVertices.length === 2) {
        startNode = oddDegreeVertices[0]; 
    } else {
        startNode = nodes[0].id; 
    }
    
    const stack = [startNode];
    const eulerianPath = [];
    const pathEdges = [];

    eventDescriptions.push(`Starting Hierholzer's algorithm from node '${getNodeNameById(startNode)}'.`);

    while (stack.length > 0) {
        const currentNode = stack[stack.length - 1];
        let unusedEdges = findUnusedEdges(currentNode);

        if (unusedEdges.length > 0) {
            const edge = unusedEdges[0];
            markEdgeAsUsed(edge);
            const nextNode = (edge.source === currentNode) ? edge.target : edge.source;
            stack.push(nextNode);

            pathEdges.push({ from: currentNode, to: nextNode, id: edge.id });
            eventDescriptions.push(`Traversing edge from '${getNodeNameById(currentNode)}' to '${getNodeNameById(nextNode)}'.`);
        } else {
            eulerianPath.push(stack.pop());
        }
    }

    eulerianPath.reverse();
    pathEdges.reverse();

    const formattedPath = [];
    for (let i = 0; i < eulerianPath.length - 1; i++) {
        const fromNode = eulerianPath[i];
        const toNode = eulerianPath[i + 1];
        const edge = pathEdges.find(e => (e.from === fromNode && e.to === toNode) || (e.from === toNode && e.to === fromNode));
        formattedPath.push(getNodeNameById(fromNode));
        if (edge) {
            formattedPath.push(edge.id);
        }
    }
    formattedPath.push(getNodeNameById(eulerianPath[eulerianPath.length - 1]));

    console.log("eulerianPath ", eulerianPath.map(getNodeNameById));
    console.log("pathEdges", pathEdges);
    console.log("formattedPath", formattedPath);

    if (pathEdges.length === modifiedEdges.length) {
        eventDescriptions.push("Successfully constructed an Eulerian path.");
        let algorithm = ["Hierholzer", formattedPath];
        showDescButton("Hierholzer", formattedPath, eventDescriptions);
        updateGraph(nodes, edges, algorithm);
    } else {
        eventDescriptions.push("Graph does not contain an Eulerian path.");
        showDescButton("Hierholzer", "Graph does not contain an Eulerian path.", eventDescriptions);
        showErrorModal(`Graph does not contain an Eulerian path.`);
    }
}
