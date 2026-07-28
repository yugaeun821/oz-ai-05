document.addEventListener("DOMContentLoaded", function () {
    // ==================================================
    // 1. HTML 요소 선택
    // ==================================================
    const display = document.querySelector("#display");
    const buttons = document.querySelectorAll(".buttons button");
    const numberButtons = document.querySelectorAll(".number");
    const operatorButtons = document.querySelectorAll(".operator");
    const clearButton = document.querySelector(".clear");
    const enterButton = document.querySelector(".enter");
    const powerButton = document.querySelector(".on-off");

    // 현재 계산식을 저장하는 변수
    let currentFormula = "";

    // 전원 상태
    let isPowerOn = true;

    // 계산 완료 여부
    let isCalculated = false;

    if (!display) {
        console.error("id가 display인 요소를 찾을 수 없습니다.");
        return;
    }

    // HTML에 작성된 기존 onclick 제거
    // addEventListener만 사용하기 위함
    buttons.forEach(function (button) {
        button.removeAttribute("onclick");
    });

    // ==================================================
    // 2. 사칙연산 함수
    // ==================================================
    function add(a, b) {
        return a + b;
    }

    function subtract(a, b) {
        return a - b;
    }

    function multiply(a, b) {
        return a * b;
    }

    function divide(a, b) {
        return a / b;
    }

    // ==================================================
    // 3. 전원 ON/OFF
    // ==================================================
    function togglePower() {
        isPowerOn = !isPowerOn;

        buttons.forEach(function (button) {
            // 전원 버튼은 항상 누를 수 있어야 함
            if (!button.classList.contains("on-off")) {
                button.disabled = !isPowerOn;
            }
        });

        if (isPowerOn) {
            display.value = "0";
            display.style.backgroundColor = "#222";
            powerButton.classList.add("on");
        } else {
            display.value = "";
            display.style.backgroundColor = "#111";
            powerButton.classList.remove("on");

            currentFormula = "";
            isCalculated = false;
        }
    }

    // ==================================================
    // 4. 숫자 입력
    // ==================================================
    function appendNumber(number) {
        if (!isPowerOn) {
            return;
        }

        // 계산 결과가 나온 뒤 숫자를 누르면 새 계산 시작
        if (isCalculated) {
            currentFormula = "";
            display.value = "";
            isCalculated = false;
        }

        // 현재 입력 중인 마지막 숫자 확인
        const formulaParts = currentFormula
            .trim()
            .split(/\s[+\-*/]\s/);

        const currentNumber =
            formulaParts[formulaParts.length - 1] || "";

        // 한 숫자에 소수점이 두 번 입력되는 것을 방지
        if (number === "." && currentNumber.includes(".")) {
            return;
        }

        // 소수점을 먼저 누른 경우 0.으로 입력
        if (
            number === "." &&
            (currentFormula === "" || currentFormula.endsWith(" "))
        ) {
            number = "0.";
        }

        if (
            display.value === "0" ||
            display.value === "Error" ||
            display.value === "DivBy0"
        ) {
            currentFormula = number;
        } else {
            currentFormula += number;
        }

        display.value = currentFormula;
    }

    // ==================================================
    // 5. 연산자 입력
    // ==================================================
    function appendOperator(operator) {
        if (!isPowerOn) {
            return;
        }

        if (
            display.value === "Error" ||
            display.value === "DivBy0"
        ) {
            return;
        }

        // ×, ÷ 기호가 들어온 경우 계산 가능한 기호로 변환
        if (operator === "×") {
            operator = "*";
        }

        if (operator === "÷") {
            operator = "/";
        }

        // 계산 결과 뒤에 연산자를 누르면 이어서 계산
        if (isCalculated) {
            isCalculated = false;
        }

        // 수식 없이 연산자를 먼저 누르면 0부터 시작
        if (currentFormula === "") {
            currentFormula = "0";
        }

        // 이미 마지막에 연산자가 있다면 새 연산자로 교체
        if (/\s[+\-*/]\s$/.test(currentFormula)) {
            currentFormula = currentFormula.replace(
                /\s[+\-*/]\s$/,
                " " + operator + " "
            );
        } else {
            currentFormula += " " + operator + " ";
        }

        display.value = currentFormula;
    }

    // ==================================================
    // 6. 화면 초기화
    // ==================================================
    function clearDisplay() {
        if (!isPowerOn) {
            return;
        }

        currentFormula = "";
        isCalculated = false;
        display.value = "0";
    }

    // ==================================================
    // 7. 계산 함수
    // 곱셈과 나눗셈을 먼저 계산
    // ==================================================
    function calculate(formula) {
        const tokens = formula.trim().split(/\s+/);

        // 숫자 하나만 입력된 경우
        if (tokens.length === 1) {
            const singleNumber = Number(tokens[0]);

            if (Number.isNaN(singleNumber)) {
                return "Error";
            }

            return singleNumber;
        }

        // 정상적인 수식이 아닌 경우
        if (tokens.length < 3 || tokens.length % 2 === 0) {
            return "Error";
        }

        // ----------------------------------------------
        // 1단계: 곱셈과 나눗셈 처리
        // ----------------------------------------------
        const intermediateTokens = [];
        let index = 0;

        while (index < tokens.length) {
            const token = tokens[index];

            if (token === "*" || token === "/") {
                const left = Number(intermediateTokens.pop());
                const right = Number(tokens[index + 1]);

                if (
                    Number.isNaN(left) ||
                    Number.isNaN(right)
                ) {
                    return "Error";
                }

                if (token === "/" && right === 0) {
                    return "DivBy0";
                }

                let result;

                if (token === "*") {
                    result = multiply(left, right);
                } else {
                    result = divide(left, right);
                }

                intermediateTokens.push(result);
                index += 2;
            } else {
                intermediateTokens.push(token);
                index += 1;
            }
        }

        // ----------------------------------------------
        // 2단계: 덧셈과 뺄셈 처리
        // ----------------------------------------------
        let result = Number(intermediateTokens[0]);

        if (Number.isNaN(result)) {
            return "Error";
        }

        for (
            let index = 1;
            index < intermediateTokens.length;
            index += 2
        ) {
            const operator = intermediateTokens[index];

            const nextValue = Number(
                intermediateTokens[index + 1]
            );

            if (Number.isNaN(nextValue)) {
                return "Error";
            }

            if (operator === "+") {
                result = add(result, nextValue);
            } else if (operator === "-") {
                result = subtract(result, nextValue);
            } else {
                return "Error";
            }
        }

        // 지나치게 긴 소수점 표현 방지
        return Number(result.toFixed(12));
    }

    // ==================================================
    // 8. Enter 버튼을 눌렀을 때 계산 실행
    // ==================================================
    function performCalculate() {
        if (!isPowerOn || currentFormula === "") {
            return;
        }

        // 수식이 연산자로 끝나면 마지막 연산자 제거
        currentFormula = currentFormula.replace(
            /\s[+\-*/]\s*$/,
            ""
        );

        const result = calculate(currentFormula);

        display.value = String(result);
        isCalculated = true;

        if (
            result === "Error" ||
            result === "DivBy0"
        ) {
            currentFormula = "";
        } else {
            // 계산 결과를 다음 연산에 이어서 사용
            currentFormula = String(result);
        }
    }

    // ==================================================
    // 9. 숫자 버튼 EventListener
    // ==================================================
    numberButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const number = button.textContent.trim();
            appendNumber(number);
        });
    });

    // ==================================================
    // 10. 연산자 버튼 EventListener
    // ==================================================
    operatorButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const operator = button.textContent.trim();
            appendOperator(operator);
        });
    });

    // ==================================================
    // 11. C 버튼 EventListener
    // ==================================================
    clearButton.addEventListener("click", function () {
        clearDisplay();
    });

    // ==================================================
    // 12. Enter 버튼 EventListener
    // ==================================================
    enterButton.addEventListener("click", function () {
        performCalculate();
    });

    // ==================================================
    // 13. ON/OFF 버튼 EventListener
    // ==================================================
    powerButton.addEventListener("click", function () {
        togglePower();
    });

    // ==================================================
    // 14. 초기 화면 설정
    // ==================================================
    display.value = "0";
    powerButton.classList.add("on");
});