function validateNodeSelectionKruskal() {
}
function populateNodeDropdownsKruskal() {
    validateNodeSelectionKruskal();
}
document.getElementById('chooseNodesKruskalExplainAlg').addEventListener('click', function() {
    document.getElementById('whatIsKruskal').style.display = 'flex';
});

document.getElementById('whatIsKruskalClose').addEventListener('click', function() {
    document.getElementById('whatIsKruskal').style.display = 'none';
});

document.getElementById('chooseNodesKruskalConfirm').addEventListener('click', function() {
    document.getElementById('chooseNodesKruskal').style.display = 'none';
    Kruskal(globalNodes, globalLinks); 
});

document.getElementById('chooseNodesKruskalCancel').addEventListener('click', function() {
    document.getElementById('chooseNodesKruskal').style.display = 'none';
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    algorithmDropdown.value = ''; 
    document.getElementById('chooseAlgorithmModal').style.display = 'flex';
});

function Kruskal(nodes, links) {
    console.log("Nodes and Links for Kruskal's Algorithm:");
    console.log(nodes);
    console.log(links);

    let eventDescriptions = [];

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
            }
        }

        printout() {
            console.log("Printout: ", this.parent);
        }
    }

    function kruskalAlgorithm(nodes, links) {
        const edges = links.map(link => ({
            id: link.id,
            source: link.source.properties.name,
            target: link.target.properties.name,
            weight: link.properties.distance
        })).sort((a, b) => a.weight - b.weight);

        const nodeNames = nodes.map(node => node.properties.name);

        const uf = new UnionFind(nodeNames);
        const mst = [];

        eventDescriptions.push("Starting Kruskal's algorithm.");
        eventDescriptions.push("Step 1: Sort all the edges in increasing order of their weight.");

        edges.forEach(edge => {
            eventDescriptions.push(`Edge ${edge.source} -> ${edge.target} (${edge.weight})`);
        });

        edges.forEach(edge => {
            eventDescriptions.push(`Considering edge connecting ${edge.source} and ${edge.target} with weight ${edge.weight}.`);
            if (uf.find(edge.source) !== uf.find(edge.target)) {
                eventDescriptions.push(`Step 2: Pick the smallest edge. No cycle detected by adding edge ${edge.source} -> ${edge.target}.`);
                uf.union(edge.source, edge.target);
                mst.push({ id: edge.id, source: edge.source, target: edge.target });
                eventDescriptions.push(`Added edge from ${edge.source} to ${edge.target} to the MST.`);
            } else {
                eventDescriptions.push(`Step 2: Pick the smallest edge. Cycle detected by adding edge ${edge.source} -> ${edge.target}. Skipping this edge.`);
            }
        });

        eventDescriptions.push("Step 3: Repeat 2nd step until there are ([Number of Nodes]-1) edges in the spanning tree or no more edges to consider.");

        if (mst.length === nodes.length - 1) {
            eventDescriptions.push("Successfully formed MST with the given graph. All nodes are connected.");
            return mst;
        } else {
            eventDescriptions.push("MST cannot be formed with the given graph. The graph may not be connected.");
            return "MST cannot be formed with the given graph.";
        }
    }

    let mstResult = kruskalAlgorithm(nodes, links);

    if (mstResult === "MST cannot be formed with the given graph.") {
        showDescButton("Kruskal", "MST cannot be formed with the given graph.", eventDescriptions);
        showErrorModal(`MST cannot be formed with the given graph.`);
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

        console.log("Minimum Spanning Tree:", formattedMST);
        let algorithm = ["Kruskal", formattedMST];
        showDescButton("Kruskal", mstResult, eventDescriptions);
        updateGraph(nodes, links, algorithm);
    }
}



