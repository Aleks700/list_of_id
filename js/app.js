$(document).foundation();

if (window.File && window.FileReader && window.FileList && window.Blob) {
  let globalXMLName = "";
  const getDatas = () => {
    function download(filename, text) {
      var element = document.createElement("a");
      element.setAttribute(
        "href",
        // "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +

        "data:text/plain;charset=utf-8," + encodeURIComponent(text)
      );
      element.setAttribute("download", filename);

      element.style.display = "none";
      document.body.appendChild(element);
      element.click();

      document.body.removeChild(element);
    }
    const datas = document.getElementsByClassName("checkboxes");
    const newData = [];
    console.log(datas);
    typeof datas;
    const needtext = "";
    for (i = 0; i < datas.length; i++) {
      if (datas[i].checked) {
        const j = datas[i].value.replace("next", "\t");
        console.log(typeof j);
        newData.push(j);
        console.log(typeof j[0]);
        // needtext = needtext + j[0];
        // needtext.concat(j[0] + " " + j[1] + "\n");
      }
    }
    console.log(newData.join("\n"));
    let text = newData.join("\n");
    ("hi mom\tnew new many text\nhi mom\tnew new many text\nhi mom\tnew new many text\n");
    let filename = "hello.txt";
    // let a = fileReq.split(".");
    // console.log("its a ", globalXMLName[0]);
    download(globalXMLName[0], text);
  };
  document.getElementById("push").addEventListener("click", getDatas);
  // Great success! All the File APIs are supported.
  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    if (typeof window.DOMParser != "undefined") {
      parseXml = function (xmlStr) {
        return new window.DOMParser().parseFromString(xmlStr, "text/xml");
      };
    } else if (
      typeof window.ActiveXObject != "undefined" &&
      new window.ActiveXObject("Microsoft.XMLDOM")
    ) {
      parseXml = function (xmlStr) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
      };
    } else {
      throw new Error("No XML parser found");
    }

    // Loop through the FileList
    var output = [];

    for (var i = 0, f; (f = files[i]); i++) {
      try {
        //some information regarding the file
        // output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
        //     	f.size, ' bytes, last modified: ',
        //     	f.lastModifiedDate.toLocaleDateString(), '</li>');
        //     	document.getElementById('properties').innerHTML = '<ul>' + output.join('') + '</ul>';

        var fileReq = f.name; // + "<small>(created" + f.lastModifiedDate.toLocaleDateString() +")</small>";
        globalXMLName = fileReq.split(".");
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function (theFile) {
          return function (e) {
            // Print the contents of the file
            try {
              var xml = parseXml(e.target.result);

              var zones = xml.getElementsByTagName("zone");
              var strips = xml.getElementsByTagName("strips");

              var acquisitionStrip =
                xml.getElementsByTagName("acquisitionStrip");
              //lengths to count and width is const
              var lengths = 0;
              var width = parseFloat(
                acquisitionStrip[0].firstElementChild.getAttribute("width")
              );
              //firstElementChild - because proper length and width is in the first "zone" tag not other child "zone" tags

              //Area for each square in a table
              var tableForStripsarea =
                "<caption><h4>Each stripe's area</h4><br/></caption><tr><th>Check</th><th>#</th><th>ID</th><th>Name</th><th>Latitude</th><th>Longitude</th><th>Stripe name</th></tr>";

              var counter = 0;
              const outputData = {};
              for (let i = 0; i < strips.length; i++) {
                var planTrials = strips[i].getElementsByTagName("planTrials");
                var last_planTrial = planTrials[planTrials.length - 1];
                var target = last_planTrial.children[1];
                var zone = target.firstElementChild;
                var targetURL = target.getAttribute("acquisitionURL");
                var stripName;
                if (targetURL != null) {
                  // console.log(targetURL, "first string");
                  const replacer = targetURL.split("/").reverse();
                  // console.log(replacer, "replacer");

                  // console.log(replacer[0], "our neeeeeded string");

                  stripName = targetURL.replace(
                    "http://hrmpcs01:8080/quicklook/",
                    ""
                  );
                  stripName = stripName.replace(
                    "http://hrmpcs02:8080/quicklook/",
                    ""
                  );
                  stripName = replacer[0].replace("_QUICKLOOK.JPG", " ");
                  // console.log(stripName, "strip name end");
                } else {
                  stripName = targetURL;
                }
                tableForStripsarea +=
                  `<tr ><td>` +
                  `<input type='checkbox'  class='checkboxes'  value=${
                    strips[i].getAttribute("requestName") + "next" + stripName
                  } id='s${i + 1}'></input>` +
                  "</td><td>" +
                  (i + 1) +
                  "</td><td >" +
                  strips[i].getAttribute("id") +
                  "</td><td class='strip_id'>" +
                  strips[i].getAttribute("requestName") +
                  "</td><td>" +
                  zone.firstElementChild.getAttribute("latitude") +
                  "</td><td>" +
                  zone.firstElementChild.getAttribute("longitude") +
                  "</td><td class='stripName'>" +
                  stripName;
                +"</td></tr>";
                lengths += parseFloat(
                  acquisitionStrip[i].firstElementChild.getAttribute("length")
                );
                counter +=
                  acquisitionStrip[i].firstElementChild.getAttribute("length") *
                  width;
              }

              // document.getElementById(
              //   "push"
              // ).innerHTML = `<button class="sendData" >Click me</button>`;
              console.log("Needed filename", fileReq);
              document.getElementById("result").innerHTML =
                "<br/><h3>Total area for <b>" +
                fileReq +
                "</b> = <b>" +
                (lengths * width)
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ") +
                "</b> sq.kms</h3><br/><hr/>";
              document.getElementById("tableForStripsarea").innerHTML =
                tableForStripsarea;
            } catch (e) {
              document.getElementById("errMsg").innerHTML = e.message;
            }
          };
        })(f);
        reader.readAsText(f);
        // document.getElementById('preview').innerHTML = reader.result;
      } catch (e) {
        document.getElementById("errMsg").innerHTML = e.message;
      }
    }
  }

  document
    .getElementById("files")
    .addEventListener("change", handleFileSelect, false);
} else {
  alert("The File APIs are not fully supported in this browser.");
}
