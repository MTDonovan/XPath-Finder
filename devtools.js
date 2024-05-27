chrome.devtools.panels.elements.createSidebarPane("XPath", function (sidebar) {
  sidebar.setObject({ some_data: "Some data to show" });
  sidebar.setPage("devtools.html");

  let xpathInput = window.document.getElementById("xpath-input");

  if (xpathInput) {
    window.document
      .getElementById("xpath-input")
      .addEventListener("input", function () {
        let xpathInputElm = window.document.getElementById("xpath-input");
        if (xpathInputElm) {
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
        if (exception) {
          let xpathInputElm = window.document.getElementById("xpath-input");
          let resultsTextElm = window.document.getElementById("results-text");
          let countElm = window.document.getElementById("count");

          resultsTextElm.textContent = xpathInputElm.value ? `${xpathInputElm.value} is not a valid XPath expression` : '';
          countElm.textContent = 0;
        } else {
          let resultsTextElm = window.document.getElementById("results-text");
          let countElm = window.document.getElementById("count");

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
});

// chrome.devtools.panels.elements.createSidebarPane(
//   "XPath",
//   "icons/icon48.png",
//   "devtools.html",
//   function (panel) {
//     panel.onShown.addListener(function (window) {
//       // TODO Figure out xpath retrieval.
//       // window.document
//       //   .getElementById("get-xpath")
//       //   .addEventListener("click", function () {
//       //     getXPathFromStorage();
//       //   });

//       // FIXME Should update results as query is typed.
//       // window.document
//       //   .getElementById("find-text")
//       //   .addEventListener("keyup", function () {
//       //     prompt("test");
//       //     let xpath = window.document.getElementById("xpath-input").value;
//       //     findTextByXPath(xpath);
//       //   });

//       // TODO Figure out xpath retrieval.
//       // function getXPathFromStorage() {
//       //   chrome.storage.local.get(["currentXPath"], function (result) {
//       //     if (result.currentXPath) {
//       //       window.document.getElementById("xpath-input").value =
//       //         result.currentXPath;
//       //     } else {
//       //       alert("No XPath found. Please click on an element first.");
//       //     }
//       //   });
//       // }
//     });
//   }
// );
