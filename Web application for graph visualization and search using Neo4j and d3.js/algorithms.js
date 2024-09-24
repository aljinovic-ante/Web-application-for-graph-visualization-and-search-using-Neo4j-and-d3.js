function closeErrorModal() {
    document.getElementById('errorModal').style.display = 'none';
}

function showErrorModal(message) {
    const errorModal = document.getElementById('errorModal');
    document.getElementById('errorMessage').textContent = message;
    errorModal.style.display = 'flex'; 
}

function checkNegative2() {
    for (let link of globalLinks) {
        if (link.properties.distance < 0) {
            console.log("Negative Edge Distance:", link.properties.distance);
            return true;
        }
    }
    return false;
}

function updateAlgorithmOptions() {
    const hasNegativeEdges = checkNegative2();
    const disabledAlgorithmsList = document.getElementById('disabledAlgorithmsList');
    const algWarning = document.getElementById('algWarning');
    const warningDiv = document.getElementById('warningDiv');
    const algorithmOptions = document.querySelectorAll('.algorithm-option');
    
    let disabledAlgorithms = [];

    if (hasNegativeEdges) {
        disabledAlgorithmsList.style.display = 'block';
        algWarning.style.display = 'block';
        warningDiv.style.display = 'block';
        algorithmOptions.forEach(option => {
            const algorithmValue = option.value;
            if (['1', '3', '11'].includes(algorithmValue)) {
                option.disabled = true;
                disabledAlgorithms.push(option.textContent);
            }
        });
        disabledAlgorithmsList.innerHTML = disabledAlgorithms.map(algorithm => `<div style="color: black; font-size: 20px;">${algorithm}</div>`).join('');
        algWarning.innerHTML="These algorithms don't work with negative edge values:";
    } else {
        algWarning.style.display = 'none';
        warningDiv.style.display = 'none';
        disabledAlgorithmsList.style.display = 'none';
        algorithmOptions.forEach(option => {
            option.disabled = false;
        });
    }
}

document.getElementById('openAlgorithmsWindow').addEventListener('click', function() {
    updateAlgorithmOptions();
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    algorithmDropdown.value = ''; 
    document.getElementById('chooseAlgorithmModal').style.display = 'flex';
});

document.getElementById('algorithmDropdown').addEventListener('change', function() {
    const algorithmDropdown = document.getElementById('algorithmDropdown');
    const selectedAlgorithm = algorithmDropdown.value;

    document.getElementById('chooseAlgorithmModal').style.display = 'none';

    selectAlgorithm(selectedAlgorithm);
});

document.getElementById('chooseAlgorithmCancel').addEventListener('click', function() {
    document.getElementById('chooseAlgorithmModal').style.display = 'none';
});

// document.addEventListener("DOMContentLoaded", function() {
//     const algorithmDropdown = document.getElementById('algorithmDropdown');
//     algorithmDropdown.addEventListener('change', function() {
//         if (algorithmDropdown.value) {
//             document.getElementById('algorithmWarning').style.display = 'none';
//             document.getElementById('algorithmWarning').textContent = '';
//         }
//     });

//     document.getElementById('chooseNodesAstarCancel').addEventListener('click', function() {
//         document.getElementById('chooseNodesAstar').style.display = 'none';
//     });

//     document.getElementById('chooseNodesGBFSCancel').addEventListener('click', function() {
//         document.getElementById('chooseNodesGBFS').style.display = 'none';
//     });
// });

function selectAlgorithm(algorithm) {
    if (algorithm === "1") { 
        populateNodeDropdownsASTAR(); 
        document.getElementById('chooseNodesAstar').style.display = 'flex'; 
    } else if (algorithm === "2") { 
        populateNodeDropdownsGBFS(); 
        document.getElementById('chooseNodesGBFS').style.display = 'flex'; 
    } else if (algorithm === "3") { 
        populateNodeDropdownsDijkstra(); 
        document.getElementById('chooseNodesDijkstra').style.display = 'flex'; 
    } else if (algorithm === "4") { 
        populateNodeDropdownsBFS(); 
        document.getElementById('chooseNodesBFS').style.display = 'flex'; 
    } else if (algorithm === "5") { 
        populateNodeDropdownsDFS(); 
        document.getElementById('chooseNodesDFS').style.display = 'flex'; 
    } else if (algorithm === "6") { 
        populateNodeDropdownsKruskal(); 
        document.getElementById('chooseNodesKruskal').style.display = 'flex'; 
    } else if (algorithm === "7") { 
        populateNodeDropdownsPrim(); 
        document.getElementById('chooseNodesPrim').style.display = 'flex'; 
    } else if (algorithm === "8") { 
        populateNodeDropdownsFluery(); 
        document.getElementById('chooseNodesFluery').style.display = 'flex'; 
    } else if (algorithm === "9") { 
        populateNodeDropdownsHierholzer(); 
        document.getElementById('chooseNodesHierholzer').style.display = 'flex'; 
    } else if (algorithm === "10") { 
        populateNodeDropdownsBellmanFord(); 
        document.getElementById('chooseNodesBellmanFord').style.display = 'flex'; 
    } else if (algorithm === "11") { 
        populateNodeDropdownsTSP(); 
        document.getElementById('chooseNodesTSP').style.display = 'flex'; 
    }
}

function showDescButton(algorithmName, path, descriptions) {
    const button = document.getElementById("algDescPrintResult");
    const modal = document.getElementById("algDescModal");
    const descList = document.getElementById("algDescList");
    const modalTitle = document.getElementById("algDescTitle");
    const separator = document.getElementById("algDescSeparator");
    const algDescSequence = document.getElementById("algDescSequence");

    button.style.display = "block";
    separator.style.display = "block";
    console.log("---------------");
    console.log("algorithmName", algorithmName);
    console.log(path);
    console.log(descriptions);

    let formattedPath;

    function isString(value) {
        return typeof value === 'string' || value instanceof String;
    }

    if(isString(path)){
        console.log("TU SMO");
        formattedPath=path;
    }
    else if(!isString(path)){
        if ((algorithmName === "Nearest Neighbor" || algorithmName === "Sorted Edges TSP") && path && Array.isArray(path)) {
            formattedPath = [...new Set(path.filter(item => typeof item === 'string'))].join("->");
        } 
        else if (algorithmName === "Prim" && path && Array.isArray(path)) {
            formattedPath = path.map(link => {
                if (link.source && link.target) {
                    return `${link.source} -> ${link.target}`;
                }
                return null;
            }).filter(item => item !== null).join(", ");
        } 
        else if (algorithmName === "Kruskal" && path && Array.isArray(path)) {
            formattedPath = path.map(link => {
                if (link.source && link.target) {
                    return `${link.source} -> ${link.target}`;
                }
                return null;
            }).filter(item => item !== null).join(", ");
        } 
        else if (algorithmName === "Bellman-Ford All Paths" || algorithmName === "Dijkstra All Paths") {
            formattedPath = "All paths are shown in the description";
        } 
        else if ((algorithmName === "Fleury" || algorithmName === "Hierholzer") && path && Array.isArray(path)) {
            const nodesOnlyPath = path.filter(item => typeof item === 'string');
            formattedPath = nodesOnlyPath.map((node, index) => {
                if (index < nodesOnlyPath.length - 1) {
                    return `${node} -> ${nodesOnlyPath[index + 1]}`;
                }
                return null;
            }).filter(item => item !== null).join(", ");
        } 
        else {
            formattedPath = path.filter(item => typeof item === 'string').join("->");
        }
    }

    button.onclick = () => {
        modalTitle.textContent = `${algorithmName} algorithm result`;
        algDescSequence.textContent = formattedPath;
        modal.style.display = "block";
        descList.innerHTML = descriptions.map(desc => `<p>${desc}</p>`).join("");
    };

    document.getElementById("algDescCloseModal").onclick = () => {
        modal.style.display = "none";
    };
}


