function validateNodeSelectionPrim() {
}
function populateNodeDropdownsPrim() {
    validateNodeSelectionPrim();
}
document.getElementById('chooseNodesPrimExplainAlg').addEventListener('click', function() {
    document.getElementById('whatIsPrim').style.display = 'flex';
});

document.getElementById('whatIsPrimClose').addEventListener('click', function() {
    document.getElementById('whatIsPrim').style.display = 'none';
});

document.getElementById('chooseNodesPrimConfirm').addEventListener('click', function() {
    document.getElementById('chooseNodesPrim').style.display = 'none';
    Prim(globalNodes, globalLinks); 
});

document.getElementById('chooseNodesPrimCancel').addEventListener('click', function() {
    document.getElementById('chooseNodesPrim').style.display = 'none';
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    algorithmDropdown.value = ''; 
    document.getElementById('chooseAlgorithmModal').style.display = 'flex';
});

function Prim(nodes, links) {
    console.log("Nodes and Links for Prim's Algorithm:");
    console.log(nodes);
    console.log(links);

    let eventDescriptions = [];

    class PriorityQueue {
        constructor() {
            this.queue = [];
        }

        enqueue(element) {
            this.queue.push(element);
            this.queue.sort((a, b) => a.weight - b.weight);
            eventDescriptions.push(`Enqueued edge from ${element.source} to ${element.target} with weight ${element.weight}.`);
        }

        dequeue() {
            const element = this.queue.shift();
            eventDescriptions.push(`Dequeued edge from ${element.source} to ${element.target} with weight ${element.weight}.`);
            return element;
        }

        isEmpty() {
            return this.queue.length === 0;
        }
    }

    function primAlgorithm(nodes, links) {
        const edges = links.map(link => ({
            id: link.id,
            source: link.source.properties.name,
            target: link.target.properties.name,
            weight: link.properties.distance
        }));

        const nodeNames = nodes.map(node => node.properties.name);
        const adjList = new Map();
        nodeNames.forEach(node => adjList.set(node, []));
        edges.forEach(edge => {
            adjList.get(edge.source).push(edge);
            adjList.get(edge.target).push({ ...edge, source: edge.target, target: edge.source });
        });

        let mst = [];
        let visited = new Set();
        let pq = new PriorityQueue();

        let startNode = nodeNames[0];
        visited.add(startNode);
        eventDescriptions.push(`Starting Prim's algorithm at node '${startNode}'.`);
        eventDescriptions.push("Step 1: Initialize the MST with the start node and enqueue all its edges.");

        if(startNode){
            adjList.get(startNode).forEach(edge => pq.enqueue(edge));}
        else{
            eventDescriptions.push(`MST cannot be formed with the given graph. The graph may not be connected.`);
            return "MST cannot be formed with the given graph.";
        }

        while (!pq.isEmpty() && mst.length < nodes.length - 1) {
            const edge = pq.dequeue();
            if (!visited.has(edge.target)) {
                visited.add(edge.target);
                mst.push({ id: edge.id, source: edge.source, target: edge.target });
                eventDescriptions.push(`Step 2: Dequeue the smallest edge and add it to the MST. Added edge from ${edge.source} to ${edge.target} to the MST.`);
                eventDescriptions.push(`Enqueued all edges from the newly added node '${edge.target}' that do not form a cycle.`);

                adjList.get(edge.target).forEach(nextEdge => {
                    if (!visited.has(nextEdge.target)) {
                        pq.enqueue(nextEdge);
                    }
                });
            }
        }

        if (mst.length === nodes.length - 1) {
            eventDescriptions.push("Successfully formed an MST with the given graph. All nodes are connected.");
            return mst;
        } else {
            eventDescriptions.push("MST cannot be formed with the given graph. The graph may not be connected.");
            return "MST cannot be formed with the given graph.";
        }
    }

    let mstResult = primAlgorithm(nodes, links);
    console.log("MST", mstResult);
    if (mstResult === "MST cannot be formed with the given graph.") {
        showDescButton("Prim", "MST cannot be formed with the given graph.", eventDescriptions);
        showErrorModal(`MST cannot be formed with the given nodes and links.`);
    } else {
        const nodeNamesSet = new Set();
        const formattedMST = mstResult.reduce((acc, edge) => {
            acc.push(Number(edge.id));
            if (!nodeNamesSet.has(edge.source)) {
                acc.push(edge.source);
                nodeNamesSet.add(edge.source);
            }
            if (!nodeNamesSet.has(edge.target)) {
                acc.push(edge.target);
                nodeNamesSet.add(edge.target);
            }
            return acc;
        }, []);

        function switchPlcs(arr) {
            if (arr.length > 1) {
                let temp = arr[0];
                arr[0] = arr[1];
                arr[1] = temp;
            }
            return arr;
        }

        switchPlcs(formattedMST);
        let algorithm = ["Prim", formattedMST, true];
        showDescButton("Prim", mstResult, eventDescriptions);
        updateGraph(nodes, links, algorithm);
    }
}

