import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { db } from "./firebase.js";


let foods = [];
let meals = [];

let currentWeekStart = getMonday(new Date());

let selectedDate = null;
let selectedMealType = null;
let selectedPerson = "me";


const plannerBody = document.getElementById("plannerBody");
const foodList = document.getElementById("foodList");

const weekLabel = document.getElementById("weekLabel");
const currentWeek = document.getElementById("currentWeek");

const weekTotal = document.getElementById("weekTotal");
const plannedDays = document.getElementById("plannedDays");


/* -----------------------------
   ДАТЫ
----------------------------- */

function formatDate(date) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long"
  });
}


function formatShortDate(date) {
  return date.toISOString().split("T")[0];
}


function getMonday(date) {
  const result = new Date(date);
  const day = result.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
}


function getWeekDates() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + index);
    return date;
  });
}


function getMealName(type) {
  if (type === "breakfast") return "Завтрак";
  if (type === "lunch") return "Обед";
  return "Ужин";
}


/* -----------------------------
   FIRESTORE
----------------------------- */

async function loadFoods() {

  const snapshot = await getDocs(
    collection(db, "foods")
  );

  foods = snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));

  renderFoods();
  updateFoodSelect();
}


async function loadMeals() {

  const dates = getWeekDates().map(formatShortDate);

  meals = [];

  for (const date of dates) {

    const q = query(
      collection(db, "meals"),
      where("date", "==", date)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach(item => {
      meals.push({
        id: item.id,
        ...item.data()
      });
    });
  }

  renderPlanner();
}


/* -----------------------------
   БЛЮДА
----------------------------- */

document
  .getElementById("addFoodBtn")
  .addEventListener("click", () => {

    document
      .getElementById("foodModal")
      .classList.remove("hidden");

  });


document
  .getElementById("closeFoodModal")
  .addEventListener("click", closeFoodModal);


function closeFoodModal() {

  document
    .getElementById("foodModal")
    .classList.add("hidden");

}


document
  .getElementById("saveFoodBtn")
  .addEventListener("click", saveFood);


async function saveFood() {

  const name =
    document.getElementById("foodName").value.trim();

  const store =
    document.getElementById("foodStore").value.trim();

  const price =
    Number(document.getElementById("foodPrice").value);

  const comment =
    document.getElementById("foodComment").value.trim();


  if (!name) {
    alert("Напиши название блюда");
    return;
  }


  if (!price) {
    alert("Укажи цену");
    return;
  }


  await addDoc(
    collection(db, "foods"),
    {
      name,
      store,
      price,
      comment,
      createdAt: new Date().toISOString()
    }
  );


  document.getElementById("foodName").value = "";
  document.getElementById("foodStore").value = "";
  document.getElementById("foodPrice").value = "";
  document.getElementById("foodComment").value = "";

  closeFoodModal();

  await loadFoods();
}


function renderFoods() {

  foodList.innerHTML = "";

  if (foods.length === 0) {

    foodList.innerHTML = `
      <div class="food-card">
        Пока нет блюд.<br>
        Нажми «+ Блюдо», чтобы добавить первое.
      </div>
    `;

    return;
  }


  foods.forEach(food => {

    const card = document.createElement("div");

    card.className = "food-card";

    card.innerHTML = `
      <h3>${escapeHtml(food.name)}</h3>

      <div class="food-store">
        ${escapeHtml(food.store || "Магазин не указан")}
      </div>

      <div class="food-price">
        ${food.price} ₽
      </div>

      ${
        food.comment
          ? `<div class="food-comment">
              ${escapeHtml(food.comment)}
             </div>`
          : ""
      }
    `;

    foodList.appendChild(card);

  });
}


/* -----------------------------
   ПЛАНИРОВАНИЕ
----------------------------- */

function renderPlanner() {

  plannerBody.innerHTML = "";

  const dates = getWeekDates();


  dates.forEach(date => {

    const dateString = formatShortDate(date);

    const row = document.createElement("div");

    row.className = "planner-row";


    const dayCell = document.createElement("div");

    dayCell.className = "day-cell";

    dayCell.innerHTML = `
      <div class="day-number">
        ${date.getDate()}
      </div>

      <div class="day-name">
        ${date.toLocaleDateString("ru-RU", {
          weekday: "short"
        })}
      </div>
    `;

    row.appendChild(dayCell);


    ["breakfast", "lunch", "dinner"].forEach(type => {

      const cell = document.createElement("div");

      cell.className = "meal-cell";


      const cellMeals = meals.filter(
        meal =>
          meal.date === dateString &&
          meal.mealType === type
      );


      if (cellMeals.length === 0) {

        const button = document.createElement("button");

        button.className = "add-meal";

        button.textContent = "+ Добавить";

        button.addEventListener("click", () => {

          openMealModal(date, type);

        });

        cell.appendChild(button);

      } else {

        cellMeals.forEach(meal => {

          const food =
            foods.find(item => item.id === meal.foodId);

          if (!food) return;


          const item = document.createElement("div");

          item.className = "meal-item";

          let personText = "";

          if (meal.person === "me") {
            personText = "Мне";
          }

          if (meal.person === "husband") {
            personText = "Мужу";
          }

          if (meal.person === "both") {
            personText = "Нам обоим";
          }


          item.innerHTML = `
            <strong>
              ${escapeHtml(food.name)}
            </strong>

            <div class="meal-person">
              ${personText}
            </div>

            <div class="meal-price">
              ${meal.person === "both"
                ? food.price
                : food.price} ₽
            </div>

            <button class="delete-meal">
              ×
            </button>
          `;


          item
            .querySelector(".delete-meal")
            .addEventListener("click", async event => {

              event.stopPropagation();

              await deleteDoc(
                doc(db, "meals", meal.id)
              );

              await loadMeals();

            });


          cell.appendChild(item);

        });


        const addButton = document.createElement("button");

        addButton.className = "add-meal";

        addButton.textContent = "+ Ещё";

        addButton.style.minHeight = "40px";

        addButton.addEventListener("click", () => {

          openMealModal(date, type);

        });

        cell.appendChild(addButton);
      }


      row.appendChild(cell);

    });


    plannerBody.appendChild(row);

  });


  updateSummary();
}


function updateSummary() {

  let total = 0;

  const days = new Set();


  meals.forEach(meal => {

    const food =
      foods.find(item => item.id === meal.foodId);

    if (!food) return;

    total += Number(food.price);

    days.add(meal.date);

  });


  weekTotal.textContent =
    `${total} ₽`;

  plannedDays.textContent =
    days.size;

}


/* -----------------------------
   МОДАЛКА ПЛАНИРОВАНИЯ
----------------------------- */

function openMealModal(date, mealType) {

  selectedDate = date;
  selectedMealType = mealType;
  selectedPerson = "me";


  document.getElementById("mealModalTitle").textContent =
    getMealName(mealType);


  document.getElementById("mealModalDate").textContent =
    formatDate(date);


  document
    .getElementById("mealModal")
    .classList.remove("hidden");


  updatePersonButtons();

  updateFoodSelect();

}


document
  .getElementById("closeMealModal")
  .addEventListener("click", () => {

    document
      .getElementById("mealModal")
      .classList.add("hidden");

  });


document
  .querySelectorAll(".person-btn")
  .forEach(button => {

    button.addEventListener("click", () => {

      selectedPerson =
        button.dataset.person;

      updatePersonButtons();

    });

  });


function updatePersonButtons() {

  document
    .querySelectorAll(".person-btn")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.person === selectedPerson
      );

    });

}


function updateFoodSelect() {

  const select =
    document.getElementById("mealFood");

  select.innerHTML =
    `<option value="">Выберите блюдо</option>`;


  foods.forEach(food => {

    const option =
      document.createElement("option");

    option.value = food.id;

    option.textContent =
      `${food.name} — ${food.price} ₽`;

    select.appendChild(option);

  });

}


document
  .getElementById("saveMealBtn")
  .addEventListener("click", saveMeal);


async function saveMeal() {

  const foodId =
    document.getElementById("mealFood").value;


  if (!foodId) {

    alert("Выбери блюдо");

    return;

  }


  await addDoc(
    collection(db, "meals"),
    {
      date: formatShortDate(selectedDate),
      mealType: selectedMealType,
      person: selectedPerson,
      foodId
    }
  );


  document
    .getElementById("mealModal")
    .classList.add("hidden");


  document.getElementById("mealFood").value = "";


  await loadMeals();

}


/* -----------------------------
   НЕДЕЛЯ
----------------------------- */

document
  .getElementById("prevWeek")
  .addEventListener("click", async () => {

    currentWeekStart.setDate(
      currentWeekStart.getDate() - 7
    );

    updateWeekHeader();

    await loadMeals();

  });


document
  .getElementById("nextWeek")
  .addEventListener("click", async () => {

    currentWeekStart.setDate(
      currentWeekStart.getDate() + 7
    );

    updateWeekHeader();

    await loadMeals();

  });


document
  .getElementById("todayBtn")
  .addEventListener("click", async () => {

    currentWeekStart =
      getMonday(new Date());

    updateWeekHeader();

    await loadMeals();

  });


function updateWeekHeader() {

  const dates = getWeekDates();

  const first = dates[0];
  const last = dates[6];


  currentWeek.textContent =
    `${first.getDate()} ${first.toLocaleDateString("ru-RU", {
      month: "short"
    })} — ${last.getDate()} ${last.toLocaleDateString("ru-RU", {
      month: "short"
    })}`;


  weekLabel.textContent =
    `Неделя ${first.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long"
    })} — ${last.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long"
    })}`;

}


/* -----------------------------
   БЕЗОПАСНЫЙ ТЕКСТ
----------------------------- */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* -----------------------------
   ЗАПУСК
----------------------------- */

async function init() {

  try {

    updateWeekHeader();

    await loadFoods();

    await loadMeals();

  } catch (error) {

    console.error(error);

    alert(
      "Не удалось подключиться к Firebase. Проверь firebaseConfig и настройки Firestore."
    );

  }

}


init();
