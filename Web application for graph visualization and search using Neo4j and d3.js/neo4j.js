const neo4j_http_url = "http://localhost:7474/db/neo4j/tx"
const neo4jUsername = "neo4j"
const neo4jPassword = "admin123"

function home(){
    updateGraph(globalNodes,globalLinks,undefined,undefined,globalToggle);
}

function submitQuery() {
    let nodeMap = {}
    let linkMap = {}
    console.log("submit query");
    // let cypherString = document.querySelector('#queryContainer').value

    // if (!cypherString.trim()) {
    //     let cypherString = "MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m";
    // }
    let cypherString = "MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m";

    // console.log(cypherString);

    fetch(neo4j_http_url, {
        method: 'POST',
        headers: {
            "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
            "Content-Type": "application/json",
            "Accept": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
            statements: [{
                statement: cypherString,
                resultDataContents: ["graph"]
            }]
        })
        })
        .then(response => response.json())
        .then(data => {
            if (data.errors && data.errors.length > 0) {
                alert(`Error: ${data.errors.map(error => error.message).join(', ')}`);
                return;
            }
            console.log(data);
            if (data.results && data.results[0] && data.results[0].data) {
                data.results[0].data.forEach(dataItem => {
                    if (dataItem.graph.nodes) {
                        dataItem.graph.nodes.forEach(node => {
                            if (!(node.id in nodeMap)) {
                                nodeMap[node.id] = node;
                            }
                        });
                    }
                    if (dataItem.graph.relationships) {
                        dataItem.graph.relationships.forEach(link => {
                            if (!(link.id in linkMap)) {
                                link.source = link.startNode;
                                link.target = link.endNode;
                                linkMap[link.id] = link;
                            }
                        });
                    }
                });

                // console.log(nodeMap);
                // console.log(linkMap);
                updateGraph(Object.values(nodeMap), Object.values(linkMap));
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
};

function updateLinkWeight(linkID, newWeight) {
    console.log(linkID);
    console.log(newWeight);

    let cypherQuery = `MATCH ()-[r]->() WHERE ID(r) = $linkID SET r.distance = $newWeight RETURN r`;
    
    let requestBody = JSON.stringify({
        statements: [{
            statement: cypherQuery,
            parameters: { linkID: parseInt(linkID, 10), newWeight: parseInt(newWeight, 10) }
        }]
    });

    console.log(requestBody);

    let commitUrl = neo4j_http_url + "/commit";

    fetch(commitUrl, {
        method: 'POST',
        headers: {
            "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
            "Content-Type": "application/json",
            "Accept": "application/json;charset=UTF-8",
        },
        body: requestBody
    })
    .then(response => response.json())
    .then(data => {
        if (data.errors && data.errors.length > 0) {
            console.error('Error:', data.errors);
        } else {
            console.log('Success', data);
        }
    })
    .catch(error => {
        console.error('Error', error);
    });
}

function updateNodeName(nodeID, newName) {
    console.log(nodeID);
    console.log(newName);

    let cypherQuery = `MATCH (n) WHERE ID(n) = $nodeID SET n.name = $newName RETURN n`;

    let requestBody = JSON.stringify({
        statements: [{
            statement: cypherQuery,
            parameters: { nodeID: parseInt(nodeID, 10), newName: newName }
        }]
    });

    console.log(requestBody);

    let commitUrl = neo4j_http_url + "/commit";

    fetch(commitUrl, {
        method: 'POST',
        headers: {
            "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
            "Content-Type": "application/json",
            "Accept": "application/json;charset=UTF-8",
        },
        body: requestBody
    })
    .then(response => response.json())
    .then(data => {
        if (data.errors && data.errors.length > 0) {
            console.error('Error:', data.errors);
        } else {
            console.log('Success', data);
        }
    })
    .catch(error => {
        console.error('Error', error);
    });
}

function deleteNode(nodeID) {
    console.log(nodeID);

    let cypherQuery = `MATCH (n) WHERE ID(n) = $nodeID DETACH DELETE n`;

    let requestBody = JSON.stringify({
        statements: [{
            statement: cypherQuery,
            parameters: { nodeID: parseInt(nodeID, 10) }
        }]
    });

    console.log(requestBody);

    let commitUrl = neo4j_http_url + "/commit"; 

    fetch(commitUrl, {
        method: 'POST',
        headers: {
            "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
            "Content-Type": "application/json",
            "Accept": "application/json;charset=UTF-8",
        },
        body: requestBody
    })
    .then(response => response.json())
    .then(data => {
        if (data.errors && data.errors.length > 0) {
            console.error('Error:', data.errors);
        } else {
            console.log('Success', data);
        }
    })
    .catch(error => {
        console.error('Error', error);
    });
}

function deleteLink(linkID) {
    let cypherQuery = `MATCH ()-[r]-() WHERE ID(r) = $linkID DELETE r`;

    let requestBody = JSON.stringify({
        statements: [{
            statement: cypherQuery,
            parameters: { linkID: parseInt(linkID, 10) }
        }]
    });

    console.log(requestBody);

    let commitUrl = neo4j_http_url + "/commit";

    fetch(commitUrl, {
        method: 'POST',
        headers: {
            "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
            "Content-Type": "application/json",
            "Accept": "application/json;charset=UTF-8",
        },
        body: requestBody
    })
    .then(response => response.json())
    .then(data => {
        if (data.errors && data.errors.length > 0) {
            console.error('Error:', data.errors);
        } else {
            console.log('Success', data);
        }
    })
    .catch(error => {
        console.error('Error', error);
    });
}

async function addNode(nodeName) {
    console.log(`Adding node: ${nodeName}`);

    let cypherQuery = `CREATE (n {name: $nodeName}) RETURN n`;

    let requestBody = JSON.stringify({
        statements: [{
            statement: cypherQuery,
            parameters: { nodeName: nodeName }
        }]
    });

    let commitUrl = neo4j_http_url + "/commit";

    try {
        let response = await fetch(commitUrl, {
            method: 'POST',
            headers: {
                "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
                "Content-Type": "application/json",
                "Accept": "application/json;charset=UTF-8",
            },
            body: requestBody
        });
        let data = await response.json();
        if (data.errors && data.errors.length > 0) {
            console.error('Error:', data.errors);
            return null; 
        } else {
            console.log('Node added successfully', data);
            return data; 
        }
    } catch (error) {
        console.error('Error creating node', error);
        return null; 
    }
}

async function addLink(sourceNodeId, targetNodeId, distance) {
    let cypherQuery = `
        MATCH (a),(b) 
        WHERE ID(a) = $sourceNodeId AND ID(b) = $targetNodeId 
        CREATE (a)-[r:CONNECTS {distance: $distance}]->(b) 
        RETURN type(r), r.distance
    `;

    let requestBody = JSON.stringify({
        statements: [{
            statement: cypherQuery,
            parameters: { 
                sourceNodeId: parseInt(sourceNodeId, 10), 
                targetNodeId: parseInt(targetNodeId, 10), 
                distance: distance 
            }
        }]
    });

    let commitUrl = neo4j_http_url + "/commit";

    try {
        let response = await fetch(commitUrl, {
            method: 'POST',
            headers: {
                "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
                "Content-Type": "application/json",
                "Accept": "application/json;charset=UTF-8",
            },
            body: requestBody
        });
        let data = await response.json();
        if (data.errors && data.errors.length > 0) {
            console.error('Error adding link:', data.errors);
            return null; 
        } else {
            console.log('Link added successfully', data);
            return data;
        }
    } catch (error) {
        console.error('Error creating link', error);
        return null; 
    }
}
 
async function findNodeByName(nodeName) {
    let cypherString = `MATCH (n) WHERE n.name = $name RETURN n LIMIT 1`;

    let requestBody = JSON.stringify({
        statements: [{
            statement: cypherString,
            parameters: { name: nodeName },
            resultDataContents: ["graph"]
        }]
    });

    try {
        let response = await fetch(neo4j_http_url, {
            method: 'POST',
            headers: {
                "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
                "Content-Type": "application/json",
                "Accept": "application/json;charset=UTF-8",
            },
            body: requestBody
        });
        let data = await response.json();
        if (data.errors && data.errors.length > 0) {
            console.error('Error:', data.errors.map(error => error.message).join(', '));
            return null;
        }

        if (data.results && data.results[0] && data.results[0].data[0]) {
            let node = data.results[0].data[0].graph.nodes[0]; 
            return node; 
        } else {
            console.log('No node found with the name:', nodeName);
            return null; 
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function findLinkByNodes(sourceNodeId, targetNodeId) {
    let cypherQuery = `
        MATCH (a)-[r:CONNECTS]->(b) 
        WHERE ID(a) = $sourceNodeId AND ID(b) = $targetNodeId 
        RETURN r LIMIT 1
    `;

    let requestBody = JSON.stringify({
        statements: [{
            statement: cypherQuery,
            parameters: { 
                sourceNodeId: parseInt(sourceNodeId, 10), 
                targetNodeId: parseInt(targetNodeId, 10) 
            },
            resultDataContents: ["graph"]
        }]
    });

    try {
        let response = await fetch(neo4j_http_url + "/commit", {
            method: 'POST',
            headers: {
                "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
                "Content-Type": "application/json",
                "Accept": "application/json;charset=UTF-8",
            },
            body: requestBody
        });
        let data = await response.json();

        if (data.errors && data.errors.length > 0) {
            console.error('Error finding link:', data.errors.map(error => error.message).join(', '));
            return null;
        }

        if (data.results && data.results[0] && data.results[0].data.length > 0 && data.results[0].data[0].graph.relationships.length > 0) {
            let linkDetails = data.results[0].data[0].graph.relationships[0];
            console.log("link details:", linkDetails);
            return linkDetails;
        } else {
            console.log('No link found between nodes:', sourceNodeId, 'and', targetNodeId);
            return null;
        }
    } catch (error) {
        console.error('Error fetching link data:', error);
        return null;
    }
}

function pullGraphInfo(impexp) { 
    let nodeMap = {}
    let linkMap = {}

    // let cypherString = document.querySelector('#queryContainer').value

    // if (!cypherString.trim()) {
    //     cypherString = "MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m";
    // } 

    let cypherString = "MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m";

    // console.log(cypherString);

    fetch(neo4j_http_url, {
        method: 'POST',
        headers: {
            "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
            "Content-Type": "application/json",
            "Accept": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
            statements: [{
                statement: cypherString,
                resultDataContents: ["graph"]
            }]
        })
        })
        .then(response => response.json())
        .then(data => {
            if (data.errors && data.errors.length > 0) {
                alert(`Error: ${data.errors.map(error => error.message).join(', ')}`);
                return;
            }
            console.log(data);
            if (data.results && data.results[0] && data.results[0].data) {
                data.results[0].data.forEach(dataItem => {
                    if (dataItem.graph.nodes) {
                        dataItem.graph.nodes.forEach(node => {
                            if (!(node.id in nodeMap)) {
                                nodeMap[node.id] = node;
                            }
                        });
                    }
                    if (dataItem.graph.relationships) {
                        dataItem.graph.relationships.forEach(link => {
                            if (!(link.id in linkMap)) {
                                link.source = link.startNode;
                                link.target = link.endNode;
                                linkMap[link.id] = link;
                            }
                        });
                    }
                });

                // console.log(nodeMap);
                // console.log(linkMap);
                console.log("impexp",impexp);
                if(impexp!=undefined){
                    console.log("impex");
                    impExpGraph(Object.values(nodeMap), Object.values(linkMap));
                }else{
                    console.log("undefined je");
                    graphInfo(Object.values(nodeMap), Object.values(linkMap));
                }
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
};

async function deleteAll() {
    let cypherString = "MATCH (n) DETACH DELETE n";
    let commitUrl = neo4j_http_url + "/commit"; 

    console.log("Deleting everything");

    try {
        const response = await fetch(commitUrl, {
            method: 'POST',
            headers: {
                "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
                "Content-Type": "application/json",
                "Accept": "application/json;charset=UTF-8",
            },
            body: JSON.stringify({
                statements: [{
                    statement: cypherString
                }]
            })
        });
        const data = await response.json();
        if (data.errors && data.errors.length > 0) {
            console.error('Error:', data.errors);
            alert(`Error: ${data.errors.map(error => error.message).join(', ')}`);
            throw new Error(data.errors.map(error => error.message).join(', '));
        }
        console.log('All nodes and relationships have been deleted:', data);
    } catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    }
}

async function addTemplate_5() {
    console.log("Executing addTemplate_5");

    let cypherString = `
        CREATE (A:Node {name: 'A'})
        CREATE (B:Node {name: 'B'})
        CREATE (C:Node {name: 'C'})
        CREATE (D:Node {name: 'D'})
        CREATE (E:Node {name: 'E'})

        CREATE (A)-[:CONNECTS {distance: 3}]->(B)
        CREATE (A)-[:CONNECTS {distance: 6}]->(C)
        CREATE (A)-[:CONNECTS {distance: 2}]->(D)
        CREATE (B)-[:CONNECTS {distance: 2}]->(C)
        CREATE (D)-[:CONNECTS {distance: 4}]->(E)
        CREATE (D)-[:CONNECTS {distance: 2}]->(B)
        CREATE (E)-[:CONNECTS {distance: 3}]->(C)
    `;

    let commitUrl = neo4j_http_url + "/commit";

    try {
        let response = await fetch(commitUrl, {
            method: 'POST',
            headers: {
                "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
                "Content-Type": "application/json",
                "Accept": "application/json;charset=UTF-8",
            },
            body: JSON.stringify({
                statements: [{
                    statement: cypherString
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();

        if (data.errors && data.errors.length > 0) {
            alert(`Error: ${data.errors.map(error => error.message).join(', ')}`);
            throw new Error(data.errors.map(error => error.message).join(', '));
        } else {
            console.log("Database updated successfully.");
        }
    } catch (error) {
        console.error('Error:', error);
        throw error; 
    }
}

async function addTemplate_10() {
    console.log("Executing addTemplate_10");

    let cypherString = `
        CREATE (A:Node {name: 'A'})
        CREATE (B:Node {name: 'B'})
        CREATE (C:Node {name: 'C'})
        CREATE (D:Node {name: 'D'})
        CREATE (E:Node {name: 'E'})
        CREATE (F:Node {name: 'F'})
        CREATE (G:Node {name: 'G'})
        CREATE (H:Node {name: 'H'})
        CREATE (I:Node {name: 'I'})
        CREATE (J:Node {name: 'J'})

        CREATE (A)-[:CONNECTS {distance: 2}]->(B)
        CREATE (A)-[:CONNECTS {distance: 1}]->(C)
        CREATE (A)-[:CONNECTS {distance: 2}]->(D)
        CREATE (B)-[:CONNECTS {distance: 3}]->(F)
        CREATE (B)-[:CONNECTS {distance: 6}]->(J)
        CREATE (C)-[:CONNECTS {distance: 1}]->(F)
        CREATE (C)-[:CONNECTS {distance: 1}]->(H)
        CREATE (D)-[:CONNECTS {distance: 1}]->(E)
        CREATE (E)-[:CONNECTS {distance: 3}]->(I)
        CREATE (F)-[:CONNECTS {distance: 2}]->(G)
        CREATE (H)-[:CONNECTS {distance: 1}]->(G)
        CREATE (H)-[:CONNECTS {distance: 7}]->(I)
        CREATE (I)-[:CONNECTS {distance: 1}]->(J)   
        CREATE (G)-[:CONNECTS {distance: 3}]->(J)   
    `;

    let commitUrl = neo4j_http_url + "/commit";

    try {
        let response = await fetch(commitUrl, {
            method: 'POST',
            headers: {
                "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
                "Content-Type": "application/json",
                "Accept": "application/json;charset=UTF-8",
            },
            body: JSON.stringify({
                statements: [{
                    statement: cypherString
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();

        if (data.errors && data.errors.length > 0) {
            alert(`Error: ${data.errors.map(error => error.message).join(', ')}`);
            throw new Error(data.errors.map(error => error.message).join(', '));
        } else {
            console.log("Database updated successfully.");
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function addTemplate_15() {
    console.log("Executing addTemplate_15");

    let cypherString = `
        CREATE (A:Node {name: 'A'})
        CREATE (B:Node {name: 'B'})
        CREATE (C:Node {name: 'C'})
        CREATE (D:Node {name: 'D'})
        CREATE (E:Node {name: 'E'})
        CREATE (F:Node {name: 'F'})
        CREATE (G:Node {name: 'G'})
        CREATE (H:Node {name: 'H'})
        CREATE (I:Node {name: 'I'})
        CREATE (J:Node {name: 'J'})
        CREATE (K:Node {name: 'K'})
        CREATE (L:Node {name: 'L'})
        CREATE (M:Node {name: 'M'})
        CREATE (N:Node {name: 'N'})
        CREATE (O:Node {name: 'O'})

        CREATE (A)-[:CONNECTS {distance: 2}]->(B)
        CREATE (A)-[:CONNECTS {distance: 1}]->(C)
        CREATE (A)-[:CONNECTS {distance: 2}]->(D)
        CREATE (B)-[:CONNECTS {distance: 3}]->(F)
        CREATE (B)-[:CONNECTS {distance: 6}]->(J)
        CREATE (C)-[:CONNECTS {distance: 1}]->(F)
        CREATE (C)-[:CONNECTS {distance: 1}]->(H)
        CREATE (D)-[:CONNECTS {distance: 1}]->(E)
        CREATE (E)-[:CONNECTS {distance: 3}]->(I)
        CREATE (F)-[:CONNECTS {distance: 2}]->(G)
        CREATE (H)-[:CONNECTS {distance: 1}]->(G)
        CREATE (H)-[:CONNECTS {distance: 7}]->(I)
        CREATE (I)-[:CONNECTS {distance: 1}]->(J)   
        CREATE (I)-[:CONNECTS {distance: 3}]->(K)   
        CREATE (J)-[:CONNECTS {distance: 4}]->(O)   
        CREATE (K)-[:CONNECTS {distance: 4}]->(L)   
        CREATE (K)-[:CONNECTS {distance: 1}]->(N)   
        CREATE (L)-[:CONNECTS {distance: 1}]->(M)   
        CREATE (O)-[:CONNECTS {distance: 1}]->(L)   
        CREATE (O)-[:CONNECTS {distance: 2}]->(M)   
        CREATE (M)-[:CONNECTS {distance: 4}]->(N)   
    `;

    let commitUrl = neo4j_http_url + "/commit";

    try {
        let response = await fetch(commitUrl, {
            method: 'POST',
            headers: {
                "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
                "Content-Type": "application/json",
                "Accept": "application/json;charset=UTF-8",
            },
            body: JSON.stringify({
                statements: [{
                    statement: cypherString
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();

        if (data.errors && data.errors.length > 0) {
            alert(`Error: ${data.errors.map(error => error.message).join(', ')}`);
            throw new Error(data.errors.map(error => error.message).join(', '));
        } else {
            console.log("Database updated successfully.");
        }
    } catch (error) {
        console.error('Error:', error);
        throw error; 
    }
}

//export 1
async function exportDatabaseAsCypher() {
    let commitUrl = neo4j_http_url + "/commit";
    let query = `
        CALL apoc.export.json.all(null, {stream: true})
        YIELD data
        RETURN data
    `;

    try {
        let response = await fetch(commitUrl, {
            method: 'POST',
            headers: {
                "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
                "Content-Type": "application/json",
                "Accept": "application/json;charset=UTF-8",
            },
            body: JSON.stringify({
                statements: [{
                    statement: query
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();

        if (data.errors && data.errors.length > 0) {
            showImportError("There was an error exporting the database");
            throw new Error(data.errors.map(error => error.message).join(', '));
        } else {
            let exportData = data.results[0].data[0].row[0];
            let cypherCommands = generateCypherCommandsFromJSON(exportData);
            downloadCypherCommands(cypherCommands);
            console.log("Database exported successfully.");
        }
    } catch (error) {
        showImportError("There was an error exporting the database");
        throw error;
    }
}
//export 2
function generateCypherCommandsFromJSON(fileContent) {
    let lines = fileContent.split('\n'); //stvara niz s delimiterom \n
    let nodes = new Map();
    let relationships = [];

    for (let line of lines) {
        if (line.trim()) {
            let obj = JSON.parse(line); // pretvara json string u javscript object
            if (obj.type === 'node') {
                obj.properties.name = obj.properties.name.toUpperCase();
                nodes.set(obj.id, obj);
            } else if (obj.type === 'relationship') {
                relationships.push(obj);
            }
        }
    }

    let cypherCommands = [];

    nodes.forEach(node => { 
        let properties = JSON.stringify(node.properties).replace(/"(\w+)"\s*:/g, '$1:').replace(/"/g, "'");// trazi "string"(pa razmak): g -> global flag ali samo prvu grupu a to mi je name i minja ga sa 'name: '  ; g je global flag - minja sve " sa '
        cypherCommands.push(`CREATE (${node.properties.name}:Node ${properties})`);// trazi "string"(pa razmak): g -> global flag ali samo prvu grupu a to mi je distance i minja ga sa 'distance: '  ; g je global flag - minja sve " sa '
    });

    relationships.forEach(rel => {
        let startName = rel.start.properties.name.toUpperCase();
        let endName = rel.end.properties.name.toUpperCase();
        let properties = JSON.stringify(rel.properties).replace(/"(\w+)"\s*:/g, '$1:').replace(/"/g, "'");
        cypherCommands.push(`CREATE (${startName})-[:${rel.label} ${properties}]->(${endName})`);
    });

    return cypherCommands;
}
//export 3
function downloadCypherCommands(cypherCommands) {
    const blob = new Blob([cypherCommands.join('\n')], { type: 'text/plain' }); // 2 args, data and format
    const url = URL.createObjectURL(blob); //creating url for blob
    const link = document.createElement('a'); //creating anchor elementa
    link.href = url;
    link.download = 'graph.cypher';
    document.body.appendChild(link); //adding element na str
    link.click(); //simulation of click, zapravo zapocinjemo download
    document.body.removeChild(link); //del element sa str
    URL.revokeObjectURL(url); //destroy url, free menžm
}

//import
async function executeCypherString(cypherString) {
    let commitUrl = neo4j_http_url + "/commit";

    try {
        let response = await fetch(commitUrl, {
            method: 'POST',
            headers: {
                "Authorization": "Basic " + btoa(`${neo4jUsername}:${neo4jPassword}`),
                "Content-Type": "application/json",
                "Accept": "application/json;charset=UTF-8",
            },
            body: JSON.stringify({
                statements: [{
                    statement: cypherString
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();

        if (data.errors && data.errors.length > 0) {
            showImportError(`Error: ${data.errors.map(error => error.message).join(', ')}`);
            throw new Error(data.errors.map(error => error.message).join(', '));
        } else {
            console.log("Database updated successfully.");
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}