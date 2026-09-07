let meals = JSON.parse(localStorage.getItem("meals")) || [];

const mealNames = {
    breakfast: "Завтрак",
    lunch: "Обед",
    dinner: "Ужин",
    snack: "Перекус"
};

function saveToStorage() {
    localStorage.setItem("meals", JSON.stringify(meals));
}

function openAddMeal() {
    document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

function saveMeal() {

    const meal = {
        id: Date.now(),

        type: document.getElementById("mealType").value,

        name: document.getElementById("mealName").value || "Без названия",

        store: document.getElementById("mealStore").value || "",

        price: Number(document.getElementById("mealPrice").value) || 0,

        calories: Number(document.getElementById("mealCalories").value) || 0,

        protein: Number(document.getElementById("mealProtein").value) || 0,

        fat: Number(document.getElementById("mealFat").value) || 0,

        carbs: Number(document.getElementById("mealCarbs").value) || 0
    };

    meals.push(meal);

    saveToStorage();

    renderMeals();

    closeModal();

    clearForm();
}

function clearForm() {

    document.getElementById("mealName").value = "";
    document.getElementById("mealStore").value = "";
    document.getElementById("mealPrice").value = "";
    document.getElementById("mealCalories").value = "";
    document.getElementById("mealProtein").value = "";
    document.getElementById("mealFat").value = "";
    document.getElementById("mealCarbs").value = "";
}

function deleteMeal(id) {

    meals = meals.filter(meal => meal.id !== id);

    saveToStorage();

    renderMeals();
}

function renderMeals() {

    const list = document.getElementById("mealsList");
    const emptyState = document.getElementById("emptyState");

    list.innerHTML = "";

    if (meals.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

        meals.forEach(meal => {

            const card = document.createElement("div");

            card.className = "meal-card";

            card.innerHTML = `
                <div class="meal-info">

                    <h3>${meal.name}</h3>

                    <p>${mealNames[meal.type]}${meal.store ? " · " + meal.store : ""}</p>

                    <p>
                        Б ${meal.protein} г ·
                        Ж ${meal.fat} г ·
                        У ${meal.carbs} г
                    </p>

                </div>

                <div class="meal-calories">

                    <strong>${meal.calories} ккал</strong>

                    <span>${meal.price} ₽</span>

                    <button
                        class="delete-button"
                        onclick="deleteMeal(${meal.id})"
                    >
                        ×
                    </button>

                </div>
            `;

            list.appendChild(card);
        });
    }

    updateSummary();
}

function updateSummary() {

    const calories = meals.reduce(
        (sum, meal) => sum + meal.calories,
        0
    );

    const protein = meals.reduce(
        (sum, meal) => sum + meal.protein,
        0
    );

    const cost = meals.reduce(
        (sum, meal) => sum + meal.price,
        0
    );

    document.getElementById("totalCalories").textContent =
        calories;

    document.getElementById("totalProtein").textContent =
        protein;

    document.getElementById("totalCost").textContent =
        cost;
}

function showCurrentDate() {

    const today = new Date();

    const date = today.toLocaleDateString("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

    document.getElementById("currentDate").textContent =
        date.charAt(0).toUpperCase() + date.slice(1);
}

showCurrentDate();
renderMeals();
