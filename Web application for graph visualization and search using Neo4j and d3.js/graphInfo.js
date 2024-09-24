function graphInfo(nodes, links) {
    console.log(nodes);
    console.log(links);
    nodes.sort((a, b) => a.properties.name.localeCompare(b.properties.name));

    // startNodesList
    let nodesInfo = '<strong style="font-size: 30px; color: #000000;">Nodes:</strong> ' +
                '<strong style="font-size: 30px;">' + nodes.length + '</strong>' +
                '<br> [ ';
    for (let i = 0; i < nodes.length; i++) {
        nodesInfo += '<strong style="color: #007bff">';
        nodesInfo += nodes[i].properties.name;
        nodesInfo += '</strong>';
        if (i < nodes.length - 1) {
            nodesInfo += ', ';
        }
    }
    nodesInfo += ' ] <hr>';
    document.getElementById('graphInfoModalDataNodes').innerHTML = nodesInfo;
    // endNodesList
 
    // startLinkList
    const linksInfo = `<strong style="font-size: 30px; color: #000000;">Links:</strong> ` +
                  `<strong style="font-size: 30px;">${links.length}</strong> <br> [ ${links.map(link => {
        const startNode = nodes.find(node => node.id === link.startNode);
        const endNode = nodes.find(node => node.id === link.endNode);
        return `( <strong style="color: #007bff; font-size: 20px;">${startNode.properties.name}</strong> <strong>-></strong> <strong style="color: #007bff; font-size: 20px;">${endNode.properties.name} </strong>) `;
    }).sort((a, b) => a.localeCompare(b)).join(', ')} ]<hr>`;
    
    document.getElementById('graphInfoModalDataLinks').innerHTML = linksInfo;
    // endLinkList

    // startNodeDegreeList
    let nodeDegrees = new Map();
    nodes.forEach(node => nodeDegrees.set(node.id, 0));
    links.forEach(link => {
        nodeDegrees.set(link.startNode, nodeDegrees.get(link.startNode) + 1);
        nodeDegrees.set(link.endNode, nodeDegrees.get(link.endNode) + 1);
    });

    let nodeDegreesInfo = '<strong style="font-size: 30px; color: #000000;">Node Degrees:</strong><br> ';
    nodes.forEach(node => {
        nodeDegreesInfo += `<strong style="color: #007bff; font-size: 20px;">${node.properties.name}</strong> <strong style="font-size: 20px;">(${nodeDegrees.get(node.id)})</strong>, `;
    });
    nodeDegreesInfo = nodeDegreesInfo.slice(0, -2);
    nodeDegreesInfo+=` <br><hr>`
    document.getElementById('graphInfoModalDataNodeDegree').innerHTML = nodeDegreesInfo;
    // endNodeDegreeList

    // startExplainEuler
    document.getElementById('graphInfoModalExplainEulerGraph').innerHTML = `
    <div style="font-size: 22px;">
        <strong>An Eulerian graph</strong> is a graph that contains an Eulerian circuit, a path that visits every link exactly once and returns to the starting node.<br><hr>
        <strong>A graph is Eulerian if:</strong><br>
        <strong>I.</strong> All nodes with non-zero degrees are connected.<br>
        <strong>II.</strong> Every node has an even degree.<br><hr>

        <strong>How this program checks if the Graph is Eulerian:</strong><br>
        <strong>I. Check for Even Degrees:</strong> If any node has an odd degree, the graph is <strong>not</strong> an Eulerian Graph, since every node in an Eulerian graph must have an even degree.<br>
        <strong>II. Connectivity Check:</strong> The function identifies a start node with non-zero degree and performs a depth-first search (DFS) to ensure all vertices with non-zero degrees are connected.<br>
        <strong>III. Result:</strong> If all nodes are connected and have even degrees, the graph <strong>is</strong> Eulerian. Otherwise, it is <strong>not</strong>.
    </div>`;
    // endExplainEuler

    // Start Incidence Matrix
    let sortedNodes = nodes;

    let sortedLinks = links.slice().sort((a, b) => {
        let startA = nodes.find(node => node.id === a.startNode).properties.name;
        let startB = nodes.find(node => node.id === b.startNode).properties.name;
        let endA = nodes.find(node => node.id === a.endNode).properties.name;
        let endB = nodes.find(node => node.id === b.endNode).properties.name;

        if (startA < startB) return -1;
        if (startA > startB) return 1;
        if (endA < endB) return -1;
        if (endA > endB) return 1;
        return 0;
    });

    let matrix = new Array(sortedNodes.length);
    for (let i = 0; i < matrix.length; i++) {
        matrix[i] = new Array(sortedLinks.length).fill(0);
    }

    sortedLinks.forEach((link, column) => {
        const startNodeIndex = sortedNodes.findIndex(node => node.id === link.startNode);
        const endNodeIndex = sortedNodes.findIndex(node => node.id === link.endNode);

        if (startNodeIndex !== -1) { 
            matrix[startNodeIndex][column] = 1;
        }
        if (endNodeIndex !== -1) { 
            matrix[endNodeIndex][column] = 1;
        }
    });

    let incidenceMatrix = '<table border="1"><thead><tr><th>Nodes / Links</th>';
    for (let i = 0; i < sortedLinks.length; i++) {
        const startNode = sortedNodes.find(node => node.id === sortedLinks[i].startNode);
        const endNode = sortedNodes.find(node => node.id === sortedLinks[i].endNode);
        incidenceMatrix += `<th>${startNode.properties.name} -> ${endNode.properties.name}</th>`;
    }
    incidenceMatrix += '</tr></thead><tbody>';

    sortedNodes.forEach((node, rowIndex) => {
        incidenceMatrix += `<tr><td><strong>${node.properties.name}</strong></td>` + matrix[rowIndex].map(value => `<td${value === 1 ? ' style="background-color: lightyellow;"' : ''}>${value}</td>`).join('') + '</tr>';
    });

    incidenceMatrix += '</tbody></table>';

    document.getElementById('graphInfoModalDataIncidenceMatrix').innerHTML = incidenceMatrix;
    // End Incidence Matrix

    // Start Adjacency Matrix
    let adjacencyMatrix = new Array(nodes.length);

    for (let i = 0; i < adjacencyMatrix.length; i++) {
        adjacencyMatrix[i] = new Array(nodes.length).fill(0);
    }

    links.forEach(link => {
        const startNodeIndex = nodes.findIndex(node => node.id === link.startNode);
        const endNodeIndex = nodes.findIndex(node => node.id === link.endNode);

        adjacencyMatrix[startNodeIndex][endNodeIndex] = 1;
        adjacencyMatrix[endNodeIndex][startNodeIndex] = 1; 
    });

    let adjacencyMatrixHTML = '<table border="1" style="width:100%; table-layout: fixed;"><thead><tr><th style="width: 60px;">Nodes</th>';
    nodes.forEach(node => {
        adjacencyMatrixHTML += `<th style="width: 60px;">${node.properties.name}</th>`;
    });
    adjacencyMatrixHTML += '</tr></thead><tbody>';

    nodes.forEach((node, rowIndex) => {
        adjacencyMatrixHTML += `<tr><td style="width: 60px;"><strong>${node.properties.name}</strong></td>` + adjacencyMatrix[rowIndex].map(value => `<td style="width: 60px;${value === 1 ? ' background-color: lightyellow;' : ''}">${value}</td>`).join('') + '</tr>';
    });

    adjacencyMatrixHTML += '</tbody></table>';

    document.getElementById('graphInfoModalDataAdjacencyMatrix').innerHTML = adjacencyMatrixHTML;
    // End Adjacency Matrix

    //startNeighboursList
    let neighborsList = {};

    nodes.forEach(node => {
        neighborsList[node.properties.name] = [];
    });
    
    links.forEach(link => {
        const startNodeName = nodes.find(node => node.id === link.startNode).properties.name;
        const endNodeName = nodes.find(node => node.id === link.endNode).properties.name;
        neighborsList[startNodeName].push(endNodeName);
        neighborsList[endNodeName].push(startNodeName);
    });
    
    let maxDegree = 0;
    let mostConnectedNodes = [];
    
    for (const [node, neighbors] of Object.entries(neighborsList)) {
        const degree = neighbors.length;
        if (degree > maxDegree) {
            maxDegree = degree;
            mostConnectedNodes = [node]; 
        } else if (degree === maxDegree) {
            mostConnectedNodes.push(node); 
        }
    }
    
    let neighborsListInfo = '<strong style="font-size: 30px; color: #000000;">Neighbors List:</strong><br>';
    for (const [node, neighbors] of Object.entries(neighborsList)) {
        neighborsListInfo += `<strong style="color: #007bff; font-size: 20px;">${node}</strong>: [<strong style="font-size: 20px;">${neighbors.join(', ')}</strong>], `;
    }
    neighborsListInfo = neighborsListInfo.slice(0, -2);
    neighborsListInfo += '<br>';
    
    let connectionPhrase = mostConnectedNodes.length === 1 ? '<strong style="font-size: 20px;">Node with the maximum number of incident links: </strong>' : '<strong style="font-size: 20px;">Nodes with the maximum number of incident links: </strong>';
    neighborsListInfo += `${connectionPhrase}<strong style="color: #007bff; font-size: 20px;">${mostConnectedNodes.join(', ')}</strong><hr>`;

    document.getElementById('graphInfoModalDataNeighborsList').innerHTML = neighborsListInfo;
    //endNeighboursList

    //startEulerianGraph
    let eulerianGraphText='<strong style="font-size: 25px; color: #000000;">Is graph Eulerian Graph?</strong>   '
    let isEulerianGraph = isEulerian(nodes, links);
    eulerianGraphText += isEulerianGraph ? '<strong style="font-size: 25px; color: green;">Yes</strong>' : '<strong style="font-size: 25px; color: red;">No</strong>';
    document.getElementById('graphInfoModalDataEulerianGraph').innerHTML = eulerianGraphText;
    //endEulerianGraph
        
    document.getElementById('showIncidenceMatrixButton').addEventListener('click', function() {
        document.getElementById('graphInfoModal').style.display = 'none';
        document.getElementById('incidenceMatrix').style.display = 'flex'; 
    });

    document.getElementById('showExplainEulerianGraph').addEventListener('click', function() {
        document.getElementById('graphInfoModal').style.display = 'none'; 
        document.getElementById('explainEulerGraph').style.display = 'flex'; 
    });
    
    document.getElementById('showAdjacencyMatrixButton').addEventListener('click', function() {
        document.getElementById('graphInfoModal').style.display = 'none';
        document.getElementById('adjacencyMatrix').style.display = 'flex'; 
    });
    document.getElementById('graphInfoModal').style.display = 'flex';

    document.getElementById('backExplainEulerGraphButton').addEventListener('click', function() {
        document.getElementById('explainEulerGraph').style.display = 'none';
        document.getElementById('graphInfoModal').style.display = 'flex';
    }); 
    document.getElementById('backIncidenceMatrixModalButton').addEventListener('click', function() {
        document.getElementById('incidenceMatrix').style.display = 'none';
        document.getElementById('graphInfoModal').style.display = 'flex';
    }); 
    document.getElementById('backAdjacencyMatrixModalButton').addEventListener('click', function() {
        document.getElementById('adjacencyMatrix').style.display = 'none';
        document.getElementById('graphInfoModal').style.display = 'flex';
    });
    document.getElementById('backModalButton').addEventListener('click', function() {
        document.getElementById('graphInfoModal').style.display = 'none';
    });    
}

function isEulerian(nodes, links) {
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

            links.forEach(link => {
                this.adjacencyList[link.startNode].push(link.endNode);
                this.adjacencyList[link.endNode].push(link.startNode);
            });
        }

        isConnected() {
            const visited = new Set();

            const dfs = (node) => {
                visited.add(node);
                this.adjacencyList[node].forEach(neighbor => {
                    if (!visited.has(neighbor)) {
                        dfs(neighbor);
                    }
                });
            };

            const startNode = Object.keys(this.adjacencyList).find(node => this.adjacencyList[node].length > 0);
            
            if (!startNode) {
                return true;
            }

            dfs(startNode);

            return Object.keys(this.adjacencyList).every(node => 
                visited.has(node)
            );
        }

        hasEvenDegrees() {
            return Object.keys(this.adjacencyList).every(node => 
                this.adjacencyList[node].length % 2 === 0
            );
        }

        isEulerian() {
            return this.isConnected() && this.hasEvenDegrees();
        }
    }

    const graph = new Graph(nodes, links);
    return graph.isEulerian();
}
