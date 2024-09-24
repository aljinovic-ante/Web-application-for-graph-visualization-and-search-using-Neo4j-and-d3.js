function validateNodeSelectionFluery() {
}
function populateNodeDropdownsFluery() {
    validateNodeSelectionFluery();
}
document.getElementById('chooseNodesFleuryExplainAlg').addEventListener('click', function() {
    document.getElementById('whatIsFleury').style.display = 'flex';
});

document.getElementById('whatIsFleuryClose').addEventListener('click', function() {
    document.getElementById('whatIsFleury').style.display = 'none';
});
document.addEventListener("DOMContentLoaded", function() {
    const fleuryToggle = document.getElementById('fleuryToggle');
    const leftLabel = document.querySelector('.toggle-container .toggle-label-left5');
    const rightLabel = document.querySelector('.toggle-container .toggle-label-right5');
    const message = document.getElementById('chooseNodesFlueryMessage');

    function handleToggleChange() {
        if (fleuryToggle.checked) {
            leftLabel.style.color = 'black';
            rightLabel.style.color = 'hsl(318, 74%, 38%)';
            rightLabel.style.fontWeight = 'bold';
            message.innerHTML = '<strong>Eulerian Path selected.</strong>';
        } else {
            rightLabel.style.color = 'black';
            rightLabel.style.fontWeight = 'normal';
            leftLabel.style.color = '#064c9c';
            message.innerHTML = '<strong>Eulerian Cycle selected.</strong>';
        }
    }

    handleToggleChange();

    fleuryToggle.addEventListener('change', handleToggleChange);
});

document.getElementById('chooseNodesFlueryConfirm').addEventListener('click', function() {
    const fleuryToggle = document.getElementById('fleuryToggle').checked;

    document.getElementById('chooseNodesFluery').style.display = 'none';
    if (fleuryToggle) {
        console.log("fl pa");
        FleuryPath(globalNodes, globalLinks); 
    } else {
        console.log("fl cy");
        FleuryCycle(globalNodes, globalLinks); 
    }
});

document.getElementById('chooseNodesFlueryCancel').addEventListener('click', function() {
    document.getElementById('chooseNodesFluery').style.display = 'none';
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    algorithmDropdown.value = ''; 
    document.getElementById('chooseAlgorithmModal').style.display = 'flex';
});



function FleuryCycle(nodes, links) {
    let eventDescriptions = [];

    class Graph {
        constructor(nodes, links) {
            this.nodes = nodes.reduce((map, node) => {
                map[node.id] = node;
                return map;
            }, {});
            this.adjacencyList = nodes.reduce((map, node) => {
                map[node.id] = [];
                return map;
            }, {});

            this.links = links.reduce((map, link) => {
                map[link.id] = link;
                return map;
            }, {});

            links.forEach(link => {
                this.adjacencyList[link.startNode].push({ node: link.endNode, linkId: link.id });
                this.adjacencyList[link.endNode].push({ node: link.startNode, linkId: link.id });
            });
        }

        isConnected() {
            const visited = new Set();

            const dfs = (node) => {
                visited.add(node);
                this.adjacencyList[node].forEach(edge => {
                    if (!visited.has(edge.node)) {
                        dfs(edge.node);
                    }
                });
            };

            const startNode = Object.keys(this.adjacencyList).find(node => this.adjacencyList[node].length > 0);

            if (!startNode) {
                return true;
            }

            dfs(startNode);

            return Object.keys(this.adjacencyList).every(node =>
                this.adjacencyList[node].length === 0 || visited.has(node)
            );
        }

        hasEvenDegrees() {
            return Object.keys(this.adjacencyList).every(node =>
                this.adjacencyList[node].length % 2 === 0
            );
        }

        isEulerian() {
            const isConnected = this.isConnected();
            const hasEvenDegrees = this.hasEvenDegrees();
            eventDescriptions.push(`Graph is connected: ${isConnected}.`);
            eventDescriptions.push(`All nodes have even degrees: ${hasEvenDegrees}.`);
            return isConnected && hasEvenDegrees;
        }

        removeEdge(startNode, endNode, linkId) {
            this.adjacencyList[startNode] = this.adjacencyList[startNode].filter(edge => edge.node !== endNode || edge.linkId !== linkId);
            this.adjacencyList[endNode] = this.adjacencyList[endNode].filter(edge => edge.node !== startNode || edge.linkId !== linkId);
            eventDescriptions.push(`Removed edge between '${this.nodes[startNode].properties.name}' and '${this.nodes[endNode].properties.name}'.`);
        }

        isBridge(startNode, endNode, linkId) {
            eventDescriptions.push(`Check if edge between '${this.nodes[startNode].properties.name}' and '${this.nodes[endNode].properties.name}' is a bridge.`);
            const originalCount = this.dfsCount(startNode);
            this.removeEdge(startNode, endNode, linkId);
            const newCount = this.dfsCount(startNode);
            this.addEdge(startNode, endNode, linkId);
            eventDescriptions.push(`Edge between '${this.nodes[startNode].properties.name}' and '${this.nodes[endNode].properties.name}' is a bridge: ${newCount < originalCount}.`);
            return newCount < originalCount;
        }

        dfsCount(node) {
            const visited = new Set();
            const stack = [node];
            while (stack.length > 0) {
                const current = stack.pop();
                if (!visited.has(current)) {
                    visited.add(current);
                    this.adjacencyList[current].forEach(edge => {
                        if (!visited.has(edge.node)) {
                            stack.push(edge.node);
                        }
                    });
                }
            }
            return visited.size;
        }

        addEdge(startNode, endNode, linkId) {
            this.adjacencyList[startNode].push({ node: endNode, linkId });
            this.adjacencyList[endNode].push({ node: startNode, linkId });
            eventDescriptions.push(`Added edge between '${this.nodes[startNode].properties.name}' and '${this.nodes[endNode].properties.name}'.`);
        }

        findEulerianCycle() {
            let currentNode = Object.keys(this.adjacencyList).find(node => this.adjacencyList[node].length > 0);
            const cycle = [];
            const startNode = currentNode;
            if (!currentNode) {
                eventDescriptions.push("Graph does not contain an Eulerian path.");
                showDescButton("Fluery", "Graph does not contain an Eulerian path", eventDescriptions);       
                showErrorModal("Graph does not contain an Eulerian path");
                return;
            }
            while (Object.keys(this.links).length > 0) {
                const edges = this.adjacencyList[currentNode];
                let nextEdge = null;
                for (const edge of edges) {
                    if (!this.isBridge(currentNode, edge.node, edge.linkId)) {
                        nextEdge = edge;
                        break;
                    }
                }
                if (!nextEdge) {
                    nextEdge = edges[0];
                }

                cycle.push(this.nodes[currentNode].properties.name);
                cycle.push(Number(nextEdge.linkId));
                eventDescriptions.push(`Traversing edge from '${this.nodes[currentNode].properties.name}' to '${this.nodes[nextEdge.node].properties.name}'.`);

                this.removeEdge(currentNode, nextEdge.node, nextEdge.linkId);
                delete this.links[nextEdge.linkId];
                currentNode = nextEdge.node;
            }
            cycle.push(this.nodes[currentNode].properties.name);
            if (currentNode !== startNode) {
                eventDescriptions.push("Failed to construct a valid Eulerian cycle.");
                showDescButton("Fluery", "Graph does not contain an Eulerian cycle", eventDescriptions);
                showErrorModal("Failed to construct a valid Eulerian cycle");
                return;
            }
            eventDescriptions.push("Successfully constructed an Eulerian cycle.");
            return cycle;
        }
    }

    const graph = new Graph(nodes, links);

    if (!graph.isEulerian()) {
        eventDescriptions.push("Graph does not contain an Eulerian cycle.");
        showDescButton("Fluery", "Graph does not contain an Eulerian Cycle", eventDescriptions);
        showErrorModal('Graph does not contain an Eulerian cycle.');
    } else {
        let algorithm = ["Fleury", graph.findEulerianCycle()];
        showDescButton("Fleury", algorithm[1], eventDescriptions);
        updateGraph(nodes, links, algorithm);
    }
}

function FleuryPath(nodes, links) {
    let eventDescriptions = [];
    if (nodes.length === 0) {
        eventDescriptions.push("Graph contains no nodes.");
        showDescButton("Fleury", "Graph contains no nodes", eventDescriptions);
        showErrorModal("Graph does not contain an Eulerian path.");
        return false;
    }
    class Graph {
        constructor(nodes, links) {
            this.nodes = nodes.reduce((map, node) => {
                map[node.id] = node;
                return map;
            }, {});
            this.adjacencyList = nodes.reduce((map, node) => {
                map[node.id] = [];
                return map;
            }, {});

            this.links = links.reduce((map, link) => {
                map[link.id] = link;
                return map;
            }, {});

            links.forEach(link => {
                this.adjacencyList[link.startNode].push({ node: link.endNode, linkId: link.id });
                this.adjacencyList[link.endNode].push({ node: link.startNode, linkId: link.id });
            });
        }

        isConnected() {
            const visited = new Set();

            const dfs = (node) => {
                visited.add(node);
                this.adjacencyList[node].forEach(edge => {
                    if (!visited.has(edge.node)) {
                        dfs(edge.node);
                    }
                });
            };

            const startNode = Object.keys(this.adjacencyList).find(node => this.adjacencyList[node].length > 0);

            if (!startNode) {
                return true;
            }

            dfs(startNode);

            return Object.keys(this.adjacencyList).every(node =>
                this.adjacencyList[node].length === 0 || visited.has(node)
            );
        }

        getOddDegreeVertices() {
            return Object.keys(this.adjacencyList).filter(node =>
                this.adjacencyList[node].length % 2 !== 0
            );
        }

        isEulerianPath() {
            const isConnected = this.isConnected();
            const oddDegreeVertices = this.getOddDegreeVertices().length;
            eventDescriptions.push(`Graph is connected: ${isConnected}.`);
            eventDescriptions.push(`Graph has ${oddDegreeVertices} vertices with odd degrees.`);
            return isConnected && oddDegreeVertices <= 2;
        }

        removeEdge(startNode, endNode, linkId) {
            this.adjacencyList[startNode] = this.adjacencyList[startNode].filter(edge => edge.node !== endNode || edge.linkId !== linkId);
            this.adjacencyList[endNode] = this.adjacencyList[endNode].filter(edge => edge.node !== startNode || edge.linkId !== linkId);
            eventDescriptions.push(`Removed edge between '${this.nodes[startNode].properties.name}' and '${this.nodes[endNode].properties.name}'.`);
        }

        isBridge(startNode, endNode, linkId) {
            eventDescriptions.push(`Check if edge between '${this.nodes[startNode].properties.name}' and '${this.nodes[endNode].properties.name}' is a bridge.`);
            const originalCount = this.dfsCount(startNode);
            this.removeEdge(startNode, endNode, linkId);
            const newCount = this.dfsCount(startNode);
            this.addEdge(startNode, endNode, linkId);
            const isBridge = newCount < originalCount;
            eventDescriptions.push(`Edge between '${this.nodes[startNode].properties.name}' and '${this.nodes[endNode].properties.name}' is a bridge: ${isBridge}.`);
            return isBridge;
        }

        dfsCount(node) {
            const visited = new Set();
            const stack = [node];
            while (stack.length > 0) {
                const current = stack.pop();
                if (!visited.has(current)) {
                    visited.add(current);
                    this.adjacencyList[current].forEach(edge => {
                        if (!visited.has(edge.node)) {
                            stack.push(edge.node);
                        }
                    });
                }
            }
            return visited.size;
        }

        addEdge(startNode, endNode, linkId) {
            this.adjacencyList[startNode].push({ node: endNode, linkId });
            this.adjacencyList[endNode].push({ node: startNode, linkId });
            eventDescriptions.push(`Added edge between '${this.nodes[startNode].properties.name}' and '${this.nodes[endNode].properties.name}'.`);
        }

        findEulerianPath() {
            const oddDegreeVertices = this.getOddDegreeVertices();
            let startNode;

            if (oddDegreeVertices.length === 2) {
                startNode = oddDegreeVertices[0];
                eventDescriptions.push(`Starting at odd degree node '${this.nodes[startNode].properties.name}'.`);
            } else {
                startNode = Object.keys(this.adjacencyList).find(node => this.adjacencyList[node].length > 0);
                eventDescriptions.push(`Starting at node '${this.nodes[startNode].properties.name}'.`);
            }

            if (!startNode) {
                eventDescriptions.push("Graph does not contain an Eulerian path.");
                showDescButton("Fleury", "Graph does not contain an Eulerian path", eventDescriptions);
                showErrorModal("Graph does not contain an Eulerian path.");
                return;
            }

            const path = [];

            while (Object.keys(this.links).length > 0) {
                const edges = this.adjacencyList[startNode];
                let nextEdge = null;
                for (const edge of edges) {
                    if (!this.isBridge(startNode, edge.node, edge.linkId)) {
                        nextEdge = edge;
                        break;
                    }
                }
                if (!nextEdge) {
                    nextEdge = edges[0];
                }

                path.push(this.nodes[startNode].properties.name);
                path.push(Number(nextEdge.linkId));
                eventDescriptions.push(`Traversing edge from '${this.nodes[startNode].properties.name}' to '${this.nodes[nextEdge.node].properties.name}'.`);

                this.removeEdge(startNode, nextEdge.node, nextEdge.linkId);
                delete this.links[nextEdge.linkId];
                startNode = nextEdge.node;
            }
            path.push(this.nodes[startNode].properties.name);
            eventDescriptions.push("Successfully constructed an Eulerian path.");
            return path;
        }
    }

    const graph = new Graph(nodes, links);

    if (!graph.isEulerianPath()) {
        eventDescriptions.push("Graph does not contain an Eulerian path.");
        showDescButton("Fleury", "Graph does not contain an Eulerian path", eventDescriptions);
        showErrorModal('Graph does not contain an Eulerian path.');
    } else {
        let algorithm = ["Fleury", graph.findEulerianPath()];
        showDescButton("Fleury", algorithm[1], eventDescriptions);
        updateGraph(globalNodes, globalLinks, algorithm);
    }
}

