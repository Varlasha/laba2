var canvas = document.getElementById('canvas');
canvas.style.backgroundColor = "white";

var context = canvas.getContext('2d');
var mouse = { x: 0, y: 0, down: false };
var userСords = []; //  координаты точек,которые ставим
var arrayCords = []; //координаты точек безье
var isdrawn = false;
var isClicked = false;
const pointSize = 5;
var index; //для хранения индекса кликнутой точки на кривой Безье
var approximation = 500;
const slider = document.querySelector(".ranges");
const sliderValue = document.querySelector(".slider_value");

canvas.addEventListener("click", setPoint, false);
canvas.addEventListener("mousemove", mouseMove, false);
canvas.addEventListener("mouseup", mouseUp, false);
canvas.addEventListener("mousedown", mouseDown, false);

// обновляет положение курсора мыши и перемещает выбранную точку кривой Безье при необходимости
function mouseMove(event) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = Math.round((event.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
    mouse.y = Math.round((event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
    if (isdrawn && isClicked && index !== -1) {
        userСords[index] = { x: mouse.x, y: mouse.y }
        drawBezier();
    }
}

// когда кнопка мыши отпущена
function mouseUp() {
    isClicked = false;
    index = -1;
}

// oпределяет индекс выбранной точки, если пользователь кликнул на неё
function mouseDown() {
    isClicked = true;
    for (const [i, value] of userСords.entries()) {
        if ((mouse.x < value.x + pointSize && mouse.x > value.x - pointSize) && (mouse.y < value.y + pointSize && mouse.y > value.y - pointSize)) {
            index = i;
        }
    }
}

// находим bi,n по алгоритму де Кастельжо
function getBezierBasis(i, n, t) {
    // рекурсивно находим факториал
    function f(n) {
        if (n <= 1) {
            return 1;
        } else {
            return n * f(n - 1);
        }
    };
    // считаем i-й элемент полинома Берштейна
    return (f(n) / (f(i) * f(n - i))) * Math.pow(t, i) * Math.pow(1 - t, n - i);
}


function getBezierCurve(arr) {
    var res = []; // создаем массив в котором будем хранить новые точки для построения
    var step = 1 / approximation;
    for (var t = 0; t < 1 + step; t += step) {
        if (t > 1) {
            t = 1; // сумма шага не может быть больше 1 (работаем с диапазоном от 0 до 1)
        }
        var ytmp = 0; // временные для хранения координат
        var xtmp = 0;

        for (var i = 0; i < arr.length; i++) { // проходим по каждой точке
            var b = getBezierBasis(i, arr.length - 1, t); // вычисляем наш полином Берштейна (геометрическую форму кривой)
            xtmp += arr[i].x * b; // записываем и прибавляем результат
            ytmp += arr[i].y * b;
        }
        res.push({ "x": xtmp, "y": ytmp }); // конечный результат в наш новый массив
    }
    return res; // возвращаем его
}

// добавляет точку на canvas при клике
function setPoint() {
    if (userСords.length < 4) {
        const c = { x: mouse.x, y: mouse.y };
        userСords.push({ x: c.x, y: c.y });
        context.fillStyle = 'black';
        context.beginPath();
        context.arc(c.x, c.y, pointSize, 0, 2 * Math.PI);
        context.fill();
        if (userСords.length === 4) drawBezier();
    }
}

// отрисовывает точки, кривую Безье
function drawBezier() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    isdrawn = true;
    arrayCords = getBezierCurve(userСords); // получаем координаты точек кривой безье

    for (let i in userСords) {
        context.fillStyle = 'black';
        context.beginPath();
        context.arc(userСords[i].x, userСords[i].y, pointSize, 0, 2 * Math.PI);
        context.fill();
    }

    context.strokeStyle = 'black';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(arrayCords[0].x, arrayCords[0].y);
    for (let i in arrayCords) {
        context.lineTo(arrayCords[i].x, arrayCords[i].y);
    }
    context.stroke();
    context.closePath();
    drawVectors()

}

// отрисовывает векторы кривой Безье
function drawVectors() {
    context.lineWidth = 1;
    context.beginPath();
    context.strokeStyle = 'blue';
    context.moveTo(userСords[0].x, userСords[0].y);
    context.lineTo(userСords[1].x, userСords[1].y);
    context.moveTo(userСords[2].x, userСords[2].y);
    context.lineTo(userСords[3].x, userСords[3].y);
    context.stroke();
}


slider.querySelector("input").addEventListener("input", event => {
    approximation = event.target.value;
    drawBezier();
    sliderValue.innerHTML = `Аппроксимация: ${approximation}`;
});

function clearCanv() {
    userСords = [];
    isdrawn = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
}