// 입력된 계산식을 숫자와 연산자로 분리하는 함수
function tokenize(expression) {
  const tokens = [];
  let currentNumber = "";

  for (let i = 0; i < expression.length; i++) {
    const character = expression[i];

    // 숫자 또는 소수점이면 현재 숫자에 이어 붙입니다.
    if (
      (character >= "0" && character <= "9") ||
      character === "."
    ) {
      currentNumber += character;
    }

    // 공백은 무시합니다.
    else if (character === " ") {
      continue;
    }

    // 연산자를 만난 경우
    else if ("+-*/".includes(character)) {
      if (currentNumber === "") {
        throw new Error("연산자 앞에 숫자가 필요합니다.");
      }

      const number = Number(currentNumber);

      if (Number.isNaN(number)) {
        throw new Error("올바르지 않은 숫자가 포함되어 있습니다.");
      }

      tokens.push(number);
      tokens.push(character);

      currentNumber = "";
    }

    // 숫자와 연산자 이외의 문자가 입력된 경우
    else {
      throw new Error(
        `사용할 수 없는 문자가 포함되어 있습니다: ${character}`
      );
    }
  }

  // 마지막 숫자를 배열에 추가합니다.
  if (currentNumber === "") {
    throw new Error("계산식이 연산자로 끝날 수 없습니다.");
  }

  const lastNumber = Number(currentNumber);

  if (Number.isNaN(lastNumber)) {
    throw new Error("올바르지 않은 숫자가 포함되어 있습니다.");
  }

  tokens.push(lastNumber);

  return tokens;
}


// 곱셈과 나눗셈을 먼저 계산하는 함수
function calculateMultiplyAndDivide(tokens) {
  const calculatedTokens = [tokens[0]];

  for (let i = 1; i < tokens.length; i += 2) {
    const operator = tokens[i];
    const rightNumber = tokens[i + 1];

    if (operator === "*" || operator === "/") {
      const leftNumber = calculatedTokens.pop();

      if (operator === "/" && rightNumber === 0) {
        throw new Error("0으로 나눌 수 없습니다.");
      }

      const result =
        operator === "*"
          ? leftNumber * rightNumber
          : leftNumber / rightNumber;

      calculatedTokens.push(result);
    } else {
      calculatedTokens.push(operator);
      calculatedTokens.push(rightNumber);
    }
  }

  return calculatedTokens;
}


// 덧셈과 뺄셈을 계산하는 함수
function calculateAddAndSubtract(tokens) {
  let result = tokens[0];

  for (let i = 1; i < tokens.length; i += 2) {
    const operator = tokens[i];
    const number = tokens[i + 1];

    if (operator === "+") {
      result += number;
    } else if (operator === "-") {
      result -= number;
    }
  }

  return result;
}


// 전체 계산 과정을 실행하는 함수
function calculate(expression) {
  const tokens = tokenize(expression);

  const multiplyAndDivideResult =
    calculateMultiplyAndDivide(tokens);

  return calculateAddAndSubtract(
    multiplyAndDivideResult
  );
}


// Console에서 직접 호출할 시작 함수
function start() {
  const expression = prompt(
    "계산식을 입력하세요.\n예: 10 + 2 * 3 - 8 / 4"
  );

  // 사용자가 취소 버튼을 누른 경우
  if (expression === null) {
    console.log("계산을 취소했습니다.");
    return;
  }

  // 아무것도 입력하지 않은 경우
  if (expression.trim() === "") {
    console.error("계산식을 입력해 주세요.");
    return;
  }

  try {
    const result = calculate(expression);

    console.log(`계산식: ${expression}`);
    console.log(`결과: ${result}`);
  } catch (error) {
    console.error(`오류: ${error.message}`);
  }
}