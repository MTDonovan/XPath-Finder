chrome.devtools.panels.elements.createSidebarPane("XPath", function (sidebar) {
  sidebar.setPage("devtools.html");

  function getElementXPath(element) {
    if (element.nodeType === Node.COMMENT_NODE) {
      return `//comment()[contains(., "${element.textContent.trim()}")]`;
    }
    if (element.id !== "") {
      return `//*[@id="${element.id}"]`;
    }
    if (element.className && element.className.trim() !== "") {
      return `//${element.tagName.toLowerCase()}[@class="${element.className.trim()}"]`;
    }
    if (element === document.body) {
      return `//${element.tagName.toLowerCase()}`;
    }

    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
      var sibling = siblings[i];
      if (sibling === element) {
        return (
          getElementXPath(element.parentNode) +
          "/" +
          element.tagName.toLowerCase() +
          "[" +
          (ix + 1) +
          "]"
        );
      }
      if (
        sibling.nodeType === 1 &&
        sibling.tagName.toLowerCase() === element.tagName.toLowerCase()
      ) {
        ix++;
      }
    }
    return "";
  }

  function updateSidebar() {
    chrome.devtools.inspectedWindow.eval(
      `(${getElementXPath.toString()})($0)`,
      function (result, isException) {
        if (isException) {
          // sidebar.setObject({ error: "Unable to retrieve element details" });
        } else {
          if (document.getElementById("xpath-input")) {
            let xpathInputElm = window.document.getElementById("xpath-input");
            xpathInputElm.value = result;
            if (xpathInputElm) {
              findTextByXPath(result);
            }
          }
        }
      }
    );
  }

  // Update sidebar when a different element is selected in the Elements panel
  chrome.devtools.panels.elements.onSelectionChanged.addListener(updateSidebar);

  // FIXME xpathInput is failing to be found when the devtools are initially opened.
  let xpathInput = window.document.getElementById("xpath-input");
  if (xpathInput) {
    xpathInput.addEventListener("input", function () {
      let xpathInputElm = window.document.getElementById("xpath-input");
      if (xpathInputElm) {
        prompt(`Log: ${xpathInputElm.value}`);
        findTextByXPath(xpathInputElm.value);
      }
    });
  }

  function findTextByXPath(xpath) {
    chrome.devtools.inspectedWindow.eval(
      `(() => {
          let result = document.evaluate("${xpath}", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          let output = '';
          for (let i = 0; i < result.snapshotLength; i++) {
            output += result.snapshotItem(i).textContent + "\\n";
          }
          return output;
        })()`,
      function (result, exception) {
        let xpathInputElm = window.document.getElementById("xpath-input");
        let resultsTextElm = window.document.getElementById("results-text");
        let countElm = window.document.getElementById("count");

        if (exception) {
          resultsTextElm.textContent = xpathInputElm.value
            ? `Not a valid XPath expression`
            : "";
          countElm.textContent = 0;
        } else {
          if (!result) {
            resultsTextElm.textContent = "";
            countElm.textContent = 0;
            return;
          }
          resultsTextElm.textContent = result;
          countElm.textContent = result.split("\n").length - 1;
        }
      }
    );
  }

  // Initial call to update the sidebar when the extension is loaded
  // updateSidebar();
});
