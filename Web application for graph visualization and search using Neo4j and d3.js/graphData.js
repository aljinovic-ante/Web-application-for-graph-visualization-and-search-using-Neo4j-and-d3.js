function showModal() {
    document.getElementById('deleteConfirmation').style.display = 'flex';
}

function hideModal() {
    document.getElementById('deleteConfirmation').style.display = 'none';
}

async function deleteAllConfirmed() {
    await deleteAll(); 
    submitQuery();   
    hideModal();    
}

let toggleState = false;
function sendToggleState() {
    toggleState = !toggleState;
    updateGraph(globalNodes,globalLinks,undefined,undefined,toggleState);
}