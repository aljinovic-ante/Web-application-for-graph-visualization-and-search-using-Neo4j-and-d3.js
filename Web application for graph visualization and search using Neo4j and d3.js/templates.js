window.onload = function() {
    document.getElementById('rulesMenu').style.display = 'flex';
    document.getElementById('closeRulesMenu').addEventListener('click', function() {
        document.getElementById('rulesMenu').style.display = 'none';
    });
    document.getElementById('openRulesMenu').addEventListener('click', function() {
        document.getElementById('rulesMenu').style.display = 'flex';
    });

    submitQuery();
};

let selectedTemplate = null;

function selectTemplate(template, button) {
    if (selectedTemplate === template) {
        selectedTemplate = null;
        button.classList.remove('selected');
    } else {
        selectedTemplate = template;
        document.querySelectorAll('.template-button-group button').forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');
    }
}

document.getElementById('addTemplateButton').onclick = function() {
    document.getElementById('addTemplateWindow').style.display = 'flex';
}

document.getElementById('close-button-add-template').onclick = function() {
    document.getElementById('addTemplateWindow').style.display = 'none';
}

function openConfirmModal() {
    if (selectedTemplate) {
        document.getElementById('templateConfirmModal').style.display = 'flex';
    } else {
        alert('Please select a template first.');
    }
}

function closeConfirmModal() {
    document.getElementById('templateConfirmModal').style.display = 'none';
}

async function addTemplate() {
    document.getElementById('templateConfirmModal').style.display = 'none';
    document.getElementById('addTemplateWindow').style.display = 'none';

    async function awaitFunctionAddTemplate(templateSize) {
        switch (templateSize) {
            case "5":
                await deleteAll(); 
                await addTemplate_5();
                break;
            case "10":
                await deleteAll();
                await addTemplate_10();
                break;
            case "15":
                await deleteAll();
                await addTemplate_15();
                break;
            default:
                console.log("Error");
        }
        submitQuery();
    }
    awaitFunctionAddTemplate(selectedTemplate);
}


////import i export

function pullImpExp() {
    document.getElementById('uploadWin').style.display = 'flex';
}
//imp
function extractNodesAndRelationships(cypherString) {
    const nodePattern = /^CREATE \((\w+):Node {name:'(\w+)'}\)$/;
    const relationshipPattern = /^CREATE \((\w+)\)-\[:(\w+)\s*\{(distance:\s*-?\d+)\}\]->\((\w+)\)$/;

    const nodes = new Map();
    const nodeNames = new Set();
    const relationships = new Set();

    const lines = cypherString.split('\n').map(line => line.trim()).filter(line => line !== ''); 
    console.log("lines", lines);

    for (let line of lines) {
        const nodeMatch = line.match(nodePattern);
        const relationshipMatch = line.match(relationshipPattern);

        if (nodeMatch) {
            let varName = nodeMatch[1]; //variable name
            let nodeName = nodeMatch[2]; //user naem

            varName = varName.toUpperCase();
            nodeName = nodeName.toUpperCase();

            if (varName !== nodeName) {
                throw new Error(`Node variable name and node property name must be the same. Found: ${varName} and ${nodeName}.`);
            }

            if (nodes.has(varName)) {
                throw new Error(`Duplicate node variable found: ${varName}`);
            }
            if (nodeNames.has(nodeName)) {
                throw new Error(`Duplicate node name found: ${nodeName}`);
            }

            nodes.set(varName, nodeName);
            nodeNames.add(nodeName);
        } else if (relationshipMatch) {
            let [, startNode, relationshipType, properties, endNode] = relationshipMatch;

            startNode = startNode.toUpperCase();
            endNode = endNode.toUpperCase();

            if (startNode === endNode) {
                throw new Error(`Node ${startNode} cannot have a relationship to itself.`);
            }

            if (!nodes.has(startNode)) {
                throw new Error(`Node ${startNode} in relationship ${line} is not defined.`);
            }
            if (!nodes.has(endNode)) {
                throw new Error(`Node ${endNode} in relationship ${line} is not defined.`);
            }

            const relationship = [startNode, endNode].sort().join('-');

            if (relationships.has(relationship)) {
                throw new Error(`Duplicate relation found: ${relationship}`);
            }
            relationships.add(relationship);
        } else {
            throw new Error(`Invalid line structure: ${line}`);
        }
    }

    return {
        nodes: Array.from(nodes.values()),
        relationships: Array.from(relationships)
    };
}
//imp
function transformNodeNamesToUpper(cypherString) {
    const nodePattern = /CREATE \((\w+):Node {name:'([a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*)'}\)/g; // g global flag matches all occurrences not just 1st one // slovo ili broj * pa jedno slovo pa vise slovo broj iza
    const relationshipPattern = /CREATE \((\w+)\)-\[:(\w+)\s*\{(distance:\s*-?\d+)\}\]->\((\w+)\)/g;    

    cypherString = cypherString.replace(nodePattern, (match, p1, p2) => `CREATE (${p1.toUpperCase()}:Node {name:'${p2.toUpperCase()}'})`); // capturing groups - unutar zagrada gore matchamo
    cypherString = cypherString.replace(relationshipPattern, (match, p1, p2, p3, p4) => {
        return `CREATE (${p1.toUpperCase()})-[:${p2} {${p3}}]->(${p4.toUpperCase()})`;
    });

    return cypherString;
}
//imp
async function importCypherFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0]; // grabbing file
    
    if (!file) {
        handleError('Please select a Cypher file to import.');
        return;
    }
    
    document.getElementById('importWarning').style.display = 'none';
    //console.log("ovde1");
    if (file.type === 'text/plain' || file.name.endsWith('.cypher')) {
        try {
            const fileContent = await readFileContent(file);
            let cypherString = fileContent.split('\n').filter(line => line.trim() !== '').join('\n');
            cypherString = transformNodeNamesToUpper(cypherString);
            //console.log("cy",cypherString);
            try {
                const { nodes, relationships } = extractNodesAndRelationships(cypherString);
                console.log('nodes:', nodes);
                console.log('relationships:', relationships);
            } catch (error) {
                handleError(error.message);
                return;
            }
            await deleteAll();
            await executeCypherString(cypherString);
            submitQuery();
            document.getElementById('uploadWin').style.display = 'none';
            fileInput.value = '';
        } catch (error) {
            handleError('Import failed: ' + error.message);
        }
    } else {
        handleError('Please select a valid Cypher file.');
    }
}

document.getElementById('cfmImport').addEventListener('click', importCypherFile);

document.getElementById('CnclImport').addEventListener('click', function() {
    document.getElementById('uploadWin').style.display = 'none';
    document.getElementById('fileInput').value = ''; 
    document.getElementById('importWarning').style.display = 'none';
});

document.getElementById('fileInput').addEventListener('change', function() {
    const file = this.files[0];
    document.getElementById('cfmImport').disabled = !file;
});

document.getElementById('closeImportError').addEventListener('click', function() {
    document.getElementById('importError').style.display = 'none';
});

document.getElementById('exportDB').addEventListener('click', async function() {
    try {
        await exportDatabaseAsCypher();
    } catch (error) {
        handleError('Export failed: ' + error.message);
    }
});

function showImportError(message) {
    document.getElementById('importErrorMSG').innerText = message;
    document.getElementById('importError').style.display = 'flex';
}

function showImportWarning(message) {
    handleError(message);
}
//imp
async function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader(); // filereader object for reading contents of file as txt for example
        reader.onload = event => resolve(event.target.result); // return result
        reader.onerror = error => reject(error); //executed when error happens
        reader.readAsText(file); // read as text and start onload if successful
    });
}

function handleError(message) {
    document.getElementById('uploadWin').style.display = 'none';
    document.getElementById('fileInput').value = ''; 
    document.getElementById('importWarning').style.display = 'none';
    showImportError(message);
}

document.getElementById('explainStructButton').addEventListener('click', function() {
    document.getElementById('explainStruct').style.display = 'flex';
});

document.getElementById('closeExplainStruct').addEventListener('click', function() {
    document.getElementById('explainStruct').style.display = 'none';
});
document.getElementById('explainStructButton2').addEventListener('click', function() {
    document.getElementById('explainStruct').style.display = 'flex';
});
