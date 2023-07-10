const form = document.getElementById("shopping-form");
const item = document.getElementById("item");
const amount = document.getElementById("amount");
const message = document.getElementById("message");
let shoppingList = document.getElementById("shopping-list");
let total = document.querySelector(".total");

form.addEventListener("submit", function (e) {
  validateItem();
  calculateCost();
  e.preventDefault();
});

shoppingList.addEventListener("click", deleteItem);

function validateItem() {
  if (item.value !== "" && amount.value !== "" && parseFloat(amount.value)) {
    addItem();
  } else if (
    item.value === "" &&
    (amount.value === "" || !parseFloat(amount.value))
  ) {
    item.classList.add("error");
    amount.classList.add("error");
    setMessage(
      "Please complete all fields. Item price must be a numerical value",
      "error"
    );
  } else if (amount.value === "" || !parseFloat(amount.value)) {
    amount.classList.add("error");
    setMessage(
      "Please complete all fields. Item price must be a numerical value",
      "error"
    );
  } else {
    item.classList.add("error");
    setMessage("Please complete all fields", "error");
  }

  setTimeout(function () {
    item.classList.remove("error");
    amount.classList.remove("error");
    message.innerText = "";
    message.classList.remove("error");
  }, 2000);
}

function addItem() {
  let row = document.createElement("tr");
  row.innerHTML = `<td class="one column"><i class="far fa-trash-alt delete-item"></i></td>
                    <td class="eight columns">${item.value}</td>
                    <td class="three columns price">${amount.value}</td>`;
  shoppingList.appendChild(row);
  setMessage(`${item.value} successfully added.`, "success");

  setTimeout(function () {
    message.innerText = "";
    message.classList.remove("success");
  }, 1000);
  item.value = "";
  amount.value = "";
}

function deleteItem(e) {
  if (e.target.classList.contains("delete-item")) {
    e.target.parentNode.parentNode.remove();
    console.log(shoppingList);
    calculateCost();
    setMessage("Item deleted", "success");
    setTimeout(function () {
      message.innerText = "";
      message.classList.remove("success");
    }, 1000);
  }
}

function calculateCost() {
  let subTotal = 0;
  for (var i = 0, row; (row = shoppingList.rows[i]); i++) {
    for (var j = 0, cell; (cell = row.cells[j]); j++) {
      if (cell.classList.contains("price")) {
        subTotal += parseFloat(cell.innerText);
      }
    }
  }
  total.innerText = "£" + subTotal.toFixed(2);
  if (subTotal > 0) {
    total.classList.add("cost");
  } else {
    total.classList.remove("cost");
  }
}

function setMessage(messageText, messageClass) {
  message.innerHTML = `
        <p>${messageText}</p>
    `;
  message.classList.add(`${messageClass}`);
}
