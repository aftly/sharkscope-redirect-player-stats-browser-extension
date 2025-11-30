chrome.runtime.onMessage.addListener((msg) => {
    // If not fill-and-submit message exit
    if (msg.type !== "fill-and-submit") return;

    const data = msg.payload;
    
    const networkButton = document.querySelector("#NetworkDropDown_ms");
    // If network button not found exit
    if (!networkButton) return;
    
    const playerField = document.querySelector("#FindString");
    // If network button not found exit
    if (!playerField) return;

    const submitButton = document.querySelector("#Player-Statistics-Button");
    // If network button not found exit
    if (!submitButton) return; 

    // Select network
    networkButton.click();
    const networkRadio = document.querySelector(
        `input[type="radio"][value="${data.network}"]`
    );
    networkRadio.click();

    // Set player field
    playerField.value = data.player;
    playerField.dispatchEvent(new Event("input", { bubbles: true }));

    // Submit form
    submitButton.click();
});