// Dictionary
const dict = {
    "en-GB": {
        "download": "Download as CSV",
        "people": "People",
        "empty": "Could not find any people."
    },
    "en-US": {
        "download": "Download as CSV",
        "people": "People",
        "empty": "Could not find any people."
    },
    "en-AU": {
        "download": "Download as CSV",
        "people": "People",
        "empty": "Could not find any people."
    },
    "en-CA": {
        "download": "Download as CSV",
        "people": "People",
        "empty": "Could not find any people."
    },
    "nb": {
        "download": "Last ned som CSV",
        "people": "Personer",
        "empty": "Kunne ikke finne noen personer."
    },
    "nb-x-k12": {
        "download": "Last ned som CSV",
        "people": "Personer",
        "empty": "Kunne ikke finne noen personer."
    },
    "de": {
        "download": "Als CSV herunterladen",
        "people": "Personen",
        "empty": "Konnte keine Personen finden."
    }
}

function i18n(word){
    const systemDefault = "nb";
    let locale = "";
    try{
        locale = ENV.LOCALE;
    } catch (error) {
        console.error("Unable to retrieve locale from ENV: ", error);
        locale = systemDefault;
    }

    let localeDictionary = dict[locale];
    return localeDictionary[word] || word;

}

function hasLabel(el){
    let label = el.querySelector(".label");
    if(label){
        return true;
    } else {
        return false;
    }
}

function hasDivs(el){
    let divs = el.querySelectorAll("div");
    return divs.length > 1;
}

function processDivs(col){
    let divData = "";
    let divs = col.querySelectorAll("div");
    // Add the divs sequentially with a space
    for(const div of divs){
        divData = divData + div.outerText + " | ";
    }
    // Remove the last space and separator
    return (divData.slice(0,divData.length - 2) + ";");
}

function processLabels(col){
    // This column has a label, likely the person has been invited but not accepted yet
    // Convert the string to array, pop off the label and join the remaining string.
    let ar = col.outerText.split(" ");
    let statusMsg = ar.pop();
    let dataWithoutLabel = ar.join(" ");
    return [statusMsg, dataWithoutLabel];
}

function downloadList(){
    const findPeople = setInterval(()=>{
        const rows = document.querySelectorAll("tr");
        const emptyState = document.querySelectorAll(".roster-empty-state");
        if(rows.length > 0){
            clearInterval(findPeople);
            let data = "";
            let status = false; // Add status such as "waiting" if someone has been invited by not yet accepted
            let statusMsg = "";
            const defaultStatus = "ok";


            for(const [i, row] of rows.entries()){
                let columns = Array.from(row.children);
                for(const [j, col] of columns.entries()){
                    // Skip first column:
                    if(j > 0){
                        // Not the last column
                        if(j < row.children.length -1){
                            // This is a header, just add it to data
                            if(col.scope){
                                data = data + col.outerText + ";";
                            } else{
                                // Not a header****************************************************
                                // We need to check if this cell contains more than one div, and if so, we need to combine them
                                if(hasDivs(col)){
                                    data = data + processDivs(col);
                                } else if(hasLabel(col)){
                                    let [status, dataWithoutLabel] = processLabels(col);
                                    statusMsg = status;
                                    data = data + dataWithoutLabel + ";";
                                }
                                else{
                                    data = data + col.outerText + ";";
                                }
                                // ****************************************************Not a header
                            }
                        } else {
                            // Last column
                            if(col.scope){
                                data = data + "Status;";;
                            } else {
                                // Not a header****************************************************
                                // Is there a status message?
                                if(statusMsg !== ""){
                                    data = data + statusMsg + ";";
                                    // Reset status message for next row
                                    statusMsg = "";
                                } else {
                                    data = data + defaultStatus + ";";
                                }
                                // ****************************************************Not a header
                            }
                        }
                    }
                }
                // End of row - remove the last ; and replace it with a line break
                data = data.slice(0,data.length - 1) + "\n";
            }
            // Create a blob from the data
            const blob = new Blob(["\uFEFF"+data], { type: 'text/csv;charset=UTF-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            let courseName = "";
            try{
                courseName = ENV.current_context.name;
            } catch(error){
                console.error("Unable to locate course name: ", error);
                courseName = "-";
            }
            a.download = i18n("people") + " " + courseName + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }else if(emptyState.length > 0){
            alert(i18n("empty"));
            clearInterval(findPeople);

        } else {
            console.log("Searching for people...");
        }
    },1000);
}

// Start by adding a download button
const addButton = setInterval(()=>{
    let place = document.getElementById("group_categories_tabs");
    if(place){
        // Stop looking for a place to add the button
        clearInterval(addButton);
        // Add a download button
        let dlbtn = document.createElement("button");
        dlbtn.innerText = i18n("download") ;
        dlbtn.classList.add("Button", "Button--primary");
        dlbtn.setAttribute("aria-label", i18n("download"));
        place.appendChild(dlbtn);
        dlbtn.addEventListener("click", ()=>{
            downloadList();
        });
    } else {
        console.log("Looking for a place to place a download button...");
    }
}, 1000);