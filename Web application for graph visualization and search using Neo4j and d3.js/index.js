const circleSize = 45
let globalNodePositions = {};
let globalNodes = {};
let globalLinks = {};
let path;
let globalToggle;
async function updateGraph(nodes,links,algorithm,positions,toggle){ 
    console.log("---------------------------------------------------------------------------");
    console.log("--------------------------------updateGraph--------------------------------");
    console.log("---------------------------------------------------------------------------");
    console.log("POSITIONS",positions);
    console.log("ALGORITAM",algorithm);
    console.log("toggle",toggle);
    globalToggle=toggle;
    console.log(nodes);
    console.log(links);
    globalNodes=nodes;
    globalLinks=links;
    let allNodes = [];
    allNodes = nodes.map(node => node.properties.name);
    console.log("allNodes ", allNodes);
    let nodeNamesToHL;
    let linkIdToHL;
    let isAnimation=false;
    if(algorithm){
            isAnimation=true;
            console.log("IZABRAN!");
            console.log(algorithm);
            let startingNodeName = algorithm ? algorithm[1] : null;
            console.log("startingNodeName => ",startingNodeName);
        
            nodeNamesToHL = algorithm[1].filter(item => typeof item === 'string');
            linkIdToHL = algorithm[1].filter(item => typeof item === 'number');
            
            console.log("Nodes to highlight: ", nodeNamesToHL);
            console.log("Links to highlight: ", linkIdToHL);
            path=algorithm[1];
        }
   
    
    const container = document.querySelector('#graph');
    const width = container.clientWidth;
    const height = container.clientHeight;           

    let svg = d3.select('#graph').select('svg');         
    
    if (svg.empty()) {                   
        svg = d3.select('#graph').append('svg')
            .attr('width', width)
            .attr('height', height);
    }
    svg.selectAll("*").remove();
    d3.select('#graph').on('contextmenu', function(event) {
        if (isAnimation) return; 
        event.stopPropagation();
        d3.select('#contextMenu').style('display', 'none');
        d3.select('#backgroundMenu').style('display', 'none');
        d3.select('#linkMenu').style('display', 'none');
        event.preventDefault(); 
        let x = event.pageX;
        let y = event.pageY;
        let menuWidth = document.getElementById('backgroundMenu').offsetWidth;
        let menuHeight = document.getElementById('backgroundMenu').offsetHeight;
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;      
        if (x + menuWidth > windowWidth) {
            x -= menuWidth;
        }
        if (y + menuHeight > windowHeight) {
            y -= menuHeight;
        }  
        d3.select('#backgroundMenu')
            .style('left', x + 'px')
            .style('top', y + 'px')
            .style('display', 'block');
        d3.select('#backgroundMenuOption1').on('click', async function() { 
                    document.getElementById('newNodeWarning').style.display = 'none';          
                    document.getElementById('customNodeInputModal').style.display = 'flex';               
                    document.getElementById('nodeNameConfirm').onclick = async function() {
                        let nodeName = document.getElementById('nodeNameInput').value.toUpperCase();
                        const isNumeric2 = /^[0-9]+$/.test(nodeName);
                        if (isNumeric2) {
                            document.getElementById('newNodeWarning').textContent = 'Node name cannot be a number.';
                            document.getElementById('newNodeWarning').style.display = 'block';
                            return;
                        }   
                        if (!nodeName || nodeName.trim() === "") {
                            document.getElementById('newNodeWarning').textContent = 'Please input a valid node name!';
                            document.getElementById('newNodeWarning').style.display = 'block';
                            return;
                        }             
                        if (allNodes.includes(nodeName)) {
                            document.getElementById('newNodeWarning').textContent = 'Node with that name already exists!';
                            document.getElementById('newNodeWarning').style.display = 'block';
                            return;
                        }             
                        await addNode(nodeName);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        let node = await findNodeByName(nodeName);
                        if (node) {
                            nodes.push(node);
                            allNodes = nodes.map(node => node.properties.name);
                            updateGraph(Object.values(nodes), Object.values(links),undefined,positions,toggle);
                        } else {
                            console.log("node not found");
                        }               
                        document.getElementById('customNodeInputModal').style.display = 'none'; 
                        document.getElementById('nodeNameInput').value = ''; 
                    };               
                    document.getElementById('nodeNameCancel').onclick = function() {
                        document.getElementById('customNodeInputModal').style.display = 'none'; 
                        document.getElementById('newNodeWarning').style.display = 'none';
                        document.getElementById('nodeNameInput').value = ''; 
                    };
        });                         
        d3.select('body').on('click.backgroundMenu', function() {
                d3.select('#backgroundMenu').style('display', 'none');
                d3.select('body').on('click.backgroundMenu', null); 
        });
        event.preventDefault();
    });
    if (positions) {
        nodes.forEach(node => {
            const nodeName = node.properties.name;
            if (positions[nodeName]) {
                node.fx = positions[nodeName].x;
                node.fy = positions[nodeName].y;
            }
        });
    }
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(300))
        .force('charge', d3.forceManyBody().strength(-1000))
        .force('center', d3.forceCenter(width / 2, height / 2));

    if (algorithm || toggle === true) {
        const algo = algorithm || [];
    
        if (algo[0] === "Bellman-Ford All Paths" || algo[0] === "Bellman-Ford" || toggle === true) {
            svg.append('defs').selectAll('marker')
                .data(['arrowhead', 'arrowhead-red'])
                .enter().append('marker')
                .attr('id', d => d)
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 20)
                .attr('refY', 0)
                .attr('markerWidth', 15)
                .attr('markerHeight', 15)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M0,-4L10,0L0,4')
                .attr('fill', d => d === 'arrowhead-red' ? 'red' : 'black');
        }
    }
    
    const linkGroup = svg.append('g')
        .attr('class', 'links')
        .selectAll('.link')
        .data(links)
        .enter().append('g')
        .attr('class', 'link');

    linkGroup.append('line')
        .attr('stroke-width', 3)  
        .style('stroke', '#000000')
        .attr('marker-end', 'url(#arrowhead)');

    linkGroup.append('line')
        .attr('stroke-width', 15) 
        .style('stroke', 'rgba(174, 228, 249, 0.0)')
        .on("mouseover", function(event) {
            d3.select(this).style('stroke', 'rgba(174, 228, 249, 0.4)'); 
        })
        .on("mouseout", function(event) {
            d3.select(this).style('stroke', 'rgba(174, 228, 249, 0.0)'); 
        })
        .on('contextmenu', function(event, d) {
            if (isAnimation) return; 
            event.stopPropagation();
            linkID=d.id;
            d3.select('#contextMenu').style('display', 'none');
            d3.select('#backgroundMenu').style('display', 'none');
            event.preventDefault(); 
            let x = event.pageX;
            let y = event.pageY;
            let sourceName = d.source.properties.name; 
            let targetName = d.target.properties.name;
            let linkInfo = `${sourceName} -> ${targetName}`;
            let existingNameDisplay = document.getElementById('linkNameDisplay');
            if(existingNameDisplay) {
                existingNameDisplay.innerHTML = linkInfo;
            } else {
                document.getElementById('linkMenu').querySelector('#linkMenuList').insertAdjacentHTML('beforebegin', `<div id="linkNameDisplay">${linkInfo}</div>`);
            }
            d3.select('#linkMenu')
                .style('left', x + 'px')
                .style('top', y + 'px')
                .style('display', 'block');
    
            d3.select('#linkMenuOption1').on('click', function() {
                    document.getElementById('customInputMessage').innerHTML = `Enter new link weight for: <strong>[${linkInfo}]</strong>`;
                    document.getElementById('customInputModal').style.display = 'flex'; 
                    document.getElementById('inputConfirm').onclick = function() {
                        let newWeight = parseFloat(document.getElementById('linkWeightInput').value);
                        if (!isNaN(newWeight) && isFinite(newWeight) && Number.isInteger(newWeight)) {
                            let linkIndex = links.findIndex(link => link.id === linkID);
                            if (linkIndex !== -1) {
                                links[linkIndex].properties.distance = newWeight;
                                updateLinkWeight(linkID, newWeight);
                                updateGraph(Object.values(nodes), Object.values(links),undefined,positions,toggle);
                            }
                            document.getElementById('customInputModal').style.display = 'none'; 
                            document.getElementById('linkWeightInput').value = ''; 
                        } else {
                            document.getElementById('validNumWarning').textContent = 'Please enter a valid integer number!';
                            document.getElementById('validNumWarning').style.display = 'block';
                        }
                    };
                    document.getElementById('inputCancel').onclick = function() {
                        document.getElementById('customInputModal').style.display = 'none';
                        document.getElementById('validNumWarning').style.display = 'none';
                        document.getElementById('linkWeightInput').value = ''; 
                    };
            });                
            d3.select('#linkMenuOption2').on('click', function() {
                document.getElementById('customConfirmMessage').innerHTML = `Do you want to delete the link: <strong>[${linkInfo}]</strong>?`;
                document.getElementById('customConfirmModal').style.display = 'flex';
                document.getElementById('confirmYes').onclick = function() {
                    deleteLink(linkID);
                    links = links.filter(link => link.id !== linkID);
                    updateGraph(Object.values(nodes), Object.values(links),undefined,positions,toggle);
                    document.getElementById('customConfirmModal').style.display = 'none'; 
                };
                document.getElementById('confirmNo').onclick = function() {
                    document.getElementById('customConfirmModal').style.display = 'none'; 
                };
                d3.select('#linkMenu').style('display', 'none');
            });
            d3.select('#linkMenuOption3').on('click', function() {
                let link = links.find(link => link.id === linkID);
                let originalSourceName = nodes.find(node => node.id === link.startNode).properties.name;
                let originalTargetName = nodes.find(node => node.id === link.endNode).properties.name;
                
                let newLinkInfo = `${originalTargetName} -> ${originalSourceName}`;
            
                document.getElementById('customConfirmMessage').innerHTML = `Do you want to change the direction of the link: <strong>[${linkInfo}]</strong>?<br> The new link will be: <strong>[${newLinkInfo}]</strong>`;
                document.getElementById('customDirectionModal').style.display = 'flex';
                
                document.getElementById('changeDirYes').onclick = async function() {
                    let originalSource = link.startNode;
                    let originalTarget = link.endNode;
                    let originalDistance = link.properties.distance;
                    
                    deleteLink(linkID);
                    links = links.filter(link => link.id !== linkID);
                    
                    await addLink(originalTarget, originalSource, originalDistance);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    let newLink = await findLinkByNodes(originalTarget, originalSource);
                    if (newLink) {
                        const sourceNode = nodes.find(node => node.id === originalTarget);
                        const targetNode = nodes.find(node => node.id === originalSource);
                        newLink.source = sourceNode;
                        newLink.target = targetNode;
                        links.push(newLink);
                        simulation.force("link").links(links);
                        simulation.alpha(1).restart();
                        updateGraph(Object.values(nodes), Object.values(links), undefined, positions, toggle);
                    }           
                    
                    document.getElementById('customDirectionModal').style.display = 'none';     
                };
                
                document.getElementById('changeDirNo').onclick = function() {
                    document.getElementById('customDirectionModal').style.display = 'none'; 
                };
                
                d3.select('#linkMenu').style('display', 'none');
            });                        
            d3.select('body').on('click.linkMenu', function() {
                d3.select('#linkMenu').style('display', 'none');
                d3.select('body').on('click.linkMenu', null); 
            });
        });

    // linkGroup.append('rect') // triba li mi??
    //     .attr('x', d => (d.source.x + d.target.x) / 2)
    //     .attr('y', d => (d.source.y + d.target.y) / 2) 
    //     .style('fill', 'white') 
    //     .style('opacity', '0.1');

    //dole je plava ona
    linkGroup.append('text')
    .text(d => d.properties.distance)
    .style('fill', 'black')
    .attr('x', d => (d.source.x + d.target.x) / 2)
    .attr('y', d => (d.source.y + d.target.y) / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '40px')
    .on("mouseover", function(event) {
        d3.select(this)
          .transition() 
          .duration(250) 
          .style('stroke', 'rgba(174, 228, 249, 0.9)') 
          .style('font-size', '50px');
    })
    .on("mouseout", function(event) {
        d3.select(this)
          .transition() 
          .duration(250) 
          .style('stroke', 'rgba(174, 228, 249, 0.0)')
          .style('font-size', '40px'); 
    })       
    .on('contextmenu', function(event, d) {
        if (isAnimation) return; 
        event.stopPropagation();
        linkID = d.id;
        d3.select('#contextMenu').style('display', 'none');
        d3.select('#backgroundMenu').style('display', 'none');
        event.preventDefault(); 
        let x = event.pageX;
        let y = event.pageY;
        let sourceName = d.source.properties.name; 
        let targetName = d.target.properties.name;
        let linkInfo = `${sourceName}->${targetName}`;
        let existingNameDisplay = document.getElementById('linkNameDisplay');
        if (existingNameDisplay) {
            existingNameDisplay.innerHTML = linkInfo;
        } else {
            document.getElementById('linkMenu').querySelector('#linkMenuList').insertAdjacentHTML('beforebegin', `<div id="linkNameDisplay">${linkInfo}</div>`);
        }
        d3.select('#linkMenu')
            .style('left', x + 'px')
            .style('top', y + 'px')
            .style('display', 'block');

        d3.select('#linkMenuOption1').on('click', function() {
            document.getElementById('customInputMessage').innerHTML = `Enter new link weight for: <strong>[${linkInfo}]</strong>`;
            document.getElementById('customInputModal').style.display = 'flex'; 
            document.getElementById('inputConfirm').onclick = function() {
                let newWeight = parseFloat(document.getElementById('linkWeightInput').value);
                if (!isNaN(newWeight) && isFinite(newWeight) && Number.isInteger(newWeight)) {
                    let linkIndex = links.findIndex(link => link.id === linkID);
                    if (linkIndex !== -1) {
                        links[linkIndex].properties.distance = newWeight;
                        updateLinkWeight(linkID, newWeight);
                        updateGraph(Object.values(nodes), Object.values(links), undefined, positions, toggle);
                    }
                    document.getElementById('customInputModal').style.display = 'none'; 
                    document.getElementById('linkWeightInput').value = ''; 
                } else {
                    document.getElementById('validNumWarning').textContent = 'Please enter a valid integer number!';
                    document.getElementById('validNumWarning').style.display = 'block';
                }
            };
            document.getElementById('inputCancel').onclick = function() {
                document.getElementById('customInputModal').style.display = 'none'; 
                document.getElementById('validNumWarning').style.display = 'none';
                document.getElementById('linkWeightInput').value = ''; 
            };
        });            
        d3.select('#linkMenuOption2').on('click', function() {
            document.getElementById('customConfirmMessage').innerHTML = `Do you want to delete the link: <strong>[${linkInfo}]</strong>?`;
            document.getElementById('customConfirmModal').style.display = 'flex';
            document.getElementById('confirmYes').onclick = function() {
                deleteLink(linkID);
                links = links.filter(link => link.id !== linkID);
                updateGraph(Object.values(nodes), Object.values(links), undefined, positions, toggle);
                document.getElementById('customConfirmModal').style.display = 'none'; 
            };
            document.getElementById('confirmNo').onclick = function() {
                document.getElementById('customConfirmModal').style.display = 'none'; 
            };
            d3.select('#linkMenu').style('display', 'none');
        });
        d3.select('#linkMenuOption3').on('click', function() {
            let link = links.find(link => link.id === linkID);
            let originalSourceName = nodes.find(node => node.id === link.startNode).properties.name;
            let originalTargetName = nodes.find(node => node.id === link.endNode).properties.name;
            
            let newLinkInfo = `${originalTargetName} -> ${originalSourceName}`;
        
            document.getElementById('customConfirmMessage').innerHTML = `Do you want to change the direction of the link: <strong>[${linkInfo}]</strong>?<br> The new link will be: <strong>[${newLinkInfo}]</strong>`;
            document.getElementById('customDirectionModal').style.display = 'flex';
            
            document.getElementById('changeDirYes').onclick = async function() {
                let originalSource = link.startNode;
                let originalTarget = link.endNode;
                let originalDistance = link.properties.distance;
                
                deleteLink(linkID);
                links = links.filter(link => link.id !== linkID);
                
                await addLink(originalTarget, originalSource, originalDistance);
                await new Promise(resolve => setTimeout(resolve, 500));
                let newLink = await findLinkByNodes(originalTarget, originalSource);
                if (newLink) {
                    const sourceNode = nodes.find(node => node.id === originalTarget);
                    const targetNode = nodes.find(node => node.id === originalSource);
                    newLink.source = sourceNode;
                    newLink.target = targetNode;
                    links.push(newLink);
                    simulation.force("link").links(links);
                    simulation.alpha(1).restart();
                    updateGraph(Object.values(nodes), Object.values(links), undefined, positions, toggle);
                }           
                
                document.getElementById('customDirectionModal').style.display = 'none';     
            };
            
            document.getElementById('changeDirNo').onclick = function() {
                document.getElementById('customDirectionModal').style.display = 'none'; 
            };
            
            d3.select('#linkMenu').style('display', 'none');
        });                        
        d3.select('body').on('click.linkMenu', function() {
            d3.select('#linkMenu').style('display', 'none');
            d3.select('body').on('click.linkMenu', null); 
        });
    });

    
    const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('g.node')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'node')
        .call(drag(simulation));

    node.append('circle')
        .attr('r', circleSize)
        .attr('fill', '#1B93E6')
        .attr('stroke', '#06548a')
        .attr('stroke-width', 3); 

    node
        .on('contextmenu', function(event, d) {
            if (isAnimation) return; 
            event.stopPropagation();
            d3.select('#linkMenu').style('display', 'none');
            d3.select('#backgroundMenu').style('display', 'none');
            event.preventDefault(); 
            let x = event.pageX;
            let y = event.pageY;
            let menuWidth = document.getElementById('contextMenu').offsetWidth;
            let menuHeight = document.getElementById('contextMenu').offsetHeight;
            let windowWidth = window.innerWidth;
            let windowHeight = window.innerHeight;      
            if (x + menuWidth > windowWidth) {
                x -= menuWidth;
            }
            if (y + menuHeight > windowHeight) {
                y -= menuHeight;
            }  
            let existingNameDisplay = document.getElementById('nodeNameDisplay');
            if(existingNameDisplay) {
                existingNameDisplay.innerHTML = 'Node: ' + d.properties.name + '<br>' + 'X=' + Math.round(d.x) + ' Y=' + Math.round(d.y);
            } else {
                document.getElementById('contextMenu').querySelector('#conextMenuList').insertAdjacentHTML('beforebegin', '<div id="nodeNameDisplay">Node ' + d.properties.name + ':<br>X=' + Math.round(d.x) + ' Y=' + Math.round(d.y) + '</div>');
            }
            d3.select('#contextMenu')
                .style('left', x + 'px')
                .style('top', y + 'px')
                .style('display', 'block');
            d3.select('#contextMenuOption1').on('click', function() {
                document.getElementById('nodeNameToRename').innerHTML = `<strong>${d.properties.name}</strong>`;
                document.getElementById('renameNodeModal').style.display = 'flex'; 
                document.getElementById('renameNodeWarning').style.display = 'none';
                document.getElementById('renameNodeWarning').textContent = '';              
                document.getElementById('renameNodeConfirm').onclick = function() {
                    let userInput = document.getElementById('newNodeNameInput').value.trim();
                    const isNumeric = /^[0-9]+$/.test(userInput);        
                    if (!userInput) {
                        document.getElementById('renameNodeWarning').textContent = 'Node name cannot be empty.';
                        document.getElementById('renameNodeWarning').style.display = 'block';
                        return;
                    }
                    if (isNumeric) {
                        document.getElementById('renameNodeWarning').textContent = 'Node name cannot be a number.';
                        document.getElementById('renameNodeWarning').style.display = 'block';
                        return;
                    }
                    if (allNodes.includes(userInput.toUpperCase())) {
                        document.getElementById('renameNodeWarning').textContent = 'Node with that name already exists!';
                        document.getElementById('renameNodeWarning').style.display = 'block';
                        return;
                    }
                    let updatedNode = nodes.find(node => node.id === d.id);
                    if (updatedNode) {
                        updatedNode.properties.name = userInput.toUpperCase();
                        updateNodeName(d.id, userInput.toUpperCase()); 
                        updateGraph(Object.values(nodes), Object.values(links), undefined, positions,toggle);
                    }
                    document.getElementById('renameNodeModal').style.display = 'none'; 
                    document.getElementById('newNodeNameInput').value = ''; 
                };
                document.getElementById('renameNodeCancel').onclick = function() {
                    document.getElementById('renameNodeModal').style.display = 'none'; 
                    document.getElementById('renameNodeWarning').style.display = 'none';
                    document.getElementById('newNodeNameInput').value = ''; 
                };
                d3.select('#contextMenu').style('display', 'none');
            });
            d3.select('#contextMenuOption2').on('click', async function() {
                let dropdownNodes = document.getElementById('targetNodeDropdown');
                let relDistanceInput = document.getElementById('relationshipDistanceInput');
                let confButton = document.getElementById('createRelationshipConfirm');
                dropdownNodes.style.display = 'block';
                relDistanceInput.style.display = 'block';
                confButton.style.display = 'block';

                let sourceNodeID = d.id;
                document.getElementById('selectedNodeName').textContent = `${d.properties.name}`;
                document.getElementById('createRelationshipModal').style.display = 'flex';

                let relatedNodes = links.filter(link => (link.startNode === sourceNodeID || link.endNode === sourceNodeID))
                                        .map(link => (link.startNode === sourceNodeID ? link.endNode : link.startNode));

                let possibleChoices = nodes.filter(node => node.id !== sourceNodeID && !relatedNodes.includes(node.id))
                                        .map(node => node.properties.name)
                                        .sort();

                console.log("possible choices:", possibleChoices);

                let dropdown = document.getElementById('targetNodeDropdown');
                dropdown.innerHTML = ''; 
                possibleChoices.forEach(choice => {
                    let option = document.createElement('option');
                    option.value = choice;
                    option.textContent = choice;
                    dropdown.appendChild(option);
                });
                if (possibleChoices.length === 0) {
                    console.log("ovde");
                    let warning = document.getElementById('relationshipWarning');
                    warning.textContent = "This node is already connected to all other nodes.";
                    warning.style.display = 'block';

                    let dropdownNodes = document.getElementById('targetNodeDropdown');
                    let relDistanceInput = document.getElementById('relationshipDistanceInput');
                    dropdownNodes.style.display = 'none';
                    relDistanceInput.style.display = 'none';
                    confButton.style.display = 'none';

                    
                }else{                
                document.getElementById('createRelationshipConfirm').onclick = async function() {
                    let targetNodeName = dropdown.value.trim().toUpperCase();
                    let targetNode = nodes.find(node => node.properties.name === targetNodeName); 
                    let warning = document.getElementById('relationshipWarning');
                    warning.style.display = 'none'; 
                    warning.textContent = '';
                    if (!targetNode) {
                        if (possibleChoices.length !== 0) {
                            console.log("izbori",possibleChoices.length);
                            warning.textContent = "Target node not found. Please select a valid node name.";
                            warning.style.display = 'block';
                            return;
                        }
                        return;
                    }
                    let newWeightStr = document.getElementById('relationshipDistanceInput').value;
                    let newWeight = parseInt(newWeightStr);
                    if (!newWeightStr || isNaN(newWeight) || !isFinite(newWeight)) {
                        warning.textContent = "Please enter a valid integer number for the weight.";
                        warning.style.display = 'block';
                        return;
                    }
                    let existingLink = links.find(link => (link.startNode === sourceNodeID && link.endNode === targetNode.id) || (link.endNode === sourceNodeID && link.startNode === targetNode.id));
                    if (existingLink) {
                        warning.textContent = "A relationship between these nodes already exists.";
                        warning.style.display = 'block';
                        return;
                    }
                    await addLink(sourceNodeID, targetNode.id, newWeight);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    let newLink = await findLinkByNodes(sourceNodeID, targetNode.id);
                    if (newLink) {
                        const sourceNode = nodes.find(node => node.id === newLink.startNode);
                        newLink.source = sourceNode;
                        newLink.target = targetNode;
                        links.push(newLink);
                        simulation.force("link").links(links);
                        simulation.alpha(1).restart();
                        console.log("ovde");
                        console.log("POZICIJE TAMAN PRIJE DODAVANJA",globalNodePositions);
                        updateGraph(Object.values(nodes), Object.values(links),undefined,positions,toggle);
                        //home(); ???
                    }           
                    document.getElementById('createRelationshipModal').style.display = 'none';
                    warning.style.display = 'none'; 
                };}          
                document.getElementById('createRelationshipCancel').onclick = function() {
                    document.getElementById('createRelationshipModal').style.display = 'none';
                    document.getElementById('relationshipWarning').style.display = 'none'; 
                };            
                d3.select('#contextMenu').style('display', 'none');
            });            
            d3.select('#contextMenuOption3').on('click', function() {
                document.getElementById('nodeNameToDelete').innerHTML = `<strong>${d.properties.name}</strong>`;
                document.getElementById('deleteNodeConfirmModal').style.display = 'flex'; 
                document.getElementById('deleteNodeYes').onclick = async function() {
                    let nodeID = d.id;
                    deleteNode(nodeID);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    links = links.filter(link => link.source.id !== nodeID && link.target.id !== nodeID);
                    nodes = nodes.filter(node => node.id !== nodeID);
                    updateGraph(Object.values(nodes), Object.values(links),undefined,positions,toggle);
                    document.getElementById('deleteNodeConfirmModal').style.display = 'none'; 
                };
                document.getElementById('deleteNodeNo').onclick = function() {
                    document.getElementById('deleteNodeConfirmModal').style.display = 'none'; 
                };
                d3.select('#contextMenu').style('display', 'none'); 
            });
            d3.select('#contextMenuOption4').on('click', async function() {       
                        document.getElementById('customNodeInputModal').style.display = 'flex';               
                        document.getElementById('nodeNameConfirm').onclick = async function() {
                            let nodeName = document.getElementById('nodeNameInput').value.toUpperCase();  
                            const isNumeric3 = /^[0-9]+$/.test(nodeName);
                            if (isNumeric3) {
                                document.getElementById('newNodeWarning').textContent = 'Node name cannot be a number.';
                                document.getElementById('newNodeWarning').style.display = 'block';
                                return;
                            }   
                            if (!nodeName || nodeName.trim() === "") {
                                document.getElementById('newNodeWarning').textContent = 'Please input a valid node name!';
                                document.getElementById('newNodeWarning').style.display = 'block';
                                return;
                            }            
                            if (allNodes.includes(nodeName)) {
                                document.getElementById('newNodeWarning').textContent = 'Node with that name already exists!';
                                document.getElementById('newNodeWarning').style.display = 'block';
                                return;
                            }             
                            await addNode(nodeName);
                            await new Promise(resolve => setTimeout(resolve, 500));
                            let node = await findNodeByName(nodeName);
                            if (node) {
                                nodes.push(node);
                                allNodes = nodes.map(node => node.properties.name);
                                updateGraph(Object.values(nodes), Object.values(links),undefined,positions,toggle); 
                            } else {
                                console.log("node not found");
                            }              
                            document.getElementById('customNodeInputModal').style.display = 'none'; 
                            document.getElementById('nodeNameInput').value = ''; 
                        };               
                        document.getElementById('nodeNameCancel').onclick = function() {
                            document.getElementById('customNodeInputModal').style.display = 'none'; 
                            document.getElementById('newNodeWarning').style.display = 'none';
                            document.getElementById('nodeNameInput').value = ''; 
                        };
            });                         
                d3.select('body').on('click.backgroundMenu', function() {
                    d3.select('#backgroundMenu').style('display', 'none');
                    d3.select('body').on('click.backgroundMenu', null); 
                });
            });
            d3.select('body').on('click.contextMenu', function() {
                d3.select('#contextMenu').style('display', 'none');
                d3.select('body').on('click.contextMenu', null);
            });

    //node.append('circle')

    node.append('text')
        .text(d => d.properties.name)
        .attr('x', 0)
        .attr('y', 11)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Montserrat')
        .style('font-weight', 'bold')
        .style('font-size', 35)
        .style('stroke', 'black')
        .style('stroke-width', '3px')
        .style('opacity', 0.6);

    node.append('text')
        .text(d => d.properties.name)
        .attr('x', 0)
        .attr('y', 11)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-family', 'Arial')
        .style('font-weight', 'bold')
        .style('font-size', 35);
    
    node.append('text')
        .attr('class', 'node-coordinates')
        .attr('x', 0)
        .attr('y', -circleSize - 10) 
        .attr('text-anchor', 'middle')
        .style('font-family', 'Arial')
        .style('font-size', 14)
        .style('fill', 'black')
        .text(d => `X=${Math.round(d.x)} Y=${Math.round(d.y)}`);

    //num
    if(algorithm && ( (algorithm[0] !== 'Fleury')&&(algorithm[0] !== 'Hierholzer')&&(algorithm[0] !== 'Nearest Neighbor')&&(algorithm[0] !== 'Sorted Edges TSP')&&(algorithm[0] !== 'Kruskal')&&(algorithm[0] !== 'Prim'))){


        node.append('text')
            .attr('class', 'cost')
            .attr('x', 0)
            .attr('y', circleSize + 25)
            .attr('text-anchor', 'middle')
            .style('fill', 'red')
            .style('font-family', 'Arial')
            .style('font-size', 30)
            .style('font-weight', 'bold')
            .text('Infinity'); //ovde infinity
    }

    simulation.on('tick', () => {
            linkGroup.selectAll('line')
                .attr('x1', d => Math.max(circleSize, Math.min(width - circleSize, d.source.x)))
                .attr('y1', d => Math.max(circleSize, Math.min(height - circleSize, d.source.y)))
                .attr('x2', d => Math.max(circleSize, Math.min(width - circleSize, d.target.x)))
                .attr('y2', d => Math.max(circleSize, Math.min(height - circleSize, d.target.y)));
            linkGroup.selectAll('rect')
                .attr('transform', d => {
                    const x = (Math.max(circleSize, Math.min(width - circleSize, d.source.x)) + Math.max(circleSize, Math.min(width - circleSize, d.target.x))) / 2;
                    const y = (Math.max(circleSize, Math.min(height - circleSize, d.source.y)) + Math.max(circleSize, Math.min(height - circleSize, d.target.y))) / 2;
                    return `translate(${x-17},${y-15})`;
                });
            linkGroup.selectAll('text')
                .attr('x', d => {
                    const sourceX = Math.max(circleSize, Math.min(width - circleSize, d.source.x));
                    const targetX = Math.max(circleSize, Math.min(width - circleSize, d.target.x));
                    return (sourceX + targetX) / 2;
                })
                .attr('y', d => {
                    const sourceY = Math.max(circleSize, Math.min(height - circleSize, d.source.y));
                    const targetY = Math.max(circleSize, Math.min(height - circleSize, d.target.y));
                    return (sourceY + targetY) / 2;
                })
                .attr('dx', d => {
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    return Math.abs(dx) > Math.abs(dy) ? '0.35em' : '1.35em';  //micanje broja
                })
                .attr('dy', d => {
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    return Math.abs(dx) > Math.abs(dy) ? '1.35em' : '0.35em';  
                });
                
            resolveCollisions(nodes);
        
            node.attr("transform", d => {
                d.x = Math.max(circleSize, Math.min(width - circleSize, d.x));
                d.y = Math.max(circleSize, Math.min(height - circleSize, d.y));
                return `translate(${d.x},${d.y})`;
            });
            node.selectAll('.node-coordinates')
                .text(d => `X=${Math.round(d.x)} Y=${Math.round(d.y)}`);

        });
        
        
    
   function drag(simulation) {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart(); 
            //d3.select(this).raise().attr("stroke", "yellow");
            d.fx = d.x; 
            d.fy = d.y; 
        }

        function dragged(event, d) {
            d.fx = event.x; 
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d3.select(this).attr("stroke", null); 
            resolveCollisions(nodes);
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    node.call(drag(simulation));

    d3.select('body').on('click', function(event) {
        if (event.button !== 2) { // 2 je desni mis
            d3.select('#contextMenu').style('display', 'none');
            d3.select('#backgroundMenu').style('display', 'none');
            d3.select('#linkMenu').style('display', 'none');
        }
    });
    
    let lastLoggedPositions = {};
    let positionLogger;

    function logNodePositions() {
        let positions = {};
        let isDiff = false;
    
        nodes.forEach(node => {
            const nodeName = node.properties.name;
            const currentX = node.fx || node.x;
            const currentY = node.fy || node.y;
    
            positions[nodeName] = { x: currentX, y: currentY };
    
            if (!lastLoggedPositions[nodeName] || lastLoggedPositions[nodeName].x !== currentX || lastLoggedPositions[nodeName].y !== currentY) {
                isDiff = true;
            }
        });
    
        if (isDiff) {
            globalNodePositions = positions; 
            lastLoggedPositions = JSON.parse(JSON.stringify(positions));
            console.log("Node Positions:", positions);
        }
        return positions; 
    }    
           
    // svako 2 sec
    positionLogger = setInterval(() => {
        let positions = logNodePositions();  
        // document.querySelectorAll('.node').forEach(node => {
        //     const nodeNameDisplay = document.getElementById('nodeNameDisplay');
        //     const nodeData = d3.select(node).data()[0];
        //     if (nodeNameDisplay && nodeData) {
        //         nodeNameDisplay.innerHTML = `Node: ${nodeData.properties.name} x=${Math.round(nodeData.x)} y=${Math.round(nodeData.y)}`;
        //     }
        // });
        //console.log("Node Positions 2:", positions);
    }, 2000);
    //console.log("globalNodePositions:", globalNodePositions);

    
    if (algorithm && path) {
        console.log("alg start");
        document.getElementById('algOngoing').style.display = 'flex';
        document.getElementById('openAlgorithmsWindow').disabled = true;
        document.getElementById('deleteAllButton').disabled = true;
        document.getElementById('addTemplateButton').disabled = true;
        document.getElementById('homeButton').disabled = true;
        document.getElementById('importExportButton').disabled = true;
        document.getElementById('toggleDir').disabled = true;
    
        setTimeout(() => {
            if (!animationInterrupted) {
                if (algorithm[0] === 'Dijkstra') {
                    dijkstraAnimation(path, algorithm[2]);
                } else if (algorithm[0] === 'Dijkstra All Paths') {
                    dijkstraAllPathsAnimation(path, algorithm[2]);
                } else if (algorithm[0] === 'A*') {
                    aStarAnimation(path, algorithm[2]);
                } else if (algorithm[0] === 'Greedy Best-First Search (GBFS)') {
                    gbfsAnimation(path, algorithm[2]);
                } else if (algorithm[0] === 'Bellman-Ford') {
                    bellmanFordAnimation(path, algorithm[2], algorithm[3], algorithm[4]);
                } else if (algorithm[0] === 'Breadth First Search (BFS)') {
                    bfsAnimation(path, algorithm[2]);
                } else if (algorithm[0] === 'Depth First Search (DFS)') {
                    dfsAnimation(path, algorithm[2]);
                } else if (algorithm[0] === 'Bellman-Ford All Paths') {
                    bellmanFordAllPathsAnimation(path, algorithm[2]);
                } else {
                    startAnimation(path);
                }
            }
        }, 2000);

        async function bellmanFordAllPathsAnimation(paths, costsAtEachStep) {
            isAnimation = true;
            animationInterrupted = false;
            console.log("BELLMAN-FORD ALL PATHS ANIMATION: ", isAnimation);

            const animateBellmanFord = async (pathSegment) => {
                let i = 0;
                for (const item of pathSegment) {
                    if (animationInterrupted) {
                        revertColors();
                        break;
                    } else {
                        if (typeof item === 'string') {
                            console.log("Highlight node name:", item);
                            svg.selectAll('g.node circle')
                                .filter(d => d.properties.name === item)
                                .transition()
                                .duration(500)
                                .attr('fill', '#ffea00');
                        } else if (Array.isArray(item)) {
                            console.log("Unhighlight items:", item);
                            for (const unhighlightItem of item) {
                                if (typeof unhighlightItem === 'string') {
                                    svg.selectAll('g.node circle')
                                        .filter(d => d.properties.name === unhighlightItem)
                                        .transition()
                                        .duration(500)
                                        .attr('fill', '#1B93E6');
                                } else {
                                    const linkId = String(unhighlightItem);
                                    console.log("Unhighlight link id:", linkId);
                                    svg.selectAll('.link line')
                                        .filter(d => d.id === linkId)
                                        .transition()
                                        .duration(1)
                                        .style('stroke', 'black')
                                        .attr('stroke-width', 3)
                                        .attr('marker-end', 'url(#arrowhead)');
                                }
                            }
                        } else {
                            const linkId = String(item);
                            console.log("Highlight link id:", linkId);
                            const selectedLinks = svg.selectAll('.link line')
                                .filter(d => d.id === linkId);
                            console.log("Selected links:", selectedLinks);
                            selectedLinks
                                .transition()
                                .duration(1)
                                .style('stroke', 'red')
                                .attr('stroke-width', 3)
                                .attr('marker-end', 'url(#arrowhead-red)');
                        }
                        i++;
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            };

            const updateCosts = async (costs) => {
                for (const [nodeName, cost] of costs) {
                    svg.selectAll('g.node text.cost')
                        .filter(d => d.properties.name === nodeName)
                        .text(cost);
                }
            };

            const resetCosts = async () => {
                svg.selectAll('g.node text.cost').text('Infinity');
            };

            let finishToEnd = false;
            let lastPathSegment = null;
            for (let i = 0; i < paths.length; i++) {
                if (animationInterrupted) {
                    break;
                }
                await animateBellmanFord(paths[i]);
                await updateCosts(costsAtEachStep[i]);
                lastPathSegment = paths[i];
                if (!finishToEnd) {
                    let continueAnimation;
                    do {
                        if (animationInterrupted) {
                            break;
                        }
                        continueAnimation = await showConfirmationModal();
                        revertColors();
                        await resetCosts();
                        if (continueAnimation === 'finishToEnd') {
                            finishToEnd = true;
                        } else if (continueAnimation === 'repeatLastPath') {
                            await animateBellmanFord(lastPathSegment);
                            await updateCosts(costsAtEachStep[i]);
                        }
                    } while (continueAnimation === 'repeatLastPath');
                    if (!continueAnimation) {
                        break;
                    }
                } else {
                    await new Promise(resolve => setTimeout(resolve, 750));
                }
                revertColors();
            }

            isAnimation = false;
            if (!isAnimation) {
                showEndAlgConfirm("Bellman-Ford All Paths");
            }
            console.log("BELLMAN-FORD ALL PATHS ANIMATION: ", isAnimation);
        }
                    

        async function dfsAnimation(path, steps) {
            isAnimation = true;
            animationInterrupted = false;
            console.log("DFS ANIMATION: ", isAnimation);
        
            const processedNodes = new Set();
            const processedLinks = new Set();
        
            const animateDFS = async (pathSegment) => {
                let i = 0;
                for (const item of pathSegment) {
                    if (animationInterrupted) {
                        console.log("Animation interrupted");
                        break;
                    } else {
                        console.log("path segment " + i + ": " + item);
                        if (typeof item === 'string') {
                            console.log("Highlight node name:", item);
        
                            const fillColor = processedNodes.has(item) ? '#d5ff8c' : '#ffea00';
        
                            svg.selectAll('g.node circle')
                                .filter(d => d.properties.name === item)
                                .transition()
                                .duration(500)
                                .attr('fill', fillColor);
        
                            if (!processedNodes.has(item)) {
                                svg.selectAll('g.node')
                                    .filter(d => d.properties.name === item)
                                    .select('text.cost')
                                    .text("Visited");
        
                                processedNodes.add(item);
                            }
                        } else if (Array.isArray(item)) {
                            console.log("Unhighlight items:", item);
                            for (const unhighlightItem of item) {
                                if (typeof unhighlightItem === 'string') {
                                    svg.selectAll('g.node circle')
                                        .filter(d => d.properties.name === unhighlightItem)
                                        .transition()
                                        .duration(500)
                                        .attr('fill', '#d5ff8c');
                                } else {
                                    const linkId = String(unhighlightItem);
                                    svg.selectAll('.link line')
                                        .filter(d => d.id === linkId)
                                        .transition()
                                        .duration(500)
                                        .style('stroke', 'green')
                                        .attr('stroke-width', 3)
                                        .attr('marker-end', 'url(#arrowhead)');
                                }
                            }
                        } else {
                            const linkId = String(item);
                            console.log("Highlight link id:", linkId);
                            svg.selectAll('.link line')
                                .filter(d => d.id === linkId)
                                .transition()
                                .duration(500)
                                .style('stroke', 'red')
                                .attr('stroke-width', 3)
                                .attr('marker-end', 'url(#arrowhead-red)');
        
                            processedLinks.add(linkId);
                        }
                        i++;
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            };
        
            for (let i = 0; i < steps.length; i++) {
                if (animationInterrupted) {
                    break;
                }
                await animateDFS(steps[i]);
            }
        
            isAnimation = false;
            if (!isAnimation) {
                showEndAlgConfirm(algorithm[0]);
            }
            console.log("DFS ANIMATION: ", isAnimation);
        }

        async function bfsAnimation(path, steps) {
            isAnimation = true;
            animationInterrupted = false;
            console.log("BFS ANIMATION: ", isAnimation);
        
            const processedNodes = new Set(); 
            const processedLinks = new Set(); 
        
            const animateBFS = async (pathSegment) => {
                let i = 0;
                for (const item of pathSegment) {
                    if (animationInterrupted) {
                        console.log("Animation interrupted");
                        break;
                    } else {
                        console.log("path segment " + i + ": " + item);
                        if (typeof item === 'string') {
                            console.log("Highlight node name:", item);
                            
                            const fillColor = processedNodes.has(item) ? '#d5ff8c' : '#ffea00';
        
                            svg.selectAll('g.node circle')
                                .filter(d => d.properties.name === item)
                                .transition()
                                .duration(500)
                                .attr('fill', fillColor);
                            
                            if (!processedNodes.has(item)) {
                                svg.selectAll('g.node')
                                    .filter(d => d.properties.name === item)
                                    .select('text.cost')
                                    .text("Visited");
        
                                processedNodes.add(item); 
                            }
                        } else if (Array.isArray(item)) {
                            console.log("Unhighlight items:", item);
                            for (const unhighlightItem of item) {
                                if (typeof unhighlightItem === 'string') {
                                    svg.selectAll('g.node circle')
                                        .filter(d => d.properties.name === unhighlightItem)
                                        .transition()
                                        .duration(500)
                                        .attr('fill', '#d5ff8c');
                                } else {
                                    const linkId = String(unhighlightItem);
                                    svg.selectAll('.link line')
                                        .filter(d => d.id === linkId)
                                        .transition()
                                        .duration(500)
                                        .style('stroke', 'green')
                                        .attr('stroke-width', 3)
                                        .attr('marker-end', 'url(#arrowhead)');
                                }
                            }
                        } else {
                            const linkId = String(item);
                            console.log("Highlight link id:", linkId);
                            svg.selectAll('.link line')
                                .filter(d => d.id === linkId)
                                .transition()
                                .duration(500)
                                .style('stroke', 'red')
                                .attr('stroke-width', 3)
                                .attr('marker-end', 'url(#arrowhead-red)');
        
                            processedLinks.add(linkId);
                        }
                        i++;
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            };
        
            for (let i = 0; i < steps.length; i++) {
                if (animationInterrupted) {
                    break;
                }
                await animateBFS(steps[i]);
            }
        
            isAnimation = false;
            if (!isAnimation) {
                showEndAlgConfirm(algorithm[0]);
            }
            console.log("BFS ANIMATION: ", isAnimation);
        }
        

        async function bellmanFordAnimation(path, costsAtEachStep, sourcesAtEachStep, fullPath) {
            isAnimation = true;
            animationInterrupted = false;
            console.log("BELLMAN-FORD ANIMATION: ", isAnimation);
        
            const animateBellmanFord = async (pathSegment, costs, sources) => {
                let i = 0;
                for (const item of pathSegment) {
                    if (animationInterrupted) {
                        console.log("Animation interrupted, reverting colors.");
                        revertColors();
                        break;
                    } else {
                        console.log("path segment " + i + ": " + item);
                        console.log("sources " ,sources);
                        console.log("costs " ,costs);
                        console.log(item + " is:" + typeof(item));
                        if (typeof item === 'string') {
                            console.log("Highlight node name:", item);
                            svg.selectAll('g.node circle')
                                .filter(d => d.properties.name === item)
                                .transition()
                                .duration(750)
                                .attr('fill', '#ffea00');
        
                            // if (sources.some(([src, tgt]) => tgt === item)) {
                            //     console.log("sources", sources);
                            //     console.log("item", item);
                            //     svg.selectAll('g.node')
                            //         .filter(d => d.properties.name === item)
                            //         .select('text.cost')
                            //         .text(costs.get(item));
                            // }
                        } else if (Array.isArray(item)) {
                            console.log("Unhighlight items:", item);
                            for (const unhighlightItem of item) {
                                if (typeof unhighlightItem === 'string') {
                                    svg.selectAll('g.node circle')
                                        .filter(d => d.properties.name === unhighlightItem)
                                        .transition()
                                        .duration(750)
                                        .attr('fill', '#1B93E6');
                                } else {
                                    const linkId = String(unhighlightItem);
                                    svg.selectAll('.link line')
                                        .filter(d => d.id === linkId)
                                        .transition()
                                        .duration(750)
                                        .style('stroke', 'black')
                                        .attr('stroke-width', 3)
                                        .attr('marker-end', 'url(#arrowhead)');
                                }
                            }
                        } else {
                            const linkId = String(item);
                            console.log("Highlight link id:", linkId);
                            svg.selectAll('.link line')
                                .filter(d => d.id === linkId)
                                .transition()
                                .duration(1)
                                .style('stroke', 'red')
                                .attr('stroke-width', 3)
                                .attr('marker-end', 'url(#arrowhead-red)');
            
                            const link = globalLinks.find(link => link.id === linkId);
                            const sourceNode = link.source.properties.name;
                            const targetNode = link.target.properties.name;
                            console.log("EEEEEEEEEEEEEEEsourceNode:", sourceNode);
                            console.log("EEEEEEEEEEEEEEEtargetNode:", targetNode);
            
                            if (sources.some(([src, tgt]) => src === sourceNode && tgt === targetNode)) {
                                console.log("Updating cost for targetNode", targetNode);
                                console.log("Updating cost for sourceNode", sourceNode);
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                svg.selectAll('g.node')
                                    .filter(d => d.properties.name === targetNode)
                                    .select('text.cost')
                                    .text(costs.get(targetNode));
                            }                           
                        }
                        i++;
                        await new Promise(resolve => setTimeout(resolve, 750));
                    }
                }
            };
        
            const mainPath = path.slice(0, -1);
            const finalFullPath = fullPath;
        
            console.log("finalFullPath", finalFullPath);
            console.log("mainPath", mainPath);
            console.log("costsAtEachStep", costsAtEachStep);
            console.log("sourcesAtEachStep", sourcesAtEachStep);
        
            const animateInitialCosts = async (costs) => {
                for (const [node, cost] of costs) {
                    svg.selectAll('g.node')
                        .filter(d => d.properties.name === node)
                        .select('text.cost')
                        .text(cost);
                }
            };
        
            await animateInitialCosts(costsAtEachStep[0]);
        
            for (let i = 0; i < mainPath.length; i++) {
                if (animationInterrupted) {
                    break;
                }
                await animateBellmanFord(mainPath[i], costsAtEachStep[i+1], sourcesAtEachStep[i]);
                revertColors();
            }
        
            const highlightFullPath = async (path) => {
                for (const item of path) {
                    console.log("item:", item);
        
                    if (typeof item === 'string') {
                        console.log("Highlight node name:", item);
                        svg.selectAll('g.node circle')
                            .filter(d => d.properties.name === item)
                            .transition()
                            .duration(750)
                            .attr('fill', '#ffea00');
                    } else {
                        const linkId = String(item);
                        console.log("Highlight link id:", linkId);
                        svg.selectAll('.link line')
                            .filter(d => d.id === linkId)
                            .transition()
                            .duration(1)
                            .style('stroke', 'red')
                            .attr('stroke-width', 3)
                            .attr('marker-end', 'url(#arrowhead-red)');
                    }
                    await new Promise(resolve => setTimeout(resolve, 750));
                }
            };
        
            if (!animationInterrupted) {
                console.log("Highlighting final full path");
                console.log("fullPath", finalFullPath);
                await highlightFullPath(finalFullPath);
            }
        
            isAnimation = false;
            if (!isAnimation) {
                showEndAlgConfirm(algorithm[0]);
            }
            console.log("BELLMAN-FORD ANIMATION: ", isAnimation);
        }
        

        async function gbfsAnimation(path, costsAtEachStep) {
            isAnimation = true;
            animationInterrupted = false;
            console.log("GBFS ANIMATION: ", isAnimation);
            console.log("Starting GBFS animation sequence.");
        
            const animateGBFS = async (pathSegment, costs) => {
                let i = 0;
                for (const item of pathSegment) {
                    if (animationInterrupted) {
                        console.log("222");
                        revertColors();
                        console.log("333");
                        break;
                    } else {
                        console.log("path segment " + i + ": " + item);
                        console.log(item + " is:" + typeof(item));
                        if (typeof item === 'string') {
                            console.log("Highlight node name:", item);
                            svg.selectAll('g.node circle')
                                .filter(d => d.properties.name === item)
                                .transition()
                                .duration(500)
                                .attr('fill', '#ffea00');
                            
                            const heuristic = costs.get(item);
                            svg.selectAll('g.node')
                                .filter(d => d.properties.name === item)
                                .select('text.cost')
                                .text(`h: ${heuristic}`);
                        } else if (Array.isArray(item)) {
                            console.log("Unhighlight items:", item);
                            for (const unhighlightItem of item) {
                                if (typeof unhighlightItem === 'string') {
                                    svg.selectAll('g.node circle')
                                        .filter(d => d.properties.name === unhighlightItem)
                                        .transition()
                                        .duration(500)
                                        .attr('fill', '#1B93E6');
                                } else {
                                    const linkId = String(unhighlightItem);
                                    svg.selectAll('.link line')
                                        .filter(d => d.id === linkId)
                                        .transition()
                                        .duration(500)
                                        .style('stroke', 'black')
                                        .attr('stroke-width', 3)
                                        .attr('marker-end', 'url(#arrowhead)');
                                }
                            }
                        } else {
                            const linkId = String(item);
                            console.log("Highlight link id:", linkId);
                            svg.selectAll('.link line')
                                .filter(d => d.id === linkId)
                                .transition()
                                .duration(500)
                                .style('stroke', 'red')
                                .attr('stroke-width', 3)
                                .attr('marker-end', 'url(#arrowhead-red)');
                        }
                        i++;
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            };
        
            let boundaryIndex = path.findIndex(item => !Array.isArray(item));
        
            if (boundaryIndex === -1) boundaryIndex = path.length; 
         
            const mainPath = path.slice(0, boundaryIndex);
            const finalFullPath = path.slice(boundaryIndex);
        
            for (let i = 0; i < mainPath.length; i++) {
                if (animationInterrupted) {
                    break;
                }
                await animateGBFS(mainPath[i], costsAtEachStep[i]);
                revertColors();
            }
        
            const highlightFullPath = async (path) => {
                for (const item of path) {
                    if (typeof item === 'string') {
                        console.log("Highlight node name:", item);
                        svg.selectAll('g.node circle')
                            .filter(d => d.properties.name === item)
                            .transition()
                            .duration(500)
                            .attr('fill', '#ffea00');
                    } else {
                        const linkId = String(item);
                        console.log("Highlight link id:", linkId);
                        svg.selectAll('.link line')
                            .filter(d => d.id === linkId)
                            .transition()
                            .duration(500)
                            .style('stroke', 'red')
                            .attr('stroke-width', 3)
                            .attr('marker-end', 'url(#arrowhead-red)');
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            };
        
            if (!animationInterrupted) {
                await highlightFullPath(finalFullPath);
            }
        
            isAnimation = false;
            if (!isAnimation) {
                showEndAlgConfirm(algorithm[0]);
            }
            console.log("GBFS ANIMATION: ", isAnimation);
        }
        
        async function aStarAnimation(path, costsAtEachStep) {
            isAnimation = true;
            animationInterrupted = false;
            console.log("A* ANIMATION: ", isAnimation);
            console.log("Starting A* animation sequence.");
        
            const animateAstar = async (pathSegment, costs) => {
                let i = 0;
                for (const item of pathSegment) {
                    if (animationInterrupted) {
                        console.log("222");
                        revertColors();
                        console.log("333");
                        break;
                    } else {
                        console.log("path segment " + i + ": " + item);
                        console.log(item + " is:" + typeof(item));
                        if (typeof item === 'string') {
                            console.log("Highlight node name:", item);
                            svg.selectAll('g.node circle')
                                .filter(d => d.properties.name === item)
                                .transition()
                                .duration(500)
                                .attr('fill', '#ffea00');
                            
                            const costObj = costs.get(item);
                            const sum = costObj.actual + costObj.heuristic;
            
                            svg.selectAll('g.node')
                                .filter(d => d.properties.name === item)
                                .select('text.cost')
                                .text(`g: ${costObj.actual} h: ${costObj.heuristic} sum: ${sum}`);
                        } else if (Array.isArray(item)) {
                            console.log("Unhighlight items:", item);
                            for (const unhighlightItem of item) {
                                if (typeof unhighlightItem === 'string') {
                                    svg.selectAll('g.node circle')
                                        .filter(d => d.properties.name === unhighlightItem)
                                        .transition()
                                        .duration(500)
                                        .attr('fill', '#1B93E6');
                                } else {
                                    const linkId = String(unhighlightItem);
                                    svg.selectAll('.link line')
                                        .filter(d => d.id === linkId)
                                        .transition()
                                        .duration(500)
                                        .style('stroke', 'black')
                                        .attr('stroke-width', 3)
                                        .attr('marker-end', 'url(#arrowhead)');
                                }
                            }
                        } else {
                            const linkId = String(item);
                            console.log("Highlight link id:", linkId);
                            svg.selectAll('.link line')
                                .filter(d => d.id === linkId)
                                .transition()
                                .duration(500)
                                .style('stroke', 'red')
                                .attr('stroke-width', 3)
                                .attr('marker-end', 'url(#arrowhead-red)');
                        }
                        i++;
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            };

            let boundaryIndex = path.findIndex(item => !Array.isArray(item));
        
            if (boundaryIndex === -1) boundaryIndex = path.length; 
        
            const mainPath = path.slice(0, boundaryIndex);
            const finalFullPath = path.slice(boundaryIndex);
        
            for (let i = 0; i < mainPath.length; i++) {
                if (animationInterrupted) {
                    break;
                }
                await animateAstar(mainPath[i], costsAtEachStep[i]);
                revertColors();
            }
        
            const highlightFullPath = async (path) => {
                for (const item of path) {
                    if (typeof item === 'string') {
                        console.log("Highlight node name:", item);
                        svg.selectAll('g.node circle')
                            .filter(d => d.properties.name === item)
                            .transition()
                            .duration(500)
                            .attr('fill', '#ffea00');
                    } else {
                        const linkId = String(item);
                        console.log("Highlight link id:", linkId);
                        svg.selectAll('.link line')
                            .filter(d => d.id === linkId)
                            .transition()
                            .duration(500)
                            .style('stroke', 'red')
                            .attr('stroke-width', 3)
                            .attr('marker-end', 'url(#arrowhead-red)');
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            };
        
            if (!animationInterrupted) {
                await highlightFullPath(finalFullPath);
            }
        
            isAnimation = false;
            if (!isAnimation) {
                showEndAlgConfirm(algorithm[0]);
            }
            console.log("A* ANIMATION: ", isAnimation);
        }
        
        

        function showConfirmationModal() {
            return new Promise((resolve) => {
                const modal = document.getElementById('confirmationModal');
                const confirmYes = document.getElementById('confirmYesAlgorithm');
                const confirmNo = document.getElementById('confirmNoAlgorithm');
                const finishToEnd = document.getElementById('finishToEnd');
                const repeatLastPath = document.getElementById('repeatLastPath');
    
                modal.style.display = 'flex';
    
                confirmYes.onclick = () => {
                    modal.style.display = 'none';
                    resolve(true);
                };
    
                confirmNo.onclick = () => {
                    modal.style.display = 'none';
                    resolve(false);
                };
    
                finishToEnd.onclick = () => {
                    modal.style.display = 'none';
                    resolve('finishToEnd');
                };
    
                repeatLastPath.onclick = () => {
                    modal.style.display = 'none';
                    resolve('repeatLastPath');
                };
            });
        }
    
        function showEndAlgConfirm(algName) {
            return new Promise(() => {
                const modal = document.getElementById('endAlgModel');
                const closeModal = document.getElementById('closeModal');
                const algMessage = document.getElementById('algMessage');
    
                algMessage.textContent = `The ${algName} algorithm has finished!`;
                modal.style.display = 'flex';
    
                document.getElementById('algOngoing').style.display = 'none';
                document.getElementById('openAlgorithmsWindow').disabled = false;
                document.getElementById('deleteAllButton').disabled = false;
                document.getElementById('addTemplateButton').disabled = false;
                document.getElementById('homeButton').disabled = false;
                document.getElementById('importExportButton').disabled = false;
                document.getElementById('toggleDir').disabled = false;
    
                closeModal.onclick = () => {
                    modal.style.display = 'none';
                };
            });
        }
    
        let animationInterrupted = false;
    
        function revertColors() {
            svg.selectAll('g.node circle')
                .transition()
                .attr('fill', "#1B93E6");
    
            svg.selectAll('.link line')
                .transition()
                .duration(0)
                .style('stroke', 'black')
                .attr('stroke-width', 3)
                .attr('marker-end', 'url(#arrowhead)');
        }
    
        document.getElementById('algOngoing-stop').addEventListener('click', () => { //stop algorithm
            animationInterrupted = true;
            document.getElementById('algOngoing').style.display = 'none';
            document.getElementById('confirmationModal').style.display = 'none'; 
            document.getElementById('openAlgorithmsWindow').disabled = false;
            document.getElementById('deleteAllButton').disabled = false;
            document.getElementById('addTemplateButton').disabled = false;
            document.getElementById('homeButton').disabled = false;
            document.getElementById('importExportButton').disabled = false;
            document.getElementById('toggleDir').disabled = false;
            revertColors();
            updateGraph(globalNodes, globalLinks, undefined, positions, toggle);
            showEndAlgConfirm(algorithm[0]); 
        });
    
        async function startAnimation(path) {
            isAnimation = true;
            animationInterrupted = false;
            console.log("ANIMACIJA: ", isAnimation);
            console.log("Starting animation sequence.");
    
            const animatePath = async (pathSegment) => {
                let i = 0;
                for (const item of pathSegment) {
                    if (animationInterrupted) {
                        console.log("222");
                        revertColors();
                        console.log("333");
                        break;
                    } else {
                        console.log("path segment " + i + ": " + item);
                        console.log(item + " is:" + typeof(item));
                        if (typeof item === 'string') {
                            console.log("Highlight node name:", item);
                            svg.selectAll('g.node circle')
                                .filter(d => d.properties.name === item)
                                .transition()
                                .duration(750) 
                                .attr('fill', '#ffea00');
                        } else {
                            const linkId = String(item);
                            console.log("Highlight link id:", linkId);
                            svg.selectAll('.link line')
                                .filter(d => d.id === linkId)
                                .transition()
                                .duration(750) 
                                .style('stroke', 'red')
                                .attr('stroke-width', 3)
                                .attr('marker-end', 'url(#arrowhead-red)');
                        }
                        i++;
                        await new Promise(resolve => setTimeout(resolve, 750)); 
                    }
                }
            };
    
            if (algorithm[0] === 'Dijkstra All Paths' || algorithm[0] === 'Bellman-Ford All Paths') {
                let finishToEnd = false;
                let lastPathSegment = null;
                for (const pathSegment of path) {
                    if (animationInterrupted) {
                        break;
                    }
                    await animatePath(pathSegment);
                    lastPathSegment = pathSegment;
                    if (!finishToEnd) {
                        let continueAnimation;
                        do {
                            if (animationInterrupted) {
                                break;
                            }
                            continueAnimation = await showConfirmationModal();
                            revertColors();
                            if (continueAnimation === 'finishToEnd') {
                                finishToEnd = true;
                            } else if (continueAnimation === 'repeatLastPath') {
                                await animatePath(lastPathSegment);
                            }
                        } while (continueAnimation === 'repeatLastPath');
                        if (!continueAnimation) {
                            break;
                        }
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 750)); 
                    }
                    revertColors();
                }
            } else {
                await animatePath(path);
            }
    
            isAnimation = false;
            if (!isAnimation) {
                showEndAlgConfirm(algorithm[0]);
            }
            console.log("ANIMACIJA: ", isAnimation);
        }
    
        async function dijkstraAnimation(path, costsAtEachStep) {
            isAnimation = true;
            animationInterrupted = false;
            console.log("DIJKSTRA ANIMACIJA: ", isAnimation);
            
        
            const animateDijkstra = async (pathSegment, costs) => {
                let i = 0;
                for (const item of pathSegment) {
                    if (animationInterrupted) {
                        console.log("222");
                        revertColors();
                        console.log("333");
                        break;
                    } else {
                        console.log("path segment " + i + ": " + item);
                        console.log(item + " is:" + typeof(item));
                        if (typeof item === 'string') {
                            console.log("Highlight node name:", item);
                            svg.selectAll('g.node circle')
                                .filter(d => d.properties.name === item)
                                .transition()
                                .duration(500)
                                .attr('fill', '#ffea00');
                            
                            svg.selectAll('g.node')
                                .filter(d => d.properties.name === item)
                                .select('text.cost')
                                .text(costs.get(item));
                        } else if (Array.isArray(item)) {
                            console.log("Unhighlight items:", item);
                            for (const unhighlightItem of item) {
                                if (typeof unhighlightItem === 'string') {
                                    svg.selectAll('g.node circle')
                                        .filter(d => d.properties.name === unhighlightItem)
                                        .transition()
                                        .duration(500)
                                        .attr('fill', '#1B93E6');
                                } else {
                                    const linkId = String(unhighlightItem);
                                    svg.selectAll('.link line')
                                        .filter(d => d.id === linkId)
                                        .transition()
                                        .duration(500)
                                        .style('stroke', 'black')
                                        .attr('stroke-width', 3)
                                        .attr('marker-end', 'url(#arrowhead)');
                                }
                            }
                        } else {
                            const linkId = String(item);
                            console.log("Highlight link id:", linkId);
                            svg.selectAll('.link line')
                                .filter(d => d.id === linkId)
                                .transition()
                                .duration(500)
                                .style('stroke', 'red')
                                .attr('stroke-width', 3)
                                .attr('marker-end', 'url(#arrowhead-red)');
                        }
                        i++;
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            };
        
            let boundaryIndex = path.findIndex(item => !Array.isArray(item));
        
            if (boundaryIndex === -1) boundaryIndex = path.length; 
        
            const mainPath = path.slice(0, boundaryIndex);
            const finalFullPath = path.slice(boundaryIndex);
        
            for (let i = 0; i < mainPath.length; i++) {
                if (animationInterrupted) {
                    break;
                }
                await animateDijkstra(mainPath[i], costsAtEachStep[i]);
                revertColors();
            }
        
            const highlightFullPath = async (path) => {
                for (const item of path) {
                    if (typeof item === 'string') {
                        console.log("Highlight node name:", item);
                        svg.selectAll('g.node circle')
                            .filter(d => d.properties.name === item)
                            .transition()
                            .duration(500)
                            .attr('fill', '#ffea00');
                    } else {
                        const linkId = String(item);
                        console.log("Highlight link id:", linkId);
                        svg.selectAll('.link line')
                            .filter(d => d.id === linkId)
                            .transition()
                            .duration(500)
                            .style('stroke', 'red')
                            .attr('stroke-width', 3)
                            .attr('marker-end', 'url(#arrowhead-red)');
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            };
        
            if (!animationInterrupted) {
                await highlightFullPath(finalFullPath);
            }
        
            isAnimation = false;
            if (!isAnimation) {
                showEndAlgConfirm(algorithm[0]);
            }
            console.log("DIJKSTRA ANIMACIJA: ", isAnimation);
        }
        async function dijkstraAllPathsAnimation(paths, costsAtEachStep) {
            isAnimation = true;
            animationInterrupted = false;
            console.log("DIJKSTRA ALL PATHS ANIMATION: ", isAnimation);

            const animateDijkstra = async (pathSegment) => {
                let i = 0;
                for (const item of pathSegment) {
                    if (animationInterrupted) {
                        console.log("222");
                        revertColors();
                        console.log("333");
                        break;
                    } else {
                        console.log("path segment " + i + ": " + item);
                        console.log(item + " is:" + typeof(item));
                        if (typeof item === 'string') {
                            console.log("Highlight node name:", item);
                            svg.selectAll('g.node circle')
                                .filter(d => d.properties.name === item)
                                .transition()
                                .duration(500)
                                .attr('fill', '#ffea00');
                        } else if (Array.isArray(item)) {
                            console.log("Unhighlight items:", item);
                            for (const unhighlightItem of item) {
                                if (typeof unhighlightItem === 'string') {
                                    svg.selectAll('g.node circle')
                                        .filter(d => d.properties.name === unhighlightItem)
                                        .transition()
                                        .duration(500)
                                        .attr('fill', '#1B93E6');
                                } else {
                                    const linkId = String(unhighlightItem);
                                    svg.selectAll('.link line')
                                        .filter(d => d.id === linkId)
                                        .transition()
                                        .duration(500)
                                        .style('stroke', 'black')
                                        .attr('stroke-width', 3)
                                        .attr('marker-end', 'url(#arrowhead)');
                                }
                            }
                        } else {
                            const linkId = String(item);
                            console.log("Highlight link id:", linkId);
                            svg.selectAll('.link line')
                                .filter(d => d.id === linkId)
                                .transition()
                                .duration(500)
                                .style('stroke', 'red')
                                .attr('stroke-width', 3)
                                .attr('marker-end', 'url(#arrowhead-red)');
                        }
                        i++;
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            };

            const updateCosts = async (costs) => {
                for (const [nodeName, cost] of costs) {
                    svg.selectAll('g.node text.cost')
                        .filter(d => d.properties.name === nodeName)
                        .text(cost);
                }
            };

            const resetCosts = async () => {
                svg.selectAll('g.node text.cost').text(d => d.properties.cost === Infinity ? 'Infinity' : d.properties.cost);
            };            

            let finishToEnd = false;
            let lastPathSegment = null;
            for (let i = 0; i < paths.length; i++) {
                if (animationInterrupted) {
                    break;
                }
                await animateDijkstra(paths[i]);
                await updateCosts(costsAtEachStep[i]);
                lastPathSegment = paths[i];
                if (!finishToEnd) {
                    let continueAnimation;
                    do {
                        if (animationInterrupted) {
                            break;
                        }
                        continueAnimation = await showConfirmationModal();
                        revertColors();
                        await resetCosts();
                        if (continueAnimation === 'finishToEnd') {
                            finishToEnd = true;
                        } else if (continueAnimation === 'repeatLastPath') {
                            await animateDijkstra(lastPathSegment);
                            await updateCosts(costsAtEachStep[i]);
                        }
                    } while (continueAnimation === 'repeatLastPath');
                    if (!continueAnimation) {
                        break;
                    }
                } else {
                    await new Promise(resolve => setTimeout(resolve, 750));
                }
                revertColors();
            }

            isAnimation = false;
            if (!isAnimation) {
                showEndAlgConfirm(algorithm[0]);
            }
            console.log("DIJKSTRA ALL PATHS ANIMATION: ", isAnimation);
        }
    }

    console.log("animacija", isAnimation);
    node
        .on("mouseover", function(event, d) {
            if(!isAnimation){
                let currentColor = d3.select(this).select("circle").style("fill");
                let darkerColor = d3.rgb(currentColor).darker(2).toString();
                d3.select(this).select("circle").style("fill", darkerColor);}
            }
        )
        .on("mouseout", function(event, d) {
            if(!isAnimation){
                let currentColor = d3.select(this).select("circle").style("fill");
                let lighterColor = d3.rgb(currentColor).brighter(2).toString();
                d3.select(this).select("circle").style("fill", lighterColor);}       
            }
         );
};

function resolveCollisions(nodes) {
    const padding = 2; 
    const radius = circleSize + padding; 
    for (let i = 0; i < nodes.length; ++i) {
        for (let j = i + 1; j < nodes.length; ++j) {
            const nodeA = nodes[i];
            const nodeB = nodes[j];

            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = radius * 2;

            if (distance < minDistance) {
                const angle = Math.atan2(dy, dx);
                const overlap = minDistance - distance;

                nodeA.x -= overlap * Math.cos(angle) / 2;
                nodeA.y -= overlap * Math.sin(angle) / 2;
                nodeB.x += overlap * Math.cos(angle) / 2;
                nodeB.y += overlap * Math.sin(angle) / 2;
            }
        }
    }
}
