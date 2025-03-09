(function init() {
  const formId = "fronty-giete";
  const DELIVERY = "delivery";
  const requiredFieldIds = ["name-surname", "email", "address", "phone", 
    "article", "border", "thickness", "color", "profile", DELIVERY, "zgoda-rodo"];

  function removeWarningOnClick(e) {
    const element = e.target;
    element.classList.remove("required-field-error");
  }

  function getFormData() {
    const form = getFormElement();
    const data = new FormData(form);
    return data;
  }
  
  function getFormEntries(data) {
    const entries = {};
    Array.from(data.entries()).forEach(function(entry) { entries[entry[0]] = entry[1] });
    return entries;
  }

  function getMissingRequiredFieldsList(data) {
    const missingFieldsList = requiredFieldIds.filter(function(entry) {
      return (data.get(entry) === "" || data.get(entry) === null);
    }) || [];
    const isRowSelected = data.get("color") === "surowe";
    if (!isRowSelected) {
      const colorSymbol = data.get("color-symbol");
      if (colorSymbol === "" || colorSymbol === null) {
        missingFieldsList.push("color-symbol");
      }
    }
    return missingFieldsList;
  }

  function removeRadiosErrorWarning() {
    const deliveryRadioButtons = document.querySelectorAll('[name="' + DELIVERY + '"]');
    deliveryRadioButtons.forEach(function(radio) {
      radio.classList.remove("required-field-error");
    });
  }

  function validateForm(data) {
    const missingFieldsList = getMissingRequiredFieldsList(data);
    missingFieldsList.forEach(function(field) {
      if (field === DELIVERY) {
        const deliveryRadioButtons = document.querySelectorAll('[name="' + DELIVERY + '"]');
        deliveryRadioButtons.forEach(function(radio) {
          radio.classList.add("required-field-error");
          radio.addEventListener("click", removeRadiosErrorWarning);
          radio.addEventListener("change", removeRadiosErrorWarning);
        });
      } else {
        const fieldElement = document.querySelector("[name=" + field + "]");
        fieldElement.classList.add("required-field-error");
        fieldElement.addEventListener("click", function() {
          fieldElement.classList.remove("required-field-error");
        });
        fieldElement.addEventListener("input", function() {
          fieldElement.classList.remove("required-field-error");
        });
        if (field === "zgoda-rodo") {
          const label = fieldElement.closest("label")
          label.classList.add("missing-field-label-error");
          label.addEventListener("click", function() {
            label.classList.remove("missing-field-label-error");
          });
          label.addEventListener("input", function() {
            label.classList.remove("missing-field-label-error");
          });
          fieldElement.addEventListener("click", function() {
            label.classList.remove("missing-field-label-error");
          });
        }
      }
    });
    return missingFieldsList.length === 0;
  }

  function showModal(id) {
    document.getElementById(id).showModal();
  }

  function closeModal(id) {
    document.getElementById(id).close();
  }

  function printForm(e) {
    e.preventDefault();
    const data = getFormData();
    if (validateForm(data)) {
      window.print();
    } else {
      showModal("invalid-form-warning");
    }
  }

  function submitForm(e) {
    e.preventDefault();
    const data = getFormData();
    if (validateForm(data)) {
      const entries = getFormEntries(data);
      let queriesString = "?";
      for (entry in entries) {
        if (entries[entry] !== "") {
          queriesString += entry + "=" + entries[entry] + "&";
        }
      }
      queriesString = queriesString.replace(/ /g, "%20").replace(/\n/g, "%0A").replace(/\r/g, "%0D");
      const emailAddress = 'zakupy@kobax.pl';
      const subject = "Formularz zamówienia frontów prostych";
      const body = encodeURIComponent(window.location.href + queriesString);
      window.location.href = "mailto:" + emailAddress + "?subject=" + subject + "&body=" + body;
    } else {
      showModal("invalid-form-warning");
    }
  }

  function resetForm() {
    const form = getFormElement();
    form.reset();
    localStorage.removeItem(formId);
    closeModal("reset-form-warning");
  }

  function createAllDoorSelectorsRows() {
    function createPrefixedDoorSelectorRow(prefix, from, to) {
      const row = document.querySelector(".row." + prefix + "-doors");
      const template = document.querySelector("#" + prefix + "-door-selector");

      for (let i = from; i <= to; i++) {
        const leftDoorSelector = template.content.cloneNode(true);
        const numberField = leftDoorSelector.querySelector(".number.field-container");
        numberField.innerText = i + ".";
        const idsToChange = ["width", "curvature", "height", "top-left", "top-right", "kind", "bottom-left", "bottom-right", "pieces"];
        idsToChange.forEach(function(id) {
          const container = leftDoorSelector.querySelector("." + id)
          if (container) {
            const field = container.querySelector("#" + id);
            field.id = prefix + "-door-" + id + "-" + i;
            field.name = prefix + "-door-" + id + "-" + i;
          }
        });
        row.appendChild(leftDoorSelector);
      }
    }

    createPrefixedDoorSelectorRow("left", 1, 4);
    createPrefixedDoorSelectorRow("right", 5, 8);
    createPrefixedDoorSelectorRow("concave", 9, 12);
  }

  function getFormElement() {
    return document.querySelector("#" + formId);
  }

  function switchToLockedForm(form) {
    form.classList.add("locked");
    const warningTextCell = document.querySelectorAll(".text-warning")[1];
    warningTextCell.innerHTML = '<strong class="visible-when-locked text-sm">FORMULARZ ZABLOKOWANY DO EDYCJI</strong>';
    document.querySelectorAll(".pointer-events-none").forEach(function(el) {
      el.classList.remove("pointer-events-none");
    });
  }

  function hideVisibleOnHover() {
    document.querySelectorAll(".visible-on-hover").forEach(function(el) {
      el.classList.add("hidden");
    });
  }

  function recoverQueryParams() {
    const queries = new URLSearchParams(window.location.search);
    if (queries.size) {
      const form = getFormElement();
      queries.forEach(function(value, key) {
        const element = form.querySelector("[name=" + key + "]");
        if (element) {
          if (element.type === "checkbox") {
            element.checked = true;
          } else {
            element.value = value;
          }
        }
      });
      switchToLockedForm(form);
      hideVisibleOnHover();
    }
  }

  function saveFormInLocalStorage() {
    const data = getFormData();
    const entries = getFormEntries(data);
    const notEmptyEntries = {};
    for (entry in entries) {
      if (entries[entry] !== "") {
        notEmptyEntries[entry] = entries[entry];
      }
    }
    localStorage.setItem(formId, JSON.stringify(notEmptyEntries));
  }

  function checkForDataInLocalStorage() {
    const entries = JSON.parse(localStorage.getItem(formId));
    if (entries) {
      const form = getFormElement();
      for (entry in entries) {
        const element = form.querySelector("[name=" + entry + "]");
        if (element) {
          if (element.type === "checkbox") {
            element.checked = true;
          } else if (element.type === "radio") {
            if (element.value === entries[entry]) {
              element.checked = true;
            }
          } else {
            element.value = entries[entry];
          }
        }
      }
    }
  }

  function setEventListeners() {
    requiredFieldIds.forEach(function(entry) {
      const element = document.querySelector("[name=" + entry + "]");
      element.addEventListener("click", removeWarningOnClick);
    });
    const printPageButton = document.getElementById("print-page");
    printPageButton.addEventListener("click", printForm);
    const sendOrderButton = document.getElementById("send-order");
    sendOrderButton.addEventListener("click", submitForm);
    document.querySelectorAll("dialog").forEach(function(dialog) {
      dialog.addEventListener("click", function() { closeModal(dialog.id) });
    });
    const form = getFormElement();
    form.addEventListener("change", function(e) {
      saveFormInLocalStorage();
      ifColorChangedToRawRemoveErrorInColorSymbolField(e)
    });
    const confirmResetFormButton = document.getElementById("confirm-form-reset");
    confirmResetFormButton.addEventListener("click", resetForm);
  }

  function ifColorChangedToRawRemoveErrorInColorSymbolField(e) {
    if (e.target.name === "color" && e.target.value === "surowe") {
      const colorSymbol = document.querySelector("[name=color-symbol]");
      colorSymbol.classList.remove("required-field-error");
    }
  }

  function start() {
    createAllDoorSelectorsRows();
    recoverQueryParams();
    checkForDataInLocalStorage();
    setEventListeners();
  }

  start();
})();