/* Original free study paths. No external question/paid-content fetches. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceName=q=>q.sourceLabel||q.sourceTitle||({public_exam:'공개 기출',existing_print:'기존 학습 자료',original:'델타스킬 자체 제작'}[q.sourceKind])||'기존 자료';
const BANK=[
  {
    "id": "dssp1-c1",
    "subunit": "유리함수",
    "version": "original-20261124-v1",
    "course": "concept",
    "type": "value",
    "level": 1,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "함수 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">)</mo><mo>=</mo><mfrac><mrow><mn>2</mn><mi>x</mi><mo>+</mo><mn>2</mn></mrow><mrow><mi>x</mi><mo>−</mo><mn>1</mn></mrow></mfrac></mrow></math>에서 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mn>3</mn><mo stretchy=\"false\">)</mo></mrow></math>의 값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn></mrow></math>"
    ],
    "answer": 2,
    "hint": "분자와 분모의 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi></mrow></math>에 같은 수 3을 넣어 보세요.",
    "solution": [
      "분모가 0이 아닌지 먼저 확인한다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mn>3</mn><mo stretchy=\"false\">)</mo><mo>=</mo><mfrac><mrow><mn>8</mn></mrow><mrow><mn>2</mn></mrow></mfrac><mo>=</mo><mn>4</mn></mrow></math>"
    ],
    "verification": {
      "method": "substitution",
      "numerator": 8,
      "denominator": 2,
      "expected": 4
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-c2",
    "subunit": "유리함수",
    "version": "original-20261124-v1",
    "course": "concept",
    "type": "domain",
    "level": 1,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "함수 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">)</mo><mo>=</mo><mfrac><mrow><mi>x</mi><mo>+</mo><mn>1</mn></mrow><mrow><mi>x</mi><mo>−</mo><mn>2</mn></mrow></mfrac></mrow></math>의 정의역에서 제외해야 하는 실수는?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mrow><mo>−</mo><mn>2</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mrow><mo>−</mo><mn>1</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>"
    ],
    "answer": 4,
    "hint": "유리식은 분모가 0이면 정의되지 않아요.",
    "solution": [
      "분모가 0이 되는 값은 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>−</mo><mn>2</mn><mo>=</mo><mn>0</mn></mrow></math>의 해이다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>=</mo><mn>2</mn></mrow></math>를 정의역에서 제외한다."
    ],
    "verification": {
      "method": "denominator-zero",
      "expected": 2
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-c3",
    "subunit": "무리함수",
    "version": "original-20261124-v1",
    "course": "concept",
    "type": "radical-domain",
    "level": 1,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><msqrt><mn>3</mn><mi>x</mi><mo>−</mo><mn>6</mn></msqrt></mrow></math>의 정의역에 속하는<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi></mrow></math>의 최솟값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mrow><mo>−</mo><mn>2</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>"
    ],
    "answer": 3,
    "hint": "실수의 범위에서 제곱근 안은 0 이상이어야 해요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><mi>x</mi><mo>−</mo><mn>6</mn><mo>≥</mo><mn>0</mn></mrow></math>이므로 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≥</mo><mn>2</mn></mrow></math>이다.",
      "따라서 최솟값은 2이다."
    ],
    "verification": {
      "method": "radicand-bound",
      "coefficient": 3,
      "constant": -6,
      "expected": 2
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-c4",
    "subunit": "무리함수",
    "version": "original-20261124-v1",
    "course": "concept",
    "type": "range",
    "level": 1,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><msqrt><mi>x</mi><mo>−</mo><mn>1</mn></msqrt><mo>+</mo><mn>2</mn></mrow></math>의 치역은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>≥</mo><mrow><mo>−</mo><mn>2</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>≥</mo><mrow><mo>−</mo><mn>1</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>≥</mo><mn>0</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>≥</mo><mn>1</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>≥</mo><mn>2</mn></mrow></math>"
    ],
    "answer": 4,
    "hint": "제곱근의 값은 음수가 될 수 없어요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mi>x</mi><mo>−</mo><mn>1</mn></msqrt><mo>≥</mo><mn>0</mn></mrow></math>이므로 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>≥</mo><mn>2</mn></mrow></math>이다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>=</mo><mn>1</mn></mrow></math>일 때<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo stretchy=\"false\">=</mo><mn>2</mn></mrow></math>이고<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">,</mo><mi>x</mi></mrow></math>가 커지면<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi></mrow></math>도 제한 없이 커진다."
    ],
    "verification": {
      "method": "sqrt-range",
      "shift": 2,
      "expected": 2
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-c5",
    "subunit": "유리함수",
    "version": "original-20261124-v1",
    "course": "concept",
    "type": "translation",
    "level": 1,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><mfrac><mrow><mn>3</mn></mrow><mrow><mi>x</mi><mo>−</mo><mn>2</mn></mrow></mfrac><mo>+</mo><mn>1</mn></mrow></math>의 그래프에서 두 점근선의 교점은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mn>1</mn><mo>,</mo><mn>2</mn><mo stretchy=\"false\">)</mo></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mrow><mo>−</mo><mn>2</mn></mrow><mo>,</mo><mn>1</mn><mo stretchy=\"false\">)</mo></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mn>2</mn><mo>,</mo><mrow><mo>−</mo><mn>1</mn></mrow><mo stretchy=\"false\">)</mo></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mn>2</mn><mo>,</mo><mn>1</mn><mo stretchy=\"false\">)</mo></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mrow><mo>−</mo><mn>2</mn></mrow><mo>,</mo><mrow><mo>−</mo><mn>1</mn></mrow><mo stretchy=\"false\">)</mo></mrow></math>"
    ],
    "answer": 3,
    "hint": "분모가 0인 수직선과 바깥에 더한 수를 나타내는 수평선을 찾아보세요.",
    "solution": [
      "점근선은 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>=</mo><mn>2</mn></mrow></math>와 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><mn>1</mn></mrow></math>이다.",
      "두 직선의 교점은 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>(</mo><mn>2</mn><mo>,</mo><mn>1</mn><mo>)</mo></mrow></math>이다."
    ],
    "verification": {
      "method": "asymptote-center",
      "expected": [
        2,
        1
      ]
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-c6",
    "subunit": "무리함수",
    "version": "original-20261124-v1",
    "course": "concept",
    "type": "radical-equation",
    "level": 1,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "방정식 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>2</mn><mi>x</mi><mo>+</mo><mn>1</mn></msqrt><mo>=</mo><mn>3</mn></mrow></math>의 해는?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn></mrow></math>"
    ],
    "answer": 3,
    "hint": "양변을 제곱한 뒤 원래 식에 넣어 확인해 보세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><mi>x</mi><mo>+</mo><mn>1</mn><mo>=</mo><mn>9</mn></mrow></math>에서 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>=</mo><mn>4</mn></mrow></math>이다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">=</mo><mn>4</mn></mrow></math>를 대입하면<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>9</mn></msqrt><mo stretchy=\"false\">=</mo><mn>3</mn></mrow></math>으로 원래 식을 만족한다."
    ],
    "verification": {
      "method": "sqrt-equation",
      "a": 2,
      "b": 1,
      "rhs": 3,
      "expected": 4
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-t1",
    "subunit": "유리함수",
    "version": "original-20261124-v1",
    "course": "types",
    "type": "value",
    "level": 2,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "함수 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">)</mo><mo>=</mo><mfrac><mrow><mn>2</mn><mi>x</mi><mo>+</mo><mn>2</mn></mrow><mrow><mi>x</mi><mo>−</mo><mn>1</mn></mrow></mfrac></mrow></math>에 대하여<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mi>a</mi><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>3</mn></mrow></math>일 때<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">,</mo><mi>a</mi></mrow></math>의 값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn></mrow></math>"
    ],
    "answer": 3,
    "hint": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi><mo>≠</mo><mn>1</mn></mrow></math>을 확인하고 양변에 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi><mo>−</mo><mn>1</mn></mrow></math>을 곱하세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><mi>a</mi><mo>+</mo><mn>2</mn><mo>=</mo><mn>3</mn><mo stretchy=\"false\">(</mo><mi>a</mi><mo>−</mo><mn>1</mn><mo stretchy=\"false\">)</mo></mrow></math>",
      "정리하면<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi><mo stretchy=\"false\">=</mo><mn>5</mn></mrow></math>이다.<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi><mo stretchy=\"false\">≠</mo><mn>1</mn></mrow></math>이고, 원래 식에 대입하면 3이 된다."
    ],
    "verification": {
      "method": "linear-rational",
      "p": 2,
      "q": 2,
      "r": 1,
      "target": 3,
      "expected": 5
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-t2",
    "subunit": "유리함수",
    "version": "original-20261124-v1",
    "course": "types",
    "type": "translation",
    "level": 2,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><mfrac><mrow><mi>k</mi></mrow><mrow><mi>x</mi><mo>−</mo><mn>1</mn></mrow></mfrac><mo>+</mo><mn>2</mn></mrow></math>의 그래프가 점 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>(</mo><mn>3</mn><mo>,</mo><mn>5</mn><mo>)</mo></mrow></math>를 지날 때, 상수<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>k</mi></mrow></math>의 값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn></mrow></math>"
    ],
    "answer": 4,
    "hint": "주어진 점의 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi></mrow></math>좌표와 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi></mrow></math>좌표를 함께 대입하세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><mo>=</mo><mfrac><mrow><mi>k</mi></mrow><mrow><mn>2</mn></mrow></mfrac><mo>+</mo><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>k</mi><mo>=</mo><mn>6</mn></mrow></math>이다."
    ],
    "verification": {
      "method": "point-on-graph",
      "x": 3,
      "y": 5,
      "h": 1,
      "v": 2,
      "expected": 6
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-t3",
    "subunit": "무리함수",
    "version": "original-20261124-v1",
    "course": "types",
    "type": "radical-equation",
    "level": 2,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "방정식 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mi>x</mi><mo>+</mo><mn>4</mn></msqrt><mo>=</mo><mi>x</mi><mo>−</mo><mn>2</mn></mrow></math>의 해는?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn></mrow></math>"
    ],
    "answer": 4,
    "hint": "오른쪽 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>−</mo><mn>2</mn></mrow></math>도 0 이상이어야 해요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≥</mo><mn>2</mn></mrow></math>이어야 한다. 양변을 제곱하면 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>+</mo><mn>4</mn><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup><mo>−</mo><mn>4</mn><mi>x</mi><mo>+</mo><mn>4</mn></mrow></math>이다.",
      "정리하면<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">−</mo><mn>5</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>이다. 후보 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn><mo>,</mo><mn>5</mn></mrow></math> 중<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">≥</mo><mn>2</mn></mrow></math>인 5만 원래 식을 만족한다."
    ],
    "verification": {
      "method": "radical-linear",
      "b": 4,
      "c": 2,
      "expected": 5,
      "rejected": 0
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-t4",
    "subunit": "무리함수",
    "version": "original-20261124-v1",
    "course": "types",
    "type": "radical-domain",
    "level": 2,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><msqrt><mn>4</mn><mo>−</mo><mi>x</mi></msqrt><mo>+</mo><mn>1</mn></mrow></math>의 정의역은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≥</mo><mn>4</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≤</mo><mn>4</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≥</mo><mn>1</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≤</mo><mn>1</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≤</mo><mn>0</mn></mrow></math>"
    ],
    "answer": 1,
    "hint": "근호 안의 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi></mrow></math> 앞 계수가 음수인 점에 주의하세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn><mo>−</mo><mi>x</mi><mo>≥</mo><mn>0</mn></mrow></math>에서 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≤</mo><mn>4</mn></mrow></math>이다.",
      "따라서 정의역은<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">≤</mo><mn>4</mn></mrow></math>인 모든 실수의 집합이다."
    ],
    "verification": {
      "method": "negative-radicand",
      "expected": 4
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-t5",
    "subunit": "유리함수",
    "version": "original-20261124-v1",
    "course": "types",
    "type": "range",
    "level": 2,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "함수 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">)</mo><mo>=</mo><mfrac><mrow><mn>3</mn><mi>x</mi><mo>−</mo><mn>1</mn></mrow><mrow><mi>x</mi><mo>+</mo><mn>2</mn></mrow></mfrac></mrow></math>의 치역에서 제외되는 값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mrow><mo>−</mo><mn>3</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mrow><mo>−</mo><mn>2</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>"
    ],
    "answer": 4,
    "hint": "분자를 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><mo>(</mo><mi>x</mi><mo>+</mo><mn>2</mn><mo>)</mo><mo>−</mo><mn>7</mn></mrow></math>로 바꾸어 보세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">)</mo><mo>=</mo><mn>3</mn><mo>−</mo><mfrac><mrow><mn>7</mn></mrow><mrow><mi>x</mi><mo>+</mo><mn>2</mn></mrow></mfrac></mrow></math>",
      "분수 부분은 0이 될 수 없다. 따라서 함수값은 3이 될 수 없고, 나머지 모든 실숫값은 가능하다."
    ],
    "verification": {
      "method": "rational-range",
      "p": 3,
      "q": -1,
      "r": -2,
      "expected": 3
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-t6",
    "subunit": "무리함수",
    "version": "original-20261124-v1",
    "course": "types",
    "type": "intersection",
    "level": 2,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "두 그래프 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><msqrt><mi>x</mi><mo>−</mo><mn>2</mn></msqrt></mrow></math>, <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><mi>x</mi><mo>−</mo><mn>4</mn></mrow></math>의 교점의<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi></mrow></math>좌표는?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn></mrow></math>"
    ],
    "answer": 4,
    "hint": "직선의 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi></mrow></math>값도 음수가 될 수 없으므로 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≥</mo><mn>4</mn></mrow></math>가 필요해요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≥</mo><mn>4</mn></mrow></math>에서 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>−</mo><mn>2</mn><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup><mo>−</mo><mn>8</mn><mi>x</mi><mo>+</mo><mn>16</mn></mrow></math>을 푼다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">−</mo><mn>3</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">−</mo><mn>6</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>의 후보 중<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">≥</mo><mn>4</mn></mrow></math>인 6만 남는다.<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo stretchy=\"false\">=</mo><mn>2</mn></mrow></math>이므로 교점은 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>(</mo><mn>6</mn><mo>,</mo><mn>2</mn><mo>)</mo></mrow></math>이다."
    ],
    "verification": {
      "method": "radical-linear",
      "b": -2,
      "c": 4,
      "expected": 6,
      "rejected": 3
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-s1",
    "subunit": "유리함수",
    "version": "original-20261124-v1",
    "course": "supplement",
    "type": "value",
    "level": 1,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "함수 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">)</mo><mo>=</mo><mfrac><mrow><mn>3</mn><mi>x</mi><mo>+</mo><mn>1</mn></mrow><mrow><mi>x</mi><mo>−</mo><mn>1</mn></mrow></mfrac></mrow></math>에서<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mn>3</mn><mo stretchy=\"false\">)</mo></mrow></math>의 값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn></mrow></math>"
    ],
    "answer": 3,
    "hint": "분자와 분모에 3을 각각 대입해 보세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mn>3</mn><mo stretchy=\"false\">)</mo><mo>=</mo><mfrac><mrow><mn>10</mn></mrow><mrow><mn>2</mn></mrow></mfrac><mo>=</mo><mn>5</mn></mrow></math>"
    ],
    "verification": {
      "method": "substitution",
      "numerator": 10,
      "denominator": 2,
      "expected": 5
    },
    "book": "rational",
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-s2",
    "subunit": "유리함수",
    "version": "original-20261124-v1",
    "course": "supplement",
    "type": "value",
    "level": 2,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "함수 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">)</mo><mo>=</mo><mfrac><mrow><mn>3</mn><mi>x</mi><mo>+</mo><mn>1</mn></mrow><mrow><mi>x</mi><mo>−</mo><mn>1</mn></mrow></mfrac></mrow></math>에 대하여<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mi>a</mi><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>5</mn></mrow></math>일 때<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">,</mo><mi>a</mi></mrow></math>의 값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn></mrow></math>"
    ],
    "answer": 2,
    "hint": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi><mo>≠</mo><mn>1</mn></mrow></math>을 확인하고 분모를 곱하세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><mi>a</mi><mo>+</mo><mn>1</mn><mo>=</mo><mn>5</mn><mo stretchy=\"false\">(</mo><mi>a</mi><mo>−</mo><mn>1</mn><mo stretchy=\"false\">)</mo></mrow></math>",
      "정리하면<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><mi>a</mi><mo stretchy=\"false\">=</mo><mn>6</mn></mrow></math>이므로<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi><mo stretchy=\"false\">=</mo><mn>3</mn></mrow></math>이다. 원래 식에서도 성립한다."
    ],
    "verification": {
      "method": "linear-rational",
      "p": 3,
      "q": 1,
      "r": 1,
      "target": 5,
      "expected": 3
    },
    "book": "rational",
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-s3",
    "subunit": "유리함수",
    "version": "original-20261124-v1",
    "course": "supplement",
    "type": "translation",
    "level": 2,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><mfrac><mrow><mn>2</mn></mrow><mrow><mi>x</mi><mo>+</mo><mn>1</mn></mrow></mfrac><mo>−</mo><mn>3</mn></mrow></math>의 두 점근선의 교점은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mn>1</mn><mo>,</mo><mn>3</mn><mo stretchy=\"false\">)</mo></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mrow><mo>−</mo><mn>1</mn></mrow><mo>,</mo><mn>3</mn><mo stretchy=\"false\">)</mo></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mn>1</mn><mo>,</mo><mrow><mo>−</mo><mn>3</mn></mrow><mo stretchy=\"false\">)</mo></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mrow><mo>−</mo><mn>1</mn></mrow><mo>,</mo><mrow><mo>−</mo><mn>3</mn></mrow><mo stretchy=\"false\">)</mo></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mn>0</mn><mo>,</mo><mrow><mo>−</mo><mn>3</mn></mrow><mo stretchy=\"false\">)</mo></mrow></math>"
    ],
    "answer": 3,
    "hint": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>+</mo><mn>1</mn><mo>=</mo><mi>x</mi><mo>−</mo><mo>(</mo><mo>−</mo><mn>1</mn><mo>)</mo></mrow></math>로 읽어 보세요.",
    "solution": [
      "점근선은<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">=</mo><mo stretchy=\"false\">−</mo><mn>1</mn></mrow></math>과<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo stretchy=\"false\">=</mo><mo stretchy=\"false\">−</mo><mn>3</mn></mrow></math>이다. 따라서 교점은 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>(</mo><mo>−</mo><mn>1</mn><mo>,</mo><mo>−</mo><mn>3</mn><mo>)</mo></mrow></math>이다."
    ],
    "verification": {
      "method": "asymptote-center",
      "expected": [
        -1,
        -3
      ]
    },
    "book": "rational",
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-s4",
    "subunit": "무리함수",
    "version": "original-20261124-v1",
    "course": "supplement",
    "type": "radical-equation",
    "level": 1,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "방정식 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>2</mn><mi>x</mi><mo>−</mo><mn>2</mn></msqrt><mo>=</mo><mn>4</mn></mrow></math>의 해는?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>7</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>8</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>9</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>10</mn></mrow></math>"
    ],
    "answer": 3,
    "hint": "근호를 없앨 때 오른쪽 4도 제곱하세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><mi>x</mi><mo>−</mo><mn>2</mn><mo>=</mo><mn>16</mn></mrow></math>에서<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">=</mo><mn>9</mn></mrow></math>이다.",
      "대입하면<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>16</mn></msqrt><mo stretchy=\"false\">=</mo><mn>4</mn></mrow></math>이므로 옳다."
    ],
    "verification": {
      "method": "sqrt-equation",
      "a": 2,
      "b": -2,
      "rhs": 4,
      "expected": 9
    },
    "book": "radical",
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-s5",
    "subunit": "무리함수",
    "version": "original-20261124-v1",
    "course": "supplement",
    "type": "radical-equation",
    "level": 2,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "방정식 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mi>x</mi><mo>+</mo><mn>6</mn></msqrt><mo>=</mo><mi>x</mi></mrow></math>의 해는?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mrow><mo>−</mo><mn>2</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn></mrow></math>"
    ],
    "answer": 3,
    "hint": "오른쪽 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi></mrow></math>가 0 이상인지 확인하세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≥</mo><mn>0</mn></mrow></math>에서 양변을 제곱하면 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>+</mo><mn>6</mn><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup></mrow></math>이다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">−</mo><mn>3</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">+</mo><mn>2</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>의 후보 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><mo>,</mo><mo>−</mo><mn>2</mn></mrow></math> 중<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">≥</mo><mn>0</mn></mrow></math>인 3만 해이다."
    ],
    "verification": {
      "method": "radical-linear",
      "b": 6,
      "c": 0,
      "expected": 3,
      "rejected": -2
    },
    "book": "radical",
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-s6",
    "subunit": "무리함수",
    "version": "original-20261124-v1",
    "course": "supplement",
    "type": "radical-domain",
    "level": 1,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><msqrt><mn>5</mn><mo>−</mo><mi>x</mi></msqrt></mrow></math>의 정의역에 속하는<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi></mrow></math>의 최댓값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn></mrow></math>"
    ],
    "answer": 4,
    "hint": "근호 안이 0인 경계도 정의역에 들어가요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><mo>−</mo><mi>x</mi><mo>≥</mo><mn>0</mn></mrow></math>에서 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≤</mo><mn>5</mn></mrow></math>이므로 최댓값은 5이다."
    ],
    "verification": {
      "method": "negative-radicand",
      "expected": 5
    },
    "book": "radical",
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-h1",
    "subunit": "유리함수",
    "version": "original-20261124-v1",
    "course": "advanced",
    "type": "intersection",
    "level": 1,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "두 그래프 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><mfrac><mrow><mn>2</mn></mrow><mrow><mi>x</mi><mo>−</mo><mn>1</mn></mrow></mfrac><mo>+</mo><mn>3</mn></mrow></math>과 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><mi>x</mi><mo>+</mo><mn>1</mn></mrow></math>의 두 교점의<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi></mrow></math>좌표의 합은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>"
    ],
    "answer": 3,
    "hint": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≠</mo><mn>1</mn></mrow></math>을 확인하고 두 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi></mrow></math>값을 같게 두세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><mo>=</mo><mo stretchy=\"false\">(</mo><mi>x</mi><mo>−</mo><mn>2</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">(</mo><mi>x</mi><mo>−</mo><mn>1</mn><mo stretchy=\"false\">)</mo></mrow></math>",
      "정리하면<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">−</mo><mn>3</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>이다. 0과 3은 모두<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">≠</mo><mn>1</mn></mrow></math>을 만족하므로 합은 3이다."
    ],
    "verification": {
      "method": "rational-intersections",
      "roots": [
        0,
        3
      ],
      "excluded": 1,
      "expected": 3
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-h2",
    "subunit": "무리함수",
    "version": "original-20261124-v1",
    "course": "advanced",
    "type": "radical-equation",
    "level": 1,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "방정식 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>2</mn><mi>x</mi><mo>+</mo><mn>3</mn></msqrt><mo>=</mo><mi>x</mi></mrow></math>의 해는?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mrow><mo>−</mo><mn>1</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>"
    ],
    "answer": 4,
    "hint": "제곱해서 얻은 두 후보를 원래 식에 넣어 보세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≥</mo><mn>0</mn></mrow></math>에서 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><mi>x</mi><mo>+</mo><mn>3</mn><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup></mrow></math>이다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">−</mo><mn>3</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">+</mo><mn>1</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>의 후보 중 3만 원래 식을 만족한다."
    ],
    "verification": {
      "method": "sqrt-linear-origin",
      "a": 2,
      "b": 3,
      "expected": 3,
      "rejected": -1
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-h3",
    "subunit": "유리함수",
    "version": "original-20261124-v1",
    "course": "advanced",
    "type": "value",
    "level": 2,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "함수 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">)</mo><mo>=</mo><mfrac><mrow><mi>a</mi><mi>x</mi><mo>+</mo><mn>1</mn></mrow><mrow><mi>x</mi><mo>−</mo><mn>2</mn></mrow></mfrac></mrow></math>가<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mn>3</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>7</mn></mrow></math>을 만족한다.<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mi>b</mi><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>1</mn></mrow></math>인 실수<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>b</mi></mrow></math>의 값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mrow><mo>−</mo><mn>3</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mrow><mo>−</mo><mn>2</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mrow><mo>−</mo><mn>1</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>"
    ],
    "answer": 0,
    "hint": "먼저 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi></mrow></math>를 정한 뒤 새로운 방정식을 풀어 보세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>f</mi><mo stretchy=\"false\">(</mo><mn>3</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>3</mn><mi>a</mi><mo stretchy=\"false\">+</mo><mn>1</mn><mo stretchy=\"false\">=</mo><mn>7</mn></mrow></math>이므로<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi><mo stretchy=\"false\">=</mo><mn>2</mn></mrow></math>이다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mn>2</mn><mi>b</mi><mo>+</mo><mn>1</mn></mrow><mrow><mi>b</mi><mo>−</mo><mn>2</mn></mrow></mfrac><mo>=</mo><mn>1</mn></mrow></math>에서<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><mi>b</mi><mo stretchy=\"false\">+</mo><mn>1</mn><mo stretchy=\"false\">=</mo><mi>b</mi><mo stretchy=\"false\">−</mo><mn>2</mn></mrow></math>이므로<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>b</mi><mo stretchy=\"false\">=</mo><mo stretchy=\"false\">−</mo><mn>3</mn></mrow></math>이다.<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>b</mi><mo stretchy=\"false\">≠</mo><mn>2</mn></mrow></math>이고 원래 식도 만족한다."
    ],
    "verification": {
      "method": "parameter-then-value",
      "a": 2,
      "expected": -3
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-h4",
    "subunit": "무리함수",
    "version": "original-20261124-v1",
    "course": "advanced",
    "type": "radical-equation",
    "level": 2,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "방정식 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mi>x</mi><mo>+</mo><mn>5</mn></msqrt><mo>=</mo><mi>x</mi><mo>−</mo><mn>1</mn></mrow></math>을 제곱하여 얻은 이차방정식의 두 근 중, 원래 방정식의 해가 아닌 값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mrow><mo>−</mo><mn>4</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mrow><mo>−</mo><mn>1</mn></mrow></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>"
    ],
    "answer": 1,
    "hint": "이번에는 해가 아닌 값을 묻고 있어요.",
    "solution": [
      "원래 식은<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">≥</mo><mn>1</mn></mrow></math>을 요구한다. 제곱하면<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msup><mi>x</mi><mn>2</mn></msup><mo stretchy=\"false\">−</mo><mn>3</mn><mi>x</mi><mo stretchy=\"false\">−</mo><mn>4</mn><mo stretchy=\"false\">=</mo><mn>0</mn><mo stretchy=\"false\">,</mo></mrow></math>즉<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">−</mo><mn>4</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">+</mo><mn>1</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>이다.",
      "후보 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn><mo>,</mo><mo>−</mo><mn>1</mn></mrow></math> 중 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>−</mo><mn>1</mn></mrow></math>은<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">≥</mo><mn>1</mn></mrow></math>을 만족하지 않으므로 원래 식의 해가 아니다."
    ],
    "verification": {
      "method": "radical-rejected",
      "b": 5,
      "c": 1,
      "expected": -1,
      "accepted": 4
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-h5",
    "subunit": "유리함수",
    "version": "original-20261124-v1",
    "course": "advanced",
    "type": "intersection",
    "level": 3,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "0이 아닌 실수<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>k</mi></mrow></math>에 대하여 두 그래프 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><mfrac><mrow><mi>k</mi></mrow><mrow><mi>x</mi><mo>−</mo><mn>1</mn></mrow></mfrac><mo>+</mo><mn>2</mn></mrow></math>와 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><mi>x</mi></mrow></math>의 교점이 정확히 한 개일 때<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">,</mo><mi>k</mi></mrow></math>의 값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mrow><mo>−</mo><mn>1</mn></mrow></mrow><mrow><mn>1</mn></mrow></mfrac></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mrow><mo>−</mo><mn>1</mn></mrow></mrow><mrow><mn>2</mn></mrow></mfrac></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mrow><mo>−</mo><mn>1</mn></mrow></mrow><mrow><mn>4</mn></mrow></mfrac></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mn>1</mn></mrow><mrow><mn>4</mn></mrow></mfrac></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mn>1</mn></mrow><mrow><mn>2</mn></mrow></mfrac></mrow></math>"
    ],
    "answer": 2,
    "hint": "교점 방정식의 중근이 분모를 0으로 만들지 않는지도 확인하세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mi>x</mi><mo>−</mo><mn>1</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">(</mo><mi>x</mi><mo>−</mo><mn>2</mn><mo stretchy=\"false\">)</mo><mo>=</mo><mi>k</mi></mrow></math>에서<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msup><mi>x</mi><mn>2</mn></msup><mo stretchy=\"false\">−</mo><mn>3</mn><mi>x</mi><mo stretchy=\"false\">+</mo><mn>2</mn><mo stretchy=\"false\">−</mo><mi>k</mi><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>이다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>k</mi><mo stretchy=\"false\">≠</mo><mn>0</mn></mrow></math>이므로<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">=</mo><mn>1</mn></mrow></math>은 이 방정식의 근이 될 수 없다. 교점이 한 개이려면 판별식<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn><mo stretchy=\"false\">+</mo><mn>4</mn><mi>k</mi><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>이어야 한다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>k</mi><mo>=</mo><mfrac><mrow><mrow><mo>−</mo><mn>1</mn></mrow></mrow><mrow><mn>4</mn></mrow></mfrac></mrow></math>이다. 중근은 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>=</mo><mfrac><mrow><mn>3</mn></mrow><mrow><mn>2</mn></mrow></mfrac></mrow></math>로, 제외값 1과 다르다."
    ],
    "verification": {
      "method": "rational-tangent",
      "nonzero": true,
      "discriminant": "1+4k",
      "expected": -0.25,
      "root": 1.5
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  },
  {
    "id": "dssp1-h6",
    "subunit": "무리함수",
    "version": "original-20261124-v1",
    "course": "advanced",
    "type": "intersection",
    "level": 3,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi><mo stretchy=\"false\">&lt;</mo><mo stretchy=\"false\">−</mo><mn>2</mn></mrow></math>일 때, 두 그래프 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><msqrt><mi>x</mi><mo>+</mo><mn>2</mn></msqrt></mrow></math>와 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><mi>x</mi><mo>−</mo><mi>a</mi></mrow></math>의 교점이 정확히 한 개가 되도록 하는<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi></mrow></math>의 값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mrow><mo>−</mo><mn>3</mn></mrow></mrow><mrow><mn>1</mn></mrow></mfrac></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mrow><mo>−</mo><mn>5</mn></mrow></mrow><mrow><mn>2</mn></mrow></mfrac></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mrow><mo>−</mo><mn>9</mn></mrow></mrow><mrow><mn>4</mn></mrow></mfrac></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mrow><mo>−</mo><mn>17</mn></mrow></mrow><mrow><mn>8</mn></mrow></mfrac></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mrow><mo>−</mo><mn>2</mn></mrow></mrow><mrow><mn>1</mn></mrow></mfrac></mrow></math>"
    ],
    "answer": 2,
    "hint": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>t</mi><mo>=</mo><msqrt><mrow><mi>x</mi><mo>+</mo><mn>2</mn></mrow></msqrt></mrow></math>로 놓으면 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>t</mi><mo>≥</mo><mn>0</mn></mrow></math>, <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>=</mo><msup><mi>t</mi><mn>2</mn></msup><mo>−</mo><mn>2</mn></mrow></math>예요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>t</mi><mo stretchy=\"false\">=</mo><msqrt><mi>x</mi><mo stretchy=\"false\">+</mo><mn>2</mn></msqrt><mo stretchy=\"false\">≥</mo><mn>0</mn></mrow></math>으로 놓으면<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>t</mi><mo stretchy=\"false\">=</mo><msup><mi>t</mi><mn>2</mn></msup><mo stretchy=\"false\">−</mo><mn>2</mn><mo stretchy=\"false\">−</mo><mi>a</mi><mo stretchy=\"false\">,</mo></mrow></math>즉<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msup><mi>t</mi><mn>2</mn></msup><mo stretchy=\"false\">−</mo><mi>t</mi><mo stretchy=\"false\">−</mo><mo stretchy=\"false\">(</mo><mi>a</mi><mo stretchy=\"false\">+</mo><mn>2</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>이다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi><mo stretchy=\"false\">&lt;</mo><mo stretchy=\"false\">−</mo><mn>2</mn></mrow></math>이므로 두 근의 곱은 양수이고 합은 1이다. 실근이 존재하면 두 근이 모두 양수이므로, 교점이 한 개이려면 중근이어야 한다.",
      "판별식<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn><mo stretchy=\"false\">+</mo><mn>4</mn><mo stretchy=\"false\">(</mo><mi>a</mi><mo stretchy=\"false\">+</mo><mn>2</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>에서 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi><mo>=</mo><mfrac><mrow><mrow><mo>−</mo><mn>9</mn></mrow></mrow><mrow><mn>4</mn></mrow></mfrac></mrow></math>이다. 이때 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>t</mi><mo>=</mo><mfrac><mrow><mn>1</mn></mrow><mrow><mn>2</mn></mrow></mfrac><mo>,</mo><mi>x</mi><mo>=</mo><mfrac><mrow><mrow><mo>−</mo><mn>7</mn></mrow></mrow><mrow><mn>4</mn></mrow></mfrac></mrow></math>이며 원래 식을 만족한다."
    ],
    "verification": {
      "method": "radical-tangent",
      "constraint": "a<-2",
      "expected": -2.25,
      "t": 0.5,
      "x": -1.75
    },
    "book": null,
    "sourceKind": "original",
    "rights": "deltaskill-original"
  }
];
if(Array.isArray(window.DSStudentDeskPracticeBank))BANK.push(...window.DSStudentDeskPracticeBank);
const byId=new Map(BANK.map(q=>[q.id,q]));
const COURSES=[{id:'concept',name:'이론과 기본개념',intro:'개념을 읽고 쉬운 문제로 확인해요.'},{id:'types',name:'주요 유형',intro:'대표 문제를 풀고 약한 유형을 다시 공부해요.'},{id:'supplement',name:'부교재로 연습',intro:'교재와 범위를 골라 온라인으로 풀어요.'},{id:'advanced',name:'고난도 도전',intro:'시작 단계와 풀이 결과에 맞춰 한 단계씩 올라가요.'}];
const TYPES={value:'함숫값과 역으로 대입하기',domain:'분모와 정의역',translation:'평행이동과 점근선',range:'함수의 치역','radical-domain':'근호 안의 조건','radical-equation':'무리방정식과 무연근',intersection:'두 그래프의 교점'};
const BOOKS=[{id:'rational',title:'유리함수 핵심 연습',description:'함숫값 · 역으로 대입하기 · 점근선',source:'델타스킬 자체 제작',ids:['dssp1-s1','dssp1-s2','dssp1-s3']},{id:'radical',title:'무리함수 핵심 연습',description:'근호의 조건 · 제곱과 검산',source:'델타스킬 자체 제작',ids:['dssp1-s4','dssp1-s5','dssp1-s6']}];
const CONCEPTS={value:{name:'대입하기 전에 분모 확인',body:'유리함수의 함숫값은 분자와 분모에 같은 수를 대입해 구해요. 먼저 그 수에서 분모가 0이 아닌지 확인하세요.'},domain:{name:'분모는 0이 될 수 없어요',body:'유리식은 분모가 0인 곳에서 정의되지 않아요. 약분이 되더라도 처음 주어진 식에서 제외한 값은 함부로 되돌릴 수 없어요.'},translation:{name:'점근선 두 개로 위치 읽기',body:'기본 유리함수를 좌우·위아래로 옮기면 두 점근선도 함께 옮겨져요. 분모가 0인 수직선과 함수값이 가까워지는 수평선을 구별하세요.'},range:{name:'치역은 실제로 나오는 함숫값',body:'제곱근의 값은 0 이상이에요. 유리함수에서는 분수 부분이 0이 될 수 있는지 따져, 빠지는 함숫값을 확인해요.'},'radical-domain':{name:'근호 안은 0 이상',body:'실수 범위에서 제곱근 안의 식은 0 이상이어야 해요. 부등식을 풀 때 음수로 나누면 부등호 방향이 바뀌는 것도 확인하세요.'},'radical-equation':{name:'제곱하기 전 부호, 제곱한 뒤 검산',body:'제곱근은 음수가 아니므로 반대쪽도 0 이상이어야 해요. 제곱하면 원래 식을 만족하지 않는 근이 생길 수 있어, 마지막에 반드시 대입해 확인해요.'},intersection:{name:'같은 점에서는 두 y값이 같아요',body:'두 함수식을 같게 놓아 <math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi>x</mi></mrow></math>좌표의 후보를 구해요. 분모가 0이 되는 값과 근호의 조건을 다시 확인한 뒤 <math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi>y</mi></mrow></math>좌표를 구하세요.'}};
const REASONS={concept:'개념을 다시 확인할래요',condition:'조건이나 질문을 놓쳤어요',calculation:'계산을 다시 확인할래요',unknown:'아직 이유를 모르겠어요'};
const FREE_CONCEPTS={
 '지수와 로그':{title:'같은 밑으로 바꾸고 지수를 비교해요',body:'거듭제곱의 곱에서는 지수를 더하고, 거듭제곱을 다시 거듭제곱하면 지수를 곱해요. 로그는 주어진 수가 밑의 몇 제곱인지 나타내요. 로그의 밑은 양수이면서 1이 아니어야 하고, 진수는 양수여야 해요.',formula:'<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msup><mi>a</mi><mi>p</mi></msup><mo>×</mo><msup><mi>a</mi><mi>q</mi></msup><mo>=</mo><msup><mi>a</mi><mrow><mi>p</mi><mo>+</mo><mi>q</mi></mrow></msup><mspace width="1em"/><mo>(</mo><mi>a</mi><mo>&gt;</mo><mn>0</mn><mo>)</mo></mrow></math>'},
 '다항함수의 미분법':{title:'미분한 다음, 주어진 수를 대입해요',body:'미분계수는 그 점에서의 순간변화율이에요. 다항함수는 각 항을 미분하고 더해요. 상수항을 미분하면 0이 되고, 특정 점의 미분계수는 도함수에 그 점의 값을 대입해 구해요. 아래 식의 n은 양의 정수예요.',formula:'<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>=</mo><msup><mi>x</mi><mi>n</mi></msup><mo>⇒</mo><msup><mi>f</mi><mo>′</mo></msup><mo>(</mo><mi>x</mi><mo>)</mo><mo>=</mo><mi>n</mi><msup><mi>x</mi><mrow><mi>n</mi><mo>−</mo><mn>1</mn></mrow></msup></mrow></math>'},
 '순열과 조합':{title:'중복을 허용하는지 먼저 읽어요',body:'순서가 있는 선택인지, 같은 대상을 다시 골라도 되는지 먼저 확인해요. 서로 다른 n개 중 중복을 허락해 r개를 차례로 고르면, 각 자리에 n가지씩 가능하므로 경우의 수는 다음과 같아요. n과 r은 양의 정수예요.',formula:'<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msup><mi>n</mi><mi>r</mi></msup></mrow></math>'},
 '함수의 극한과 연속':{title:'왼쪽과 오른쪽에서 가는 값을 구별해요',body:'어떤 점에서 함수의 극한값이 존재하려면 왼쪽에서 가까이 갈 때의 값과 오른쪽에서 가까이 갈 때의 값이 같아야 해요. 극한값과 그 점의 함숫값이 같은지도 확인해야 연속을 판단할 수 있어요.',formula:'<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><munder><mi>lim</mi><mrow><mi>x</mi><mo>→</mo><msup><mi>a</mi><mo>−</mo></msup></mrow></munder><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>=</mo><munder><mi>lim</mi><mrow><mi>x</mi><mo>→</mo><msup><mi>a</mi><mo>+</mo></msup></mrow></munder><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo></mrow></math>'}
};
// Publicly reachable exam files have no recorded permission for this study route.
function heldExam(id){return (window.DSBasicExamV34?.questions||[]).some(q=>q.canonical===true&&q.id===id);}
const controllers=new WeakMap();let lastController=null;
function blank(){return {version:1,records:[],pending:{},sourcePending:{},grade:3,course:'concept',book:'rational'};}
function clean(raw){const s=blank();if(!raw||raw.version!==1)return s; s.grade=[1,2,3,4,5,6,7,8,9].includes(raw.grade)?raw.grade:3;s.course=COURSES.some(c=>c.id===raw.course)?raw.course:'concept';s.book=BOOKS.some(b=>b.id===raw.book)?raw.book:'rational';const seen=new Set();for(const r of Array.isArray(raw.records)?raw.records.slice(-250):[]){const q=byId.get(r?.questionId);if(!q||r.version!==q.version||typeof r.id!=='string'||r.id.length>100||seen.has(r.id)||!Number.isFinite(r.at)||!(r.choice===null||Number.isInteger(r.choice)&&r.choice>=0&&r.choice<5))continue;seen.add(r.id);s.records.push({id:r.id,questionId:q.id,version:q.version,course:q.course,type:q.type,level:q.level,at:r.at,updatedAt:Number.isFinite(r.updatedAt)?Math.max(r.at,r.updatedAt):r.at,choice:r.choice,correct:r.choice===q.answer,confidence:r.confidence==='sure'?'sure':'unsure',help:Boolean(r.help),solutionSeen:Boolean(r.solutionSeen),repeated:Boolean(r.repeated),reason:Object.hasOwn(REASONS,r.reason)?r.reason:'',seconds:Math.max(0,Math.min(86400,Number(r.seconds)||0))});}for(const course of COURSES){const p=raw.pending?.[course.id];if(p?.cleared===true&&Number.isFinite(p.updatedAt)){s.pending[course.id]={cleared:true,updatedAt:p.updatedAt};continue;}if(!p||!Array.isArray(p.pool)||!p.pool.length||p.pool.length>24||!p.pool.every(id=>byId.has(id))||!Number.isInteger(p.cursor)||p.cursor<0||p.cursor>=p.pool.length||!Number.isFinite(p.updatedAt))continue;const q=byId.get(p.pool[p.cursor]);const feedback=s.records.find(r=>r.id===p.feedbackId&&r.questionId===q.id);s.pending[course.id]={book:BOOKS.some(b=>b.id===p.book)?p.book:'rational',pool:[...p.pool],cursor:p.cursor,choice:Number.isInteger(p.choice)&&p.choice>=0&&p.choice<5?p.choice:null,confidence:p.confidence==='unsure'?'unsure':'sure',help:Boolean(p.help),hint:Boolean(p.hint),solution:Boolean(p.solution)&&Boolean(feedback),feedbackId:feedback?.id||null,openedAt:Number.isFinite(p.openedAt)?p.openedAt:Date.now(),updatedAt:p.updatedAt};}for(const course of COURSES){const p=raw.sourcePending?.[course.id];if(!p||!Number.isFinite(p.updatedAt))continue;if(p.cleared===true){s.sourcePending[course.id]={cleared:true,updatedAt:p.updatedAt};continue;}if(typeof p.questionId!=='string'||!p.questionId.length||p.questionId.length>160||typeof p.version!=='string'||p.version.length>160||!(p.choice===null||Number.isSafeInteger(p.choice)&&Math.abs(p.choice)<=1000000000)||!Number.isFinite(p.openedAt))continue;s.sourcePending[course.id]={questionId:p.questionId,version:p.version,choice:p.choice,confidence:p.confidence==='unsure'?'unsure':'sure',help:Boolean(p.help),openedAt:p.openedAt,updatedAt:p.updatedAt};}return s;}
function mergeProgress(remote,local){const r=clean(remote),l=clean(local),map=new Map(r.records.map(v=>[v.id,v]));for(const v of l.records){const old=map.get(v.id);if(!old||v.updatedAt>old.updatedAt)map.set(v.id,v);}const pending={...r.pending};for(const [id,p]of Object.entries(l.pending))if(!pending[id]||p.updatedAt>pending[id].updatedAt)pending[id]=p;const sourcePending={...r.sourcePending};for(const [id,p]of Object.entries(l.sourcePending))if(!sourcePending[id]||p.updatedAt>sourcePending[id].updatedAt)sourcePending[id]=p;const merged=clean({...l,pending,sourcePending,records:[...map.values()].sort((a,b)=>a.at-b.at)});if(remote?.studyPlan)merged.studyPlan=remote.studyPlan;return merged;}
function latest(state){const map=new Map();for(const r of [...state.records].sort((a,b)=>a.at-b.at))map.set(r.questionId,r);return map;}
function weak(r){return r&&(!r.correct||r.confidence!=='sure'||r.help||r.reason);}
function summary(state){const rows=[...latest(state).values()];return {answered:rows.length,correct:rows.filter(r=>r.correct).length,review:rows.filter(weak).length,attempts:state.records.length};}
function tier(state,target=state.grade){const seen=latest(state);let level=Number(target)<=2?2:1;while(level<3&&BANK.filter(q=>q.course==='advanced'&&q.level===level).every(q=>{const r=seen.get(q.id);return r?.correct&&r.confidence==='sure'&&!r.help;}))level++;return level;}
function cards(){return COURSES.map((c,i)=>`<button class="ssp-course" data-ssp-course="${c.id}"><span>0${i+1}</span><strong>${c.name}</strong><small>${c.intro}</small></button>`).join('');}
function openingQuestion(){return BANK.find(q=>q.course==='types'&&!q.originalQuestionId);}
function deskShell(){
 const first=openingQuestion();
 return `<section class="ssp ssp-desk sl54-shell student-signed-in" data-plan-phase="loading" aria-label="내신 공부하기">
  <header class="ssil-heading"><h1>등급을올리는공부부터</h1><a href="#account" data-ssil-account="study">학습 기록 보기 ↗</a></header>
  <div class="ssil-main">
   <div class="ssil-today ssil-live-paper ssp-body"><article class="ssp-paper"><h2 class="ssp-problem-heading">${esc(first.subject)} · ${esc(subunit(first))}</h2><div class="ssp-prompt">${first.prompt}</div></article></div>
   <aside class="ssil-review ssp-desk-controls" aria-label="학습 설정">
    <div data-study-plan aria-label="나의 학습 계획"></div>
    <p class="ssp-plan-status" aria-live="polite" hidden></p>
    <div class="ssp-desk-filters"></div>

   </aside>
  </div><div class="ssp-live" aria-live="polite" role="status"></div>
  <footer class="ssp-record-link"><a href="#account" data-ssil-account="study">내 공부 기록 <span aria-hidden="true">↗</span></a></footer></section>`;
}
function deskSelect(attr,label,items,value){
 return `<label>${esc(label)}<select ${attr}>${items.map(item=>`<option value="${esc(item.id)}" ${item.id===value?'selected':''} ${item.disabled?'disabled':''}>${esc(item.label)}</option>`).join('')}</select></label>`;
}
function workbookChoices(){
 return [...new Map([...(window.DSPrintScopeData?.books||[]).map(b=>({...b,series:'쎈'})),...(window.DSWorkbookScope?.books||[])].map(b=>[b.id,b])).values()];
}
// Section names follow the publisher's 2022-revision common mathematics 2 and calculus I contents.
// https://22txbook.m-teacher.co.kr/book/view?id=62 and https://22txbook.m-teacher.co.kr/book/view?id=67
const studyChapters=[
 ['공통수학2','Ⅰ 도형의 방정식',[
  ['평면좌표와 직선의 방정식',['선분의 내분','직선의 위치 관계','점과 직선 사이의 거리']],
  ['원의 방정식',['원의 방정식','원과 직선의 위치 관계']],['도형의 이동',['평행이동','대칭이동']]]],
 ['공통수학2','Ⅱ 집합과 명제',[
  ['집합',['집합','집합 사이의 포함 관계','교집합과 합집합','여집합과 차집합']],
  ['명제',['명제와 조건','명제 사이의 관계','명제의 증명']]]],
 ['공통수학2','Ⅲ 함수와 그래프',[
  ['함수',['함수','합성함수','역함수']],['유리함수와 무리함수',['유리함수','무리함수']]]],
 ['미적분Ⅰ','Ⅰ 함수의 극한과 연속',[
  ['함수의 극한',['함수의 극한','함수의 극한에 대한 성질']],['함수의 연속',['함수의 연속','연속함수의 성질']]]],
 ['미적분Ⅰ','Ⅱ 미분',[
  ['미분계수와 도함수',['미분계수','도함수']],
  ['도함수의 활용',['접선의 방정식','평균값 정리','함수의 증가와 감소, 극대와 극소','함수의 그래프','방정식과 부등식에의 활용','속도와 가속도']]]],
 ['미적분Ⅰ','Ⅲ 적분',[
  ['부정적분과 정적분',['부정적분','정적분']],['정적분의 활용',['넓이','속도와 거리']]]],
 // 미래엔 2022 개정 교과서 목차, 기하(id=69)·확률과 통계(id=66). 학교별 시험 범위는 별도다.
 ['기하','Ⅰ 이차곡선',[]],['기하','Ⅱ 공간도형과 공간좌표',[]],['기하','Ⅲ 벡터',[]],
 ['확률과 통계','Ⅰ 경우의 수',[]],['확률과 통계','Ⅱ 확률',[]],['확률과 통계','Ⅲ 통계',[]]
];
const electiveSubject=subject=>subject==='기하'||subject==='확률과 통계';
const studyScopes=studyChapters.flatMap(([subject,chapter,sections])=>[
 {key:chapter,subject,chapter,sections},
 ...sections.map(section=>({key:section[0],subject,chapter,sections:[section]}))
]);
// Map publisher unit labels to textbook sections. Catalog requests always use original unit IDs.
const workbookSectionNames={
 '평면좌표':'평면좌표와 직선의 방정식','직선의 방정식':'평면좌표와 직선의 방정식',
 '집합의 뜻과 표현':'집합','집합의 연산':'집합','유리식과 유리함수':'유리함수와 무리함수',
 '무리식과 무리함수':'유리함수와 무리함수','부정적분':'부정적분과 정적분','정적분':'부정적분과 정적분'
};
function workbookRanges(book){
 const units=book?.units||[];
 const sections=new Map();
 for(const unit of units){
  const title=unit.label.replace(/^\d+\s+/,'').replace(/\s+\(\d+\)$/,'');
  const key=workbookSectionNames[title]||title;
  if(!sections.has(key))sections.set(key,[]);
  sections.get(key).push(unit);
 }
 const options=[],seen=new Set();
 for(const [subject,chapter,entries] of studyChapters){
  if(book.subject!==subject)continue;
  const groups=entries.map(([name])=>({name,rows:sections.get(name)||[]})).filter(group=>group.rows.length);
  if(groups.length>1){
   options.push({id:'chapter:'+chapter,label:chapter+' · 연결 단원 전체',unitIds:groups.flatMap(group=>group.rows.map(u=>u.id)),types:[]});
  }
  for(const {name,rows} of groups){
   if(rows.length>1)options.push({id:'section:'+name,label:name+' 전체',unitIds:rows.map(u=>u.id),types:[]});
   options.push(...rows);
   rows.forEach(u=>seen.add(u.id));
  }
 }
 return options.concat(units.filter(u=>!seen.has(u.id)));
}
function subunit(q){return q.subunit||byId.get(q.originalQuestionId)?.subunit||'';}
function inScope(q,scope){
 return q.subject===scope.subject&&scope.sections.some(([unit,leaves])=>q.unit===unit&&leaves.includes(subunit(q)));
}
function shell(options={}){return `<section class="ssp" aria-label="내신 공부하기"><header class="ssp-heading"><div><p class="ssp-kicker">회원 무료 · 내신 공부</p><h1>내신 공부하기</h1><p>기존 자료에서 공부할 범위를 고르고, 필요한 부분을 복습하세요.</p></div><a href="#account">내 공부 기록</a></header><nav class="ssp-courses" aria-label="공부 코스">${cards()}</nav><div class="ssp-live" aria-live="polite" role="status"></div><div class="ssp-body"><p>공부 화면을 준비하고 있어요.</p></div></section>`;}
function render(options={}){
 if(options.view==='history')return '<section class="ssp ssp-account-history" aria-label="내 공부 기록"><div class="ssp-live" aria-live="polite" role="status"></div><div class="ssp-body"></div></section>';
 return options.view==='desk'?deskShell():shell(options);
}
function bind(container,options={}){
 if(!container||typeof container.querySelector!=='function')throw Error('study_container_required');controllers.get(container)?.destroy();
 if(!container.querySelector('.ssp'))container.innerHTML=render(options);
 let readyNotified=false;const notifyReady=()=>{if(readyNotified||closed)return;readyNotified=true;queueMicrotask(()=>{if(!closed)options.onReady?.();});};
 let state=blank(),current=null,pool=[],cursor=0,choice=null,confidence='sure',help=false,hint=false,feedback=null,solution=false,openedAt=Date.now(),notice='',storageMessage='',view=options.view==='history'?'history':'home',closed=false,epoch=0,saveQueue=Promise.resolve();
 const desk=options.view==='desk';
 const guestTrial=desk&&options.guestTrial===true;
 const trialKey='ds-student-guest-study-v1';
 const temporaryKey=guestTrial?trialKey:'ds-student-paths-preview-v1';
 const trialLimit=3;
 let trialReturnView='question';
 const isTrialQuestion=q=>q?.sourceKind==='original'&&q.rights==='deltaskill-original';
 let trialOpened=new Set();
 if(guestTrial){
  try{trialOpened=new Set(JSON.parse(sessionStorage.getItem(trialKey+':opened')||'[]').filter(id=>isTrialQuestion(byId.get(id))));}catch{}
 }
 function openTrialQuestion(q){
  if(!isTrialQuestion(q))return false;
  if(trialOpened.has(q.id))return true;
  if(trialOpened.size>=trialLimit)return false;
  trialOpened.add(q.id);
  try{sessionStorage.setItem(trialKey+':opened',JSON.stringify([...trialOpened]));}catch{}
  return true;
 }
 const trialBooks=BOOKS.map(book=>({id:'original:'+book.id,label:'델타스킬 · '+book.title,subject:'공통수학2',original:book.id}));
 const bookMenu=()=>guestTrial?[...trialBooks,...workbookChoices()]:offeredBooks();
 function trialNotice(){
  const wrong=[...latest(state).values()].reverse().find(weak);
  return '<div class="ssp-actions"><a class="ssp-primary" href="#login">로그인하고 계속 공부하기</a>'
   +(wrong?'<button type="button" data-ssp-guest-review>틀린 문제 다시 풀기</button>':'')
   +(view==='guest-limit'?[...trialOpened].map((id,index)=>'<button type="button" data-ssp-open="'+esc(id)+'">체험 '+(index+1)+'번 다시 보기</button>').join(''):'')+'</div>';
 }
 let deskUnit='',deskType='',deskFilterHTML=null;
 const studyPlan=window.DSStudentStudyPlan;
 let planPhase='loading',planProfile=null,planStep=0,planDraft={},planCourse='',planBusy=false,planMessage='';
 let planHTML=null;
 const subjects=[...new Set(studyChapters.map(([subject])=>subject))];
 let externalRange=false,planSourceUnit=null,planSourceRows=null;
 let supplyPhase='idle',supplyByBook=new Map();
 let guestCells=[],guestRange=null,guestQuestion='',guestBusy=false,guestError='',guestLeft=null,guestRequest=0;
 let guestTicket=null,guestStylePromise=null;
 function guestMathStyle(){
  if(!guestStylePromise)guestStylePromise=fetch('/app/assets/vendor/katex-0.18.4/katex-embed.css?v=24.3').then(response=>{if(!response.ok)throw Error('math_style');return response.text();}).then(css=>{if(!css.includes('KaTeX_Main')||!css.includes('data:'))throw Error('math_style');return css;}).catch(error=>{guestStylePromise=null;throw error;});
  return guestStylePromise;
 }
 function guestFailure(error){
  if(error?.code==='trial_limit')return '오늘 로그인 없이 풀 수 있는 문항을 모두 풀었어요. 로그인하면 이어서 공부할 수 있어요.';
  if(error?.status===429||error?.code==='rate_limited')return '요청이 잠시 많아요. 잠시 후 다시 확인해 주세요.';
  return '공개 체험 문항을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.';
 }
 async function loadGuestSupply(generation){
  supplyPhase='loading';guestCells=[];void guestMathStyle().catch(()=>{});
  try{
   const host=window.DSDrawHostV59;await host?.ready;
   if(typeof host?.trial?.menu!=='function')throw Error('trial_unavailable');
   const data=await host.trial.menu();
   if(closed||generation!==epoch||signed())return;
   if(!Array.isArray(data.cells))throw Error('trial_menu');
   guestCells=data.cells.filter(cell=>typeof cell.cell_key==='string'&&typeof cell.subject==='string'&&typeof cell.unit==='string'&&cell.size>0);
   supplyPhase='guest';planMessage='로그인 없이 공개된 대단원 문항을 바로 풀어볼 수 있어요. 로그인하면 푼 기록이 남아요.';
  }catch(error){if(closed||generation!==epoch||signed())return;supplyPhase='error';planMessage=guestFailure(error);}
  draw(false);
 }
 async function openGuestQuestion(retry=false){
  if(!guestTrial||signed()||!guestRange||guestBusy)return;
  const serial=++guestRequest,generation=epoch,cell=guestRange;guestBusy=true;guestError='';view='trial-source';draw(false);
  try{
   const api=window.DSDrawHostV59?.trial;if(!api?.draw||!api?.open)throw Error('trial_unavailable');
   if(!retry||guestTicket?.cell!==cell.cell_key){
    guestTicket=null;
    const result=await api.draw(cell.cell_key,1);
    if(closed||serial!==guestRequest||generation!==epoch||signed())return;
    if(!Array.isArray(result.items)||result.items.length!==1||typeof result.items[0].item_id!=='string'||typeof result.ticket!=='string')throw Error('trial_draw');
    guestTicket={cell:cell.cell_key,id:result.items[0].item_id,ticket:result.ticket};guestLeft=result.left;
   }
   const item=guestTicket;const opened=await api.open(item.cell,item.id,item.ticket);
   if(closed||serial!==guestRequest||generation!==epoch||signed())return;
   if(opened.item_id!==item.id||typeof opened.question_html!=='string'||opened.question_html.length>1048576)throw Error('trial_open');
   const css=await guestMathStyle();
   if(closed||serial!==guestRequest||generation!==epoch||signed())return;
   guestQuestion=fragmentContent('<style>'+css+'</style>'+opened.question_html,'공개 체험 문제');
  }catch(error){if(closed||serial!==guestRequest||generation!==epoch||signed())return;guestError=guestFailure(error);if(error?.code==='trial_limit')guestLeft=0;}
  finally{if(serial===guestRequest&&generation===epoch){guestBusy=false;draw(false);}}
 }
 function guestQuestionHTML(){
  const shown=Boolean(guestQuestion),left=Number.isInteger(guestLeft)?`오늘 더 볼 수 있는 공개 문항 ${guestLeft}개`:'공개 문항 체험';
  return `<article class="ssp-paper"><h2 tabindex="-1">${esc(guestRange?.unit||'공개 문항')} · 체험</h2>${guestBusy?'<p role="status">문제를 불러오고 있어요.</p>':''}${guestQuestion}${guestError?`<p role="status">${esc(guestError)}</p>`:''}${shown?`<p class="ssp-note">${left} · 해설 확인과 학습 기록은 로그인 후 이용할 수 있어요.</p>`:''}<div class="ssp-actions">${guestError&&guestTicket?`<button data-ssp-guest-open-retry ${guestBusy?'disabled':''}>같은 문제 다시 열기</button>`:''}${guestLeft!==0?`<button data-ssp-guest-next ${guestBusy?'disabled':''}>${shown?'다음 문항':'문제 다시 불러오기'}</button>`:''}${shown||guestLeft===0?'<a class="ssp-primary" href="#login">로그인하고 해설·학습 기록 이용하기</a>':''}</div></article>`;
 }

 async function loadSupply(){
  const generation=epoch;
  supplyByBook=new Map();supplyPhase=signed()?'loading':'guest';
  if(!signed()){if(guestTrial)await loadGuestSupply(generation);return;}
  try{
   const result=await window.DSStudentServices.catalog({purpose:'study_free',sourceKind:'existing_print'});
   if(closed||generation!==epoch)return;
   const books=new Map(workbookChoices().map(book=>[book.id,book]));
   for(const row of result.questions){
    const id=row.questionId||row.id;
    if(row.sourceKind!=='existing_print'||!id||heldExam(id)||!row.version||books.get(row.bookId)?.subject!==row.subject)continue;
    if(!supplyByBook.has(row.bookId))supplyByBook.set(row.bookId,[]);
    supplyByBook.get(row.bookId).push(row);
   }
   supplyPhase='ready';
  }catch{if(closed||generation!==epoch)return;supplyPhase='error';}
  draw(false);
 }
 function availableRows(book,unitIds){
  return (supplyByBook.get(book.id)||[]).filter(row=>(row.unitIds||[row.unitId]).some(id=>unitIds.includes(id)));
 }
 function availableRanges(book){
  return workbookRanges(book).filter(unit=>availableRows(book,unit.unitIds||[unit.id]).length);
 }
 function offeredBooks(){
  return workbookChoices().filter(book=>availableRanges(book).length);
 }
 function balancedRows(rows){
  const groups=new Map();
  for(const row of rows){
   const key=row.bookId+'|'+(row.typeId||row.typeIds?.[0]||row.unitId);
   if(!groups.has(key))groups.set(key,[]);
   groups.get(key).push(row);
  }
  const shuffled=Array.from(groups.values());
  for(const group of [shuffled,...shuffled]){
   for(let i=group.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[group[i],group[j]]=[group[j],group[i]];}
  }
  const result=[];
  for(let index=0;result.length<rows.length;index++){
   const next=shuffled.map(group=>group[index]).filter(Boolean);
   if(!next.length)break;
   result.push(...next);
  }
  return result;
 }
 function newPlanDraft(){return {goal:'',need:'',subject:'',unit:''};}
 function planUnits(subject,need){
  if(!subjects.includes(subject)||!Object.hasOwn(studyPlan.courses,need))return [];
  if(guestTrial&&need!=='supplement'){const difficulty={concept:'쉬움',types:'보통',advanced:'어려움'}[need];return guestCells.filter(cell=>cell.subject===subject&&cell.difficulty===difficulty).map(cell=>({id:'trial:'+cell.cell_key,label:cell.unit,group:cell.subject,guestCell:cell}));}
  const availableBooks=workbookChoices().filter(book=>book.subject===subject);
  if(guestTrial&&need==='supplement')return trialBooks.filter(book=>book.subject===subject).flatMap(book=>{
   const rows=BANK.filter(q=>isTrialQuestion(q)&&q.book===book.original&&!q.originalQuestionId);
   return [...new Set(rows.map(subunit))].map(leaf=>({id:book.id+'/'+leaf,label:leaf,book:book.id,originalBook:book.original}));
  });
  if(need==='supplement')return availableBooks.flatMap(book=>availableRanges(book).map(unit=>({
   id:book.id+'/'+unit.id,group:book.label,label:unit.label,book:book.id,bookUnit:unit.id
  })));
  const originals=BANK.filter(q=>q.subject===subject&&q.course===need&&!q.originalQuestionId&&(!guestTrial||isTrialQuestion(q)));
  const edition={concept:'OL-base-',types:'OL-type-',advanced:'OL-advanced-'}[need];
  const sources=availableBooks.filter(book=>need==='advanced'||book.id.startsWith(edition));
  if(need==='types')sources.push(...availableBooks.filter(book=>book.id.startsWith('SSG-')));
  const leafNames={'유리식과 유리함수':'유리함수','무리식과 무리함수':'무리함수'};
  const units=[];
  function add(scope,leaf=''){
   const id=leaf||scope.key+' 전체';
   const entry={id,label:id,group:scope.chapter,scope:scope.key,leaf};
   const matches=originals.some(q=>inScope(q,scope)&&(!leaf||subunit(q)===leaf));
   if(!guestTrial||!matches||need==='types'){
    const rows=[];
    const sections=scope.sections.map(([name])=>name);
    for(const book of sources){
     const linked=book.units.filter(unit=>{
      const title=unit.label.replace(/^\d+\s+/,'').replace(/\s+\(\d+\)$/,'');
      return sections.includes(workbookSectionNames[title]||title)&&(!leaf||(leafNames[title]||title)===leaf);
     });
     const unitIds=linked.map(unit=>unit.id);
     const admitted=availableRows(book,unitIds).filter(row=>(need!=='types'||Boolean(row.typeId||row.typeIds?.length))&&(need!=='advanced'||book.id.startsWith('OL-advanced-')||['어려움','고난도','상','최상'].includes(row.difficulty)));
     if(admitted.length){
      if(!entry.book){entry.book=book.id;entry.bookUnit=linked[0].id;entry.unitIds=unitIds;}
      rows.push(...admitted);
     }
    }
    if(rows.length)entry.rows=rows;
    if(!entry.book&&(!guestTrial||!matches)){
     entry.disabled=true;
     entry.label+=' · 문항 준비 중';
    }
   }
   units.push(entry);
  }
  for(const scope of studyScopes.filter(scope=>scope.subject===subject)){
   add(scope);
   if(scope.key!==scope.chapter)for(const leaf of scope.sections[0][1])add(scope,leaf);
  }
  return units.filter(unit=>!unit.disabled);
 }
 function openFirstQuestion(){
  const first=openingQuestion();
  state.course=first.course;deskScope=first.unit;
  localPage(localSet(first),0,false);
 }
 async function loadPlan(){
  const generation=epoch;
  planPhase='loading';planStep=0;planDraft=newPlanDraft();planProfile=null;planBusy=false;planMessage='';
  if(guestTrial){
   try{planProfile=JSON.parse(sessionStorage.getItem(trialKey+':plan'));}catch{}
   planPhase=planProfile?'return':'survey';draw(false);return;
  }
  try{
   const saved=await window.DSStudyPlanStore.load(activeOwner);
   if(closed||generation!==epoch)return;
   planProfile=saved;planPhase=saved?'return':'survey';
  }catch{
   if(closed||generation!==epoch)return;
   planPhase='load-error';planMessage='저장된 학습 계획을 불러오지 못했어요.';
  }
  draw(false);
 }
 function startRange(profile,range){
  if(guestTrial&&range.guestCell){state.course=planCourse=profile.need;planPhase='active';externalRange=false;planSourceRows=null;planSourceUnit=null;guestRange=range.guestCell;guestQuestion='';guestError='';view='trial-source';void openGuestQuestion();return;}
  guestRequest++;guestRange=null;guestQuestion='';
  planCourse=state.course=profile.need;planPhase='active';deskType='';widen='subunit';
  if(guestTrial&&range.originalBook){
   externalRange=false;planSourceRows=null;planSourceUnit=null;state.book=range.originalBook;
   const rows=BANK.filter(q=>isTrialQuestion(q)&&q.book===state.book&&!q.originalQuestionId&&subunit(q)===range.label);
   deskScope=rows[0]?.unit||'';deskUnit=range.label;
   rememberDesk();invalidateSource();localPage(deskPool(rows),0);save();draw();return;
  }
  externalRange=Boolean(range.book);planSourceRows=range.rows||null;
  planSourceUnit=range.unitIds?{id:range.id,label:range.label,unitIds:range.unitIds,types:[]}:null;
  if(range.book){selectedScopeBook=range.book;selectedScopeUnit=range.bookUnit;selectedScopeType='';}
  else{deskScope=range.scope;deskUnit=range.leaf||'';}
  startDesk(profile.need);
  if(current){
   if(feedback&&cursor+1<pool.length)localPage(pool,cursor+1);
   save();
  }
  draw();
 }
 function continuePlan(){
  planPhase='active';
  if(supplyPhase==='loading'){planMessage='무료 학습 범위를 확인하고 있어요.';planPhase='return';draw(false);return;}
  const range=planUnits(planProfile.subject,planProfile.need).find(u=>u.id===planProfile.unit);
  if(guestTrial&&range?.guestCell){startRange(planProfile,range);return;}
  externalRange=Boolean(range?.book&&!range.originalBook);planSourceRows=range?.rows||null;
  planSourceUnit=range?.unitIds?{id:range.id,label:range.label,unitIds:range.unitIds,types:[]}:null;
  if(externalRange){selectedScopeBook=range.book;selectedScopeUnit=range.bookUnit;selectedScopeType='';widen='subunit';}
  if(externalRange&&range){
   const pending=state.sourcePending[planProfile.need];
   const book=workbookChoices().find(b=>b.id===range.book);
   const unit=book&&workbookRanges(book).find(u=>u.id===range.bookUnit);
   const candidates=range.rows||(unit?availableRows(book,unit.unitIds||[unit.id]):[]);
   const saved=candidates.find(q=>q.id===pending?.questionId&&q.version===pending?.version);
   if(saved){
    state.course=planCourse=planProfile.need;view='home';current=null;
    sourceResult={questions:candidates};
    deskType=state.course==='supplement'?saved.originalGroupId||'':saved.typeId||saved.typeIds?.[0]||'';
    void openRemote(saved.id,pending);return;
   }
   startRange(planProfile,range);return;
  }
  if(range&&!range.disabled&&resume(planProfile.need)){
   planCourse=state.course;
   if(current&&view==='question'&&sourcePhase!=='opening'){externalRange=false;restoreDeskRange();}
   draw();return;
  }
  if(range&&!range.disabled&&!range.pending){startRange(planProfile,range);return;}
  planDraft={...newPlanDraft(),goal:planProfile.goal,need:planProfile.need};
  planPhase='survey';planStep=2;draw(false);
 }
 async function finishPlan(unit){
  if(planBusy||planStep!==2||!planDraft.goal||!planDraft.need)return;
  const range=planUnits(planDraft.subject,planDraft.need).find(row=>row.id===unit);
  if(!range||range.disabled||(planDraft.need==='supplement'&&range.book!==planDraft.book))return;
  planDraft.unit=unit;
  const {goal,need,subject}=planDraft;
  if(range.pending){
   window.DSStudyPlanStore.waitingRange?.(activeOwner,{goal,need,subject,unit,updatedAt:Date.now()});
   draw(false);return;
  }
  const profile={goal,need,subject,unit,updatedAt:Date.now()},generation=epoch;
  planProfile=profile;planMessage='';
  if(guestTrial){
   try{sessionStorage.setItem(trialKey+':plan',JSON.stringify(profile));}catch{}
   startRange(profile,range);return;
  }
  planBusy=true;startRange(profile,range);
  try{
   const saved=await window.DSStudyPlanStore.save(activeOwner,profile);
   if(closed||generation!==epoch)return;
   if(saved.storage==='device')planMessage='';
  }catch{if(!closed&&generation===epoch)planMessage='문제는 계속 풀 수 있어요. 학습 선택을 저장하려면 다시 선택해 주세요.';}
  finally{if(!closed&&generation===epoch){planBusy=false;draw(false);}}
 }
 async function reviewPlan(){
  if(planBusy)return;
  const generation=epoch;
  const local=[...latest(state).values()].reverse().find(weak);
  if(local){planPhase='active';planCourse=local.course;openOriginal(local.questionId);return;}
  if(guestTrial){planMessage='이 탭에서 다시 풀 문제가 아직 없어요.';draw(false);return;}
  planBusy=true;planMessage='복습할 기록을 확인하고 있어요.';draw(false);
  try{
   const seen=new Set();
   let before;
   do{
    const page=await window.DSStudentServices.history({kind:'free',limit:20,...(before?{before}:{})});
    if(closed||generation!==epoch)return;
    if(page.ownerKey!==activeOwner||!Array.isArray(page.records))throw Error('invalid_history');
    for(const r of page.records){
     if(heldExam(r.questionId)||seen.has(r.questionId))continue;seen.add(r.questionId);
     if(r.correct!==false&&r.confidence!=='unsure'&&!r.help)continue;
     planPhase='active';planMessage='';planCourse=state.course='supplement';view='home';current=null;
     await openRemote(r.questionId,{...r,choice:null,confidence:'sure',help:false});return;
    }
    if(!page.hasMore||!page.nextBefore||before===page.nextBefore)break;
    before=page.nextBefore;
   }while(true);
   planMessage='아직 복습할 문제가 없어요. 이어서 공부하면 틀리거나 헷갈린 문제가 여기에 모여요.';
  }catch{if(!closed&&generation===epoch)planMessage='복습 기록을 확인하지 못했어요. 잠시 후 다시 눌러 주세요.';}
  finally{if(!closed&&generation===epoch){planBusy=false;draw(false);}}
 }
 function handlePlanClick(b){
  if(!b.closest('[data-study-plan]'))return false;
  if(planBusy)return true;
  const value=b.value;
  if(b.hasAttribute('data-plan-supply-retry')){void loadSupply();draw(false);return true;}
  if(b.hasAttribute('data-plan-reload')){loadPlan();return true;}
  if(planPhase==='return'){
   planMessage='';
   if(b.hasAttribute('data-plan-resume'))continuePlan();
   if(b.hasAttribute('data-plan-review'))void reviewPlan();
   return true;
  }
  if(planPhase==='active'){
   if(b.hasAttribute('data-plan-reselect')){
    planDraft={...newPlanDraft(),goal:planProfile?.goal||'',need:planProfile?.need||''};
    guestRequest++;guestBusy=false;guestRange=null;guestQuestion='';
    planPhase='survey';planStep=planDraft.goal?1:0;planMessage='';draw(false);
   }
   return true;
  }
  if(planPhase!=='survey')return true;
  if(b.hasAttribute('data-plan-answer')&&planStep<2){
   if(planStep===0&&!studyPlan.isGoal(value)||planStep===1&&!Object.hasOwn(studyPlan.courses,value))return true;
   planDraft[planStep===0?'goal':'need']=value;planStep++;
   planDraft.subject='';planDraft.book='';planDraft.unit='';
  }else if(b.hasAttribute('data-plan-back')){
   if(!guestTrial)window.DSStudyPlanStore.waitingRange?.(activeOwner,null);
   planStep=Math.max(0,planStep-1);
  }
  draw(false);
  const pane=container.querySelector('[data-study-plan]');
  const target=pane.querySelector('h2,h3,legend')||pane;
  target.tabIndex=-1;target.focus({preventScroll:true});return true;
 }
 const localDrafts=new Map(),remoteDrafts=new Map();
 function rememberDesk(){
  if(!desk)return;
  if(view==='question'&&current)localDrafts.set(current.id,{choice,confidence,help,hint,solution,feedback,openedAt});
  if(view==='source-question'&&remoteQuestion)remoteDrafts.set(remoteQuestion.id,{version:remoteQuestion.version,choice:remoteChoice,confidence:remoteConfidence,feedback:remoteFeedback,openedAt:remoteOpenedAt});
 }
 function localPage(list,index,restore=true){
  const q=byId.get(list[index]);if(!q)return;
  pool=list;cursor=index;resetQuestion(q);if(!current)return;
  const draft=restore&&localDrafts.get(q.id);
  if(draft){
   ({choice,confidence,help,hint,solution,feedback,openedAt}=draft);
  }else if(restore){
   const record=state.records.filter(r=>r.questionId===q.id).at(-1);
   if(record){choice=record.choice;confidence=record.confidence;help=record.help;feedback=record;solution=record.solutionSeen;}
  }
 }
 function itemPager(index,total){
  if(!total)return '';
  return `<nav class="ssp-desk-pager" aria-label="문항 이동" data-ssp-count="${total}" data-ssp-index="${index}">
   <button type="button" data-ssp-question-step="-1" aria-label="이전 문항" ${index===0||remoteBusy?'disabled':''}>‹</button>
   <span>${index+1} / ${total}문항</span>
   <button type="button" data-ssp-question-step="1" aria-label="다음 문항" ${index+1===total||remoteBusy?'disabled':''}>›</button></nav>${total<3?`<p class="ssp-note">이 범위에 연결된 문항은 ${total}개예요. 준비된 문항부터 풀 수 있어요.</p>`:''}`;
 }
 function localSet(original){
  const anchor=original.originalQuestionId||original.id;
  return BANK.filter(q=>q.course===original.course&&(!guestTrial||isTrialQuestion(q))&&(q.id===anchor||q.originalQuestionId===anchor)).slice(0,10).map(q=>q.id);
 }

 let deskScope='유리함수와 무리함수';
 function deskUnits(){
  const originals=qlist().filter(q=>!q.originalQuestionId);
  const scope=studyScopes.find(item=>item.key===deskScope);
  const groupRows=originals.filter(q=>inScope(q,scope));
  const units=scope.sections.flatMap(([,leaves])=>leaves);
  if(!units.includes(deskUnit))deskUnit='';
  const unitRows=groupRows.filter(q=>!deskUnit||subunit(q)===deskUnit);
  const types=[...new Set(unitRows.map(q=>q.type))];
  if(!types.includes(deskType))deskType='';
  return {originals,scope,units,groupRows,unitRows,types,rows:unitRows.filter(q=>!deskType||q.type===deskType)};
 }
 function restoreDeskRange(){
  if(!current)return;
  const rows=pool.map(id=>byId.get(id)).filter(Boolean);
  deskScope=current.unit;
  deskUnit=rows.every(q=>subunit(q)===subunit(current))?subunit(current):'';
  deskType=rows.every(q=>q.type===current.type)?current.type:'';
 }
 function deskScopeSelect(originals){
  return '<label>교과서 단원<select data-ssp-desk-scope>'+studyChapters.map(([subject,chapter])=>{
   const options=studyScopes.filter(scope=>scope.chapter===chapter).map(scope=>{
    const available=originals.some(q=>inScope(q,scope));
    const label=(scope.key===chapter?chapter+' 전체':scope.key)+(available?'':' · 문항 준비 중');
    return `<option value="${esc(scope.key)}" ${scope.key===deskScope?'selected':''} ${available?'':'disabled'}>${esc(label)}</option>`;
   }).join('');
   return `<optgroup label="${esc(subject+' · '+chapter)}">${options}</optgroup>`;
  }).join('')+'</select></label>';
 }
 function deskPool(rows){
  const groups=rows.map(localSet),result=[];
  for(let i=0;i<Math.max(0,...groups.map(group=>group.length));i++){
   for(const group of groups){if(group[i])result.push(group[i]);}
   if(result.length>=10)break;
  }
  return result.slice(0,10);
 }
 function deskFilters(){
  if(guestTrial&&view==='trial-source')return '';
  if(externalRange&&state.course!=='supplement')return '';
  if(externalRange||state.course==='supplement'){
   const books=offeredBooks();
   if(view==='question'&&current?.book){
    const book=BOOKS.find(b=>b.id===current.book);
    const id='original:'+current.book;
    return deskSelect('data-ssp-scope-book','부교재',[{id,label:'델타스킬 · '+(book?.title||'연습 교재')},...books],id)
     +deskSelect('disabled','단원',[{id:current.unit,label:subunit(current)}],current.unit)
     +deskSelect('disabled','유형',[{id:current.type,label:TYPES[current.type]}],current.type);
   }
   if(!books.some(b=>b.id===selectedScopeBook))selectedScopeBook=books[0]?.id||'';
   const book=books.find(b=>b.id===selectedScopeBook);
   const units=book?availableRanges(book):[];
   if(!units.some(u=>u.id===selectedScopeUnit))selectedScopeUnit=units[0]?.id||'';
   const scopeUnit=units.find(u=>u.id===selectedScopeUnit);
   const scoped=scopeUnit?availableRows(book,scopeUnit.unitIds||[scopeUnit.id]):[];
   const types=(scopeUnit?.types||[]).filter(t=>scoped.some(q=>(q.typeIds||[q.typeId]).includes(t.id)));
   if(!types.some(t=>t.id===selectedScopeType))selectedScopeType='';
   if(!selectedScopeType)widen='subunit';
   return deskSelect('data-ssp-scope-book','부교재',books,selectedScopeBook)
     +deskSelect('data-ssp-scope-unit','단원',units,selectedScopeUnit)
     +(units.find(u=>u.id===selectedScopeUnit)?.label==='유리함수와 무리함수'?'<p class="ssp-note">이 교재는 유리함수와 무리함수가 한 단원으로 연결돼 있어요.</p>':'')
     +(types.length?deskSelect('data-ssp-scope-type','유형',[{id:'',label:'단원 전체 유형'},...types],selectedScopeType):'')
     +`<nav class="ssp-chapter-nav" aria-label="단원 이동"><button type="button" data-ssp-chapter-step="-1" ${units[0]?.id===selectedScopeUnit||!units.length?'disabled':''}>← 이전 단원</button><button type="button" data-ssp-chapter-step="1" ${units.at(-1)?.id===selectedScopeUnit||!units.length?'disabled':''}>다음 단원 →</button></nav>`;
  }
  const {originals,scope,units,groupRows,types}=deskUnits();

  const rangeLabel=scope.key===scope.chapter?'대단원 전체':scope.key+' 전체';
  return deskScopeSelect(originals)
    +deskSelect('data-ssp-desk-unit','소단원',[{id:'',label:rangeLabel},...units.map(id=>({id,label:id,disabled:!groupRows.some(q=>subunit(q)===id)}))],deskUnit)
    +(types.length?deskSelect('data-ssp-desk-type','유형',[{id:'',label:'전체 유형'},...types.map(id=>({id,label:TYPES[id]||id}))],deskType):'');
 }
 function startDesk(course,restore=false){
  rememberDesk();
  if(state.course!==course)deskScope='유리함수와 무리함수';
  state.course=course;view='home';current=null;feedback=null;remoteQuestion=null;remoteFeedback=null;notice='';
  invalidateSource();
  if(restore&&resume(course)){
   if(current)restoreDeskRange();
   return;
  }
  if(externalRange||course==='supplement'){
   deskFilters();
   querySource();
  }else{
   const rows=deskUnits().rows;
   if(rows.length)localPage(deskPool(rows),0);
  }
 }
 function deskWaiting(){
  if(sourcePhase==='opening'||sourcePhase==='loading')return '<p role="status">선택한 범위에서 문제를 불러오고 있어요.</p>';
  if(sourcePhase==='error')return `<p role="alert">${esc(sourceError||notice||'문항을 불러오지 못했어요.')}</p>${lastOpen?'<button data-ssp-retry-open>다시 불러오기</button> ':''}<button data-ssp-query>범위 다시 확인</button>`;
  if(sourcePhase==='ready'&&(externalRange||state.course==='supplement'))return `<h2>선택한 범위에 연결된 무료 문항이 없어요.</h2>${widen==='subunit'?'<p>다른 단원이나 교재를 골라 주세요.</p>':'<button data-ssp-widen="subunit">이 단원의 전체 유형에서 찾기</button>'}`;
  return '<p>이 범위에는 이 공부 방법으로 풀 수 있는 문항이 아직 연결되지 않았어요. 다른 단원을 선택해 주세요.</p>';
 }
 const signed=()=>typeof options.signedIn==='function'?Boolean(options.signedIn()):typeof options.signedIn==='boolean'?options.signedIn:Boolean(window.DSService?.session?.());
 const owner=()=>signed()&&typeof options.ownerKey==='function'?String(options.ownerKey()||''):signed()?String(options.ownerKey||''):'';
 let activeOwner=owner();let lastOpen=null;let selectedSeries='쎈',selectedScopeBook='',selectedScopeUnit='',selectedScopeType='',widen='type',freeUnit=Object.keys(FREE_CONCEPTS)[0];let sourceGeneration=0,sourceResult=null,sourcePhase='idle',sourceError='',remoteQuestion=null,remoteMetadata=null,remoteChoice=null,remoteUnknown=false,desiredCount=3,remoteConfidence='sure',remoteFeedback=null,remoteOpenedAt=0,remoteBusy=false;const remoteOperations=new Map();let remoteHistory={phase:'idle',records:[],hasMore:false,nextBefore:null};
 const key=()=>activeOwner?'ds-student-paths-v1:'+encodeURIComponent(activeOwner):'';
 const emit=()=>{const detail={source:'student-study-paths',summary:summary(state),storage:storageMessage};window.dispatchEvent(new CustomEvent('ds-student-paths-change',{detail}));};
 function read(){try{const raw=key()?localStorage.getItem(key()):signed()?null:sessionStorage.getItem(temporaryKey);state=clean(raw?JSON.parse(raw):null);storageMessage=key()?'이 계정의 기기 기록':signed()?'현재 로그인 화면의 기록 · 이 화면을 닫으면 사라져요.':'이 브라우저의 임시 기록';}catch{state=blank();storageMessage='저장 공간을 사용할 수 없어 현재 화면에서만 기록해요.';}}
 function save(record){if(current&&view==='question')state.course=current.course;if(remoteQuestion&&view==='source-question'&&!remoteFeedback)state.sourcePending[state.course]={questionId:remoteQuestion.questionId||remoteQuestion.id,version:remoteQuestion.version,choice:remoteChoice,confidence:remoteConfidence,help:false,openedAt:remoteOpenedAt,updatedAt:Date.now()};if(current&&view==='question')state.pending[state.course]={book:state.book,pool:[...pool],cursor,choice,confidence,help,hint,solution,feedbackId:feedback?.id||null,openedAt,updatedAt:Date.now()};if(record){record.updatedAt=Math.max(Date.now(),(record.updatedAt||record.at||0)+1);state.records=state.records.map(r=>r.id===record.id?record:r);}state=clean(state);try{if(key())localStorage.setItem(key(),JSON.stringify(state));else if(!signed())sessionStorage.setItem(temporaryKey,JSON.stringify(state));storageMessage=key()?'이 계정의 기기에 저장했어요.':signed()?'현재 로그인 화면에 기록했어요. 계정 저장 연결은 아직 준비 중이에요.':'이 브라우저에 임시 저장했어요.';}catch{storageMessage='기기 저장에 실패했어요. 이 화면을 닫기 전에 기록을 확인하세요.';}
 emit();if(signed()&&activeOwner&&(typeof options.onProgress==='function'||record&&typeof options.onRecord==='function')){if(!record&&typeof options.onProgress==='function'){scheduleRemote();return;}sendRemote(record);}}
 // v66: ‹ › and other moves only change the resume point — those reach the server once the student stops for
 // 1.2 s (one write, latest state). An answer record goes at once. Leaving or hiding the page sends the last one
 // with keepalive, so no record is lost.
 let remoteTimer=0,remoteDirty=false;
 function scheduleRemote(){remoteDirty=true;clearTimeout(remoteTimer);remoteTimer=setTimeout(()=>{remoteTimer=0;flushRemote();},1200);}
 function flushRemote(keepalive=false){clearTimeout(remoteTimer);remoteTimer=0;if(!remoteDirty)return;remoteDirty=false;if(signed()&&activeOwner&&typeof options.onProgress==='function')sendRemote(null,keepalive);}
 function sendRemote(record,keepalive=false){clearTimeout(remoteTimer);remoteTimer=0;remoteDirty=false;{const generation=epoch,ownerAtSave=activeOwner,payload=JSON.parse(JSON.stringify(typeof options.onProgress==='function'?state:record));saveQueue=saveQueue.catch(()=>{}).then(async()=>{if(!signed()||ownerAtSave!==owner())return;try{const handler=typeof options.onProgress==='function'?options.onProgress:options.onRecord;const result=await handler(payload,{ownerKey:ownerAtSave,namespace:'student-paths-v1',keepalive});if(closed||generation!==epoch)return;if(result?.state)state=mergeProgress(result.state,state);storageMessage=result?.saved===true?(result.localOnly?.records||result.localOnly?.pending?'계정에 연결된 학습 기록을 저장했어요. 이전 연습 기록은 이 기기에 유지돼요.':'계정에 학습 기록을 저장했어요.'):'계정 저장을 확인하지 못했어요. 기기 기록은 유지돼요.';}catch{if(closed||generation!==epoch)return;storageMessage='계정 저장에 실패했어요. 기기 기록은 유지돼요.';}draw(false);emit();});}}
 function qlist(){if(state.course==='supplement')return BANK.filter(q=>q.book===state.book);if(state.course==='advanced')return BANK.filter(q=>q.course==='advanced'&&q.level===tier(state,planProfile?.goal));return BANK.filter(q=>q.course===state.course);}
 function resetQuestion(q){
  if(guestTrial){
   if(!openTrialQuestion(q)){
    current=null;feedback=null;view='guest-limit';return;
   }
  }
  current=q;choice=null;confidence='sure';help=false;hint=false;feedback=null;solution=false;openedAt=Date.now();view='question';}
 function resume(course){const originalLatest=Object.entries(state.pending).filter(([id,p])=>(!course||course===id)&&!p.cleared).sort((a,b)=>b[1].updatedAt-a[1].updatedAt)[0],sourceLatest=Object.entries(state.sourcePending).filter(([id,p])=>(!course||course===id)&&!p.cleared&&!heldExam(p.questionId)).sort((a,b)=>b[1].updatedAt-a[1].updatedAt)[0];if(sourceLatest&&(!course||course===sourceLatest[0])&&(!originalLatest||sourceLatest[1].updatedAt>=originalLatest[1].updatedAt)){state.course=sourceLatest[0];openRemote(sourceLatest[1].questionId,sourceLatest[1]);return true;}const courseId=course||Object.entries(state.pending).filter(([,p])=>!p.cleared).sort((a,b)=>b[1].updatedAt-a[1].updatedAt)[0]?.[0];const p=state.pending[courseId];if(!p||p.cleared)return false;state.course=courseId;state.book=p.book;pool=[...p.pool];cursor=p.cursor;current=byId.get(pool[cursor]);choice=p.choice;confidence=p.confidence;help=p.help;hint=p.hint;solution=p.solution;feedback=state.records.find(r=>r.id===p.feedbackId)||null;openedAt=Date.now();view='question';return true;}
 function begin(ids){pool=(ids||qlist().map(q=>q.id)).filter(id=>byId.has(id));cursor=0;if(!pool.length){notice='지금 선택한 범위에는 문제가 없어요.';return;}resetQuestion(byId.get(pool[0]));}
 function review(type){const seen=latest(state),ids=BANK.filter(q=>(!type||q.type===type)&&weak(seen.get(q.id))).map(q=>q.id);if(!ids.length){notice='현재 복습할 기록이 없어요.';return;}begin(ids);}
 function workbookScope(){const books=workbookChoices();const book=books.find(b=>b.id===selectedScopeBook);const unit=(externalRange&&state.course!=='supplement'&&planSourceUnit)||(desk&&book?workbookRanges(book):book?.units)?.find(u=>u.id===selectedScopeUnit);const type=unit?.types?.find(t=>t.id===selectedScopeType);return {book,unit,type};}
 function invalidateSource(){sourceGeneration++;sourceResult=null;sourcePhase='idle';sourceError='';}
 function mathContent(value){if(typeof value!=='string')throw Error('invalid_content');const parts=value.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g);return parts.map((part,index)=>{let latex='',display=false;if(part.startsWith('$$')&&part.endsWith('$$')){latex=part.slice(2,-2);display=true;}else if(part.startsWith('$')&&part.endsWith('$'))latex=part.slice(1,-1);else if(part.startsWith('\\[')&&part.endsWith('\\]')){latex=part.slice(2,-2);display=true;}else if(part.startsWith('\\(')&&part.endsWith('\\)'))latex=part.slice(2,-2);if(latex){if(!window.katex?.renderToString)throw Error('math_renderer_unavailable');if(window.DSMathTypeset)return window.DSMathTypeset.html(latex,{display,strict:'error',throw:true,gap:/[^\s(\[{]$/.test(parts[index-1]||'')&&!/(?:^|[\s(])제$/.test(parts[index-1]||'')&&!/^\s*[,.;:)\]]/.test(latex)});return window.katex.renderToString(latex,{displayMode:display,throwOnError:true,trust:false,strict:'error',maxExpand:1000});}if(/\\[A-Za-z]|\$/.test(part))throw Error('unwrapped_math');return esc(part).replace(/\n/g,'<br>');}).join('');}
 function fragmentContent(html,title){if(typeof html!=='string'||!html.trim()||typeof window.DSStudentFragment?.render!=='function')throw Error('fragment_renderer_unavailable');const rendered=window.DSStudentFragment.render(html,title);if(typeof rendered!=='string')throw Error('invalid_fragment');return rendered;}

 function remoteTypeGroups(){
  if(!desk||!['types','supplement'].includes(state.course))return [];
  const groups=new Map();
  for(const row of sourceResult?.questions||[]){
   const ids=state.course==='supplement'?[row.originalGroupId].filter(Boolean):row.typeIds?.length?row.typeIds:[row.typeId].filter(Boolean);
   for(const id of ids){
    if(!groups.has(id))groups.set(id,{id,rows:[]});
    const group=groups.get(id);if(!group.rows.some(q=>(q.questionId||q.id)===(row.questionId||row.id)))group.rows.push(row);
   }
  }
  const definitions=new Map(workbookChoices().flatMap(book=>book.units.flatMap(unit=>(unit.types||[]).map(type=>[type.id,type.label]))));
  const rank=window.DSWorkbookScope?.typeOrder||{},at=id=>rank[id]??Number.MAX_SAFE_INTEGER;
  // 유형 키는 서버 토큰이다(분류 비노출) — 차례는 typeOrder 로, 제목은 사람이 읽는 이름으로만 그린다(키를 화면에 그리지 않음).
  return [...groups.values()].sort((a,b)=>(state.course==='supplement'?(a.rows[0].originalQuestionNo-b.rows[0].originalQuestionNo):0)||at(a.id)-at(b.id)||a.id.localeCompare(b.id,undefined,{numeric:true})).map((group,index)=>({...group,label:state.course==='supplement'?(workbookScope().unit?.label||group.rows[0].unit||'선택한 단원')+' · 변형 연습':definitions.get(group.id)||group.rows.find(q=>q.typeLabel)?.typeLabel||'유형 '+(index+1)}));
 }
 function sourceRows(){
  const groups=remoteTypeGroups();
  if(!groups.length)return desk&&['types','supplement'].includes(state.course)?[]:sourceResult?.questions||[];
  if(!groups.some(group=>group.id===deskType))deskType=groups[0].id;
  return groups.find(group=>group.id===deskType).rows;
 }
 function remoteTypeNavigation(){
  const groups=remoteTypeGroups();if(!groups.length)return '';
  const index=groups.findIndex(group=>group.id===deskType),group=groups[index],label=state.course==='supplement'?'교재 문항':'유형';
  if(!group)return '';
  return `<section class="ssp-concept-lesson" aria-label="${state.course==='supplement'?'교재 문항별 연습':'대표 유형'}"><h3>${mathContent(group.label)}</h3><nav aria-label="${label} 이동"><button type="button" data-ssp-remote-type-step="-1" ${index===0?'disabled':''}>← 이전 ${label}</button><span>${index+1} / ${groups.length}</span><button type="button" data-ssp-remote-type-step="1" ${index===groups.length-1?'disabled':''}>다음 ${label} →</button></nav></section>`;
 }
 async function querySource(){
  if(!signed()){sourcePhase='error';sourceError='로그인 후 학생 무료 범위를 확인할 수 있어요.';draw(false);return;}
  if(typeof window.DSStudentServices?.catalog!=='function'){sourcePhase='error';sourceError='자료 연결을 확인하지 못했어요. 잠시 후 다시 확인해 주세요.';draw(false);return;}
  if(desk&&planSourceRows&&state.course!=='supplement'){
   sourceResult={questions:state.course==='types'?planSourceRows:balancedRows(planSourceRows)};sourcePhase='ready';
   const first=sourceRows()[0];if(first)await openRemote(first.questionId||first.id);else draw(false);return;
  }
  const {book,unit,type}=workbookScope();if(!book||!unit||widen==='type'&&!type||widen==='family'&&!type?.familyId){sourcePhase='error';sourceError='확인할 교재와 범위를 먼저 선택해 주세요.';draw(false);return;}
  const filters={purpose:'study_free',sourceKind:'existing_print',subject:book.subject,bookId:book.id,unitIds:unit.unitIds||[unit.id],typeIds:widen==='type'?[type.id]:widen==='family'?(unit.types||[]).filter(t=>t.familyId===type.familyId).map(t=>t.id):[],familyIds:[],scopeLevel:widen==='subunit'?'unit':widen};
  const generation=++sourceGeneration,ownerAtQuery=owner(),sessionAtQuery=epoch;sourcePhase='loading';sourceError='';sourceResult=null;draw(false);
  try{const result=await window.DSStudentServices.catalog(filters);if(closed||generation!==sourceGeneration||sessionAtQuery!==epoch||ownerAtQuery!==owner()||!signed())return;
   if(!Array.isArray(result.questions)||!result.questions.every(q=>q.sourceKind==='existing_print'&&!heldExam(q.questionId||q.id)&&typeof(q.questionId||q.id)==='string'&&typeof q.version==='string'&&q.bookId===book.id&&(!electiveSubject(book.subject)||q.subject===book.subject)&&(Array.isArray(q.unitIds)?q.unitIds:[q.unitId]).some(id=>filters.unitIds.includes(id))&&(!['type','family'].includes(filters.scopeLevel)||(Array.isArray(q.typeIds)?q.typeIds:[q.typeId]).some(id=>filters.typeIds.includes(id)))))throw Error('invalid_catalog_scope');
   sourceResult=result;sourcePhase='ready';sourceError='';
   if(desk&&sourceRows().length){const first=sourceRows()[0];await openRemote(first.questionId||first.id);return;}
  }catch{if(closed||generation!==sourceGeneration||sessionAtQuery!==epoch)return;sourcePhase='error';sourceError='이 범위의 무료 이용 가능 수를 확인하지 못했어요. 확인 전에는 다른 자료로 바꾸어 제공하지 않아요.';}
  draw(false);
 }
 function remoteList(){if(sourcePhase==='loading')return '<p role="status">회원에게 허용된 기존 자료를 확인하고 있어요.</p>';if(sourcePhase==='error')return `<p role="alert">${esc(sourceError)}</p><button data-ssp-query>다시 확인</button>`;if(sourcePhase!=='ready')return '<p>현재 계정에 허용된 기존 문항 수를 서버에서 확인해 주세요.</p><button data-ssp-query>이 범위의 무료 문제 확인</button>';const rows=sourceRows();return `<p><strong>이 계정에서 무료로 열 수 있는 문항 ${rows.length}개</strong></p><p>${rows.length>=desiredCount?'원하는 '+desiredCount+'문항 이상이 있어요. 정확히 선택한 범위에서 풀 수 있어요.':desiredCount+'문항을 공부하려면 '+Math.max(0,desiredCount-rows.length)+'문항이 부족해요.'}</p>${rows.length?`<ul class="ssp-existing-list">${rows.map(q=>`<li><div><strong>${esc(q.title||q.typeLabel||q.unit||'기존 문항')}</strong><span>${esc(sourceName(q))} · ${esc(q.unit||'')}</span></div><button data-ssp-remote="${esc(q.questionId||q.id)}">이 문제 풀기</button></li>`).join('')}</ul>`:'<p>확인한 이 범위에서 학생 무료로 허용된 문항이 없어요. 범위를 넓힐지는 직접 선택할 수 있어요.</p>'}`;}
 async function openRemote(id,draft,revisit=false){
  if(heldExam(id)){notice='이 기출 원문의 화면 제공 범위를 확인하고 있어요.';draw(false);return;}
  const metadata=draft||sourceRows().find(q=>(q.questionId||q.id)===id)||remoteHistory.records.find(q=>q.questionId===id);if(!metadata||typeof window.DSStudentServices?.open!=='function'){notice='문항을 여는 연결을 확인하지 못했어요.';draw(false);return;}const generation=++sourceGeneration,sessionAtOpen=epoch;lastOpen={id,draft,revisit};sourcePhase='opening';if(!DSStudentServices.ready?.({questionId:id,purpose:'study_free'})){notice='허용된 문항을 불러오고 있어요.';draw(false);}try{const result=await DSStudentServices.open({questionId:id,purpose:'study_free'});if(closed||generation!==sourceGeneration||sessionAtOpen!==epoch||!signed())return;const q=result.question;if(!q||(q.questionId||q.id)!==id||(metadata.version&&q.version!==metadata.version)||typeof q.version!=='string')throw Error('version_changed');if(!['existing_print','supplement'].includes(q.sourceKind))throw Error('unsupported_source');if(q.answer!==undefined||q.solution!==undefined||q.solutionFrame!==undefined||q.solutionHTML!==undefined)throw Error('active_answer_exposure');if(q.format==='sandbox-html'){q._safeFragment=fragmentContent(q.questionHTML,'기존 자료 문제');}else if(q.format==='text-latex'){mathContent(q.prompt);if(q.options)q.options.forEach(mathContent);}else throw Error('unsupported_format');q.answerType=q.answerType||metadata.answerType;remoteQuestion=q;remoteMetadata=metadata;remoteChoice=draft?.choice??null;remoteUnknown=false;remoteConfidence=draft?.confidence||'sure';remoteFeedback=null;remoteOpenedAt=Date.now();
 const saved=revisit&&remoteDrafts.get(id);if(saved?.version===q.version){remoteChoice=saved.choice;remoteConfidence=saved.confidence;remoteFeedback=saved.feedback;remoteOpenedAt=saved.openedAt;}
 view='source-question';notice='';sourcePhase='ready';if(!draft&&!remoteFeedback)save();draw();prefetchAround(id);}catch(error){if(closed||generation!==sourceGeneration||sessionAtOpen!==epoch)return;sourcePhase='error';view='home';notice=openFailure(error);sourceError=notice;draw(false);}}
 function openFailure(error){const code=error?.code||error?.message||'';if(code==='timeout')return '문항 응답이 늦어요. 다시 불러오기를 눌러 주세요.';if(code==='connection_failed'||error?.status===0)return '연결이 끊겨 문항을 받지 못했어요. 연결을 확인하고 다시 불러와 주세요.';if(error?.status===401||code==='unauthorized'||code==='session_changed')return '로그인이 만료되었어요. 다시 로그인한 뒤 열어 주세요.';if(error?.status===429||['rate_limited','too_many'].includes(code))return '요청이 잠시 많아요. 조금 뒤 다시 불러와 주세요.';return '문항의 판이나 열람 형식을 확인하지 못했어요. 다시 불러오거나 범위를 다시 확인해 주세요.';}
 // v66: the questions next to the open one (‹ › and the next type) are fetched ahead, two at most, never twice.
 function prefetchAround(id){if(!desk||typeof DSStudentServices?.prefetch!=='function')return;const rows=sourceRows(),index=rows.findIndex(q=>(q.questionId||q.id)===id),wanted=[rows[index+1],rows[index-1]];const groups=remoteTypeGroups(),g=groups.findIndex(group=>group.id===deskType);if(g>=0&&groups[g+1])wanted.push(groups[g+1].rows[0]);for(const row of wanted){const qid=row&&(row.questionId||row.id);if(qid&&!heldExam(qid))DSStudentServices.prefetch({questionId:qid,purpose:'study_free'});}}
 async function submitRemote(){if(!remoteQuestion||remoteBusy||remoteFeedback)return;if(typeof DSStudentServices?.submit!=='function'){notice='답안을 이 화면에 남겼어요. 서버 채점 연결은 아직 준비 중이에요.';draw(false);return;}const id=remoteQuestion.questionId||remoteQuestion.id;let operation=remoteOperations.get(id);if(!operation){if(remoteChoice===null&&!remoteUnknown){notice='답을 입력하거나 모르겠어요를 선택해 주세요.';draw(false);return;}operation={questionId:id,version:remoteQuestion.version,answer:remoteChoice,requestId:crypto.randomUUID(),course:state.course,confidence:remoteConfidence,help:false,seconds:Math.min(86400,Math.max(0,Math.round((Date.now()-remoteOpenedAt)/1000)))};remoteOperations.set(id,operation);}const generation=epoch;remoteBusy=true;notice='답안을 확인하고 있어요.';draw(false);try{const result=await DSStudentServices.submit(operation);if(closed||generation!==epoch||!signed())return;if(!result?.record||result.record.questionId!==id||result.record.version!==operation.version||typeof result.record.correct!=='boolean')throw Error('invalid_grade');if(result.solutionHTML){try{result._safeSolutionFragment=fragmentContent(result.solutionHTML,'제출 후 해설');}catch{result.solutionUnavailable=true;}}if(result.solution){try{(Array.isArray(result.solution)?result.solution:[result.solution]).forEach(mathContent);}catch{result.solution=null;result.solutionUnavailable=true;}}remoteFeedback=result;remoteOperations.delete(id);state.sourcePending[state.course]={cleared:true,updatedAt:Date.now()};save();notice='계정에 풀이 결과를 저장했어요.';remoteHistory.phase='idle';window.dispatchEvent(new CustomEvent('ds-student-free-record',{detail:{record:result.record}}));}catch(error){if(closed||generation!==epoch)return;if([400,403,404,409,422].includes(error?.status)){remoteOperations.delete(id);notice='답안의 형식이나 문항 이용 상태가 바뀌었어요. 범위와 문항을 다시 확인해 주세요.';return;}notice='제출 결과를 확인하지 못했어요. 같은 답안으로 다시 확인해 주세요. 중복으로 새 풀이를 만들지 않아요.';}finally{if(generation===epoch){remoteBusy=false;draw(false);}}}
 function remoteQuestionHTML(){const q=remoteQuestion,id=q.questionId||q.id;const pending=remoteOperations.has(id);let content=q.format==='sandbox-html'?q._safeFragment+'<p class="ssp-note">긴 수식은 좌우로 밀어서 확인할 수 있어요.</p>':`<div class="ssp-prompt">${mathContent(q.prompt)}</div>`;const choices=q.answerType==='choice'?(Array.isArray(q.options)&&q.options.length===5?q.options:Array(5).fill('')):null;return `<article class="ssp-paper"><div class="ssp-paper-top"><span>${esc(sourceName(remoteMetadata))}</span><span>${esc(q.unit||remoteMetadata.unit||'')}</span></div><h2 tabindex="-1">${desk&&state.course==='types'?'대표 유형 문제':'기존 자료 풀기'}</h2>${desk?itemPager(Math.max(0,sourceRows().findIndex(row=>(row.questionId||row.id)===id)),sourceRows().some(row=>(row.questionId||row.id)===id)?sourceRows().length:1):''}${remoteTypeNavigation()}${content}${q.format==='sandbox-html' && choices ? '' : `<fieldset class="ssp-options" aria-label="답안" ${remoteFeedback||remoteBusy||pending?'disabled':''}>${choices?choices.map((text,i)=>`<label><input type="radio" name="ssp-remote-choice" value="${i}" ${remoteChoice===i?'checked':''}><span class="ssp-option-no">${"①②③④⑤"[i]}</span><span>${mathContent(text)}</span></label>`).join(''):`<label>정수 답안 <input type="number" inputmode="numeric" step="1" data-ssp-remote-integer ${Number.isSafeInteger(remoteChoice)?`value="${remoteChoice}"`:''} aria-label="정수 답안"></label>`}</fieldset>`}${!remoteFeedback?`<div class="ssp-actions"><button class="ssp-primary" data-ssp-remote-submit ${remoteBusy?'disabled':''}>${pending?'같은 답안으로 결과 다시 확인':'답 제출하고 확인'}</button><button data-ssp-remote-unknown ${remoteBusy||pending?'disabled':''}>모르겠어요</button></div>`:`<section class="ssp-feedback"><h3 tabindex="-1">${remoteFeedback.record.correct?'맞았어요.':'조건과 풀이를 다시 확인해 봐요.'}</h3>${variantButton(remoteFeedback.record,remoteHistory.records)}<button data-ssp-remote-retry>같은 문제 다시 풀기</button>${remoteFeedback.answer!==undefined?`<p>정답 ${esc(choices?Number(remoteFeedback.answer)+1+'번':remoteFeedback.answer)}</p>`:''}${remoteFeedback._safeSolutionFragment?`<section class="ssp-solution">${remoteFeedback._safeSolutionFragment}<p class="ssp-note">긴 수식은 좌우로 밀어서 확인할 수 있어요.</p></section>`:''}${remoteFeedback.solutionUnavailable?'<p>해설 표시 형식을 확인하지 못했어요. 채점 결과는 계정에 저장했어요.</p>':''}${remoteFeedback.solution?`<div class="ssp-solution">${(Array.isArray(remoteFeedback.solution)?remoteFeedback.solution:[remoteFeedback.solution]).map(line=>`<p>${mathContent(line)}</p>`).join('')}</div>`:''}</section>`}<footer class="ssp-paper-foot"><span>계정에 허용된 기존 자료</span>${options.view==='history'?'<button data-ssp-history>내 공부 기록으로</button>':!desk?'<button data-ssp-home>코스로 돌아가기</button>':''}</footer></article>`;}
 function sourcePanel(){
  const units=Object.keys(FREE_CONCEPTS);
  const freeConcept=FREE_CONCEPTS[freeUnit];
  let bookPanel='';
  {
   const scope=[...new Map([...(window.DSPrintScopeData?.books||[]).map(b=>({...b,series:'쎈'})),...(window.DSWorkbookScope?.books||[])].map(b=>[b.id,b])).values()],books=scope.filter(b=>(b.series||b.label||'').includes(selectedSeries));
   if(!books.some(b=>b.id===selectedScopeBook))selectedScopeBook=(books.find(b=>b.variant===(state.course==='advanced'?'advanced':state.course==='types'?'type':'base'))||books[0])?.id||'';
   const book=books.find(b=>b.id===selectedScopeBook),us=book?.units||[];
   if(!us.some(u=>u.id===selectedScopeUnit))selectedScopeUnit=us[0]?.id||'';
   const unit=us.find(u=>u.id===selectedScopeUnit),types=unit?.types||[];
   if(!types.some(t=>t.id===selectedScopeType))selectedScopeType=types[0]?.id||'';
   const family=types.find(t=>t.id===selectedScopeType)?.familyId||'',familyTypeIds=family?types.filter(t=>t.familyId===family).map(t=>t.id):[];
   bookPanel=`<div class="ssp-workbook"><h3>문제집 시리즈와 범위</h3><p>원천 목록이 있는 것과 회원 무료로 풀 수 있는 것은 달라요. 원문과 유사 코드가 확인된 문항만 연결해요.</p><div class="ssp-series" role="group" aria-label="문제집 시리즈">${['쎈','올림포스'].map(n=>`<button data-ssp-series="${n}" aria-pressed="${n===selectedSeries}">${n}</button>`).join('')}</div>${book&&Number.isInteger(book.inventoryCount)?`<p class="ssp-note">${esc(book.label)} 자료 목록 ${book.inventoryCount}문항 · 학생 무료 이용 연결은 확인 중이에요.</p>`:''}${books.length?`<label>교재 <select data-ssp-scope-book>${books.map(b=>`<option value="${esc(b.id)}" ${b.id===selectedScopeBook?'selected':''}>${esc(b.label)} · ${esc(b.subject)}</option>`).join('')}</select></label><label>단원 <select data-ssp-scope-unit>${us.map(u=>`<option value="${esc(u.id)}" ${u.id===selectedScopeUnit?'selected':''}>${esc(u.label)}</option>`).join('')}</select></label>${types.length?`<label>세부유형 <select data-ssp-scope-type>${types.map(t=>`<option value="${esc(t.id)}" ${t.id===selectedScopeType?'selected':''}>${esc(t.label)}</option>`).join('')}</select></label>`:'<p>이 단원의 세부유형 목록은 아직 연결하지 못했어요.</p>'}`:'<p>이 시리즈의 교재·단원 목록을 준비하고 있어요.</p>'}<label>풀고 싶은 문제 수 <select data-ssp-target>${[1,3,5,10].map(n=>`<option value="${n}" ${n===desiredCount?'selected':''}>${n}문항</option>`).join('')}</select></label><div class="ssp-scope-check"><strong>${widen==='type'?'선택한 세부유형':widen==='family'?'동의한 관련 유형군 · '+esc(family):'동의한 소단원 · '+esc(unit?.label||'')}  · ${sourcePhase==='ready'?'무료 이용 확인 '+sourceRows().length+'문항':'무료 이용 확인 전'}</strong>${remoteList()}${sourcePhase==='ready'&&sourceRows().length>=desiredCount?'':widen==='type'?(family&&familyTypeIds.length>0?'<button data-ssp-widen="family">관련 유형군까지 넓혀 확인할게요</button>':'<p>연결된 관련 유형군이 없어 선택 단원 범위부터 확인할 수 있어요.</p><button data-ssp-widen="subunit">선택한 단원까지 넓혀 확인할게요</button>'):widen==='family'?'<button data-ssp-widen="subunit">선택한 소단원까지 넓혀 확인할게요</button>':(sourcePhase==='ready'&&!sourceRows().length?'<p>선택한 단원까지 넓힌 뒤에도 무료 연결 확인 0문항이에요.</p>':'')}</div></div>`;
  }
  const conceptPanel=state.course==='concept'?`<label class="ssp-existing-label">개념 설명 단원 <select data-ssp-free-unit>${units.map(u=>`<option ${u===freeUnit?'selected':''}>${esc(u)}</option>`).join('')}</select></label><aside class="ssp-hint"><h3>${esc(freeConcept.title)}</h3><p>${esc(freeConcept.body)}</p><div class="ssp-formula">${freeConcept.formula}</div></aside>`:'';
  const pending=state.sourcePending[state.course];
  const heading=state.course==='advanced'?'기존 자료의 난도 확인':'기존 자료에서 공부하기';
  return `<section class="ssp-panel ssp-sources"><h2>${heading}</h2>${pending&&!pending.cleared&&!heldExam(pending.questionId)?'<button class="ssp-primary" data-ssp-source-resume>이 코스의 풀던 기존 문항 이어하기</button>':''}${bookPanel}${conceptPanel}</section>`;
 }
 function home(){const s=summary(state),seen=latest(state);const weakTypes=[...new Set([...seen.values()].filter(weak).map(r=>r.type))];let content='';
 if(state.course==='concept')content=`<div class="ssp-concepts">${['value','domain','radical-domain','radical-equation'].map(id=>`<article><h3>${CONCEPTS[id].name}</h3><p>${CONCEPTS[id].body}</p></article>`).join('')}</div>`;
 if(state.course==='types')content=`<div class="ssp-type-list">${BANK.filter(q=>q.course==='types').map(q=>`<button data-ssp-type="${q.type}"><strong>${esc(TYPES[q.type])}</strong><span>대표 문제 1개${weakTypes.includes(q.type)?' · 복습 추천':''}</span></button>`).join('')}</div>`;
 if(state.course==='supplement')content=`<div class="ssp-books" role="group" aria-label="부교재 선택">${BOOKS.map(b=>`<button data-ssp-book="${b.id}" aria-pressed="${state.book===b.id}"><span>${esc(b.source)}</span><strong>${esc(b.title)}</strong><small>${esc(b.description)} · ${b.ids.length}문항</small></button>`).join('')}</div><p class="ssp-note">이곳의 부교재는 직접 만든 온라인 연습본이에요. 다른 출판사의 교재나 기출 원문을 제공하지 않아요.</p>`;
 if(state.course==='advanced')content=`<label class="ssp-grade">최근 내신 등급 <select data-ssp-grade aria-label="최근 내신 등급">${[1,2,3,4,5,6,7,8,9].map(g=>`<option value="${g}" ${g===state.grade?'selected':''}>${g}등급</option>`).join('')}</select></label><p>지금은 <strong>${tier(state)}단계</strong>에서 시작해요. ${state.grade<=2?'선택한 등급을 참고한 출발 단계이며, 실력을 확정한 결과는 아니에요.':'조건 확인부터 시작해요.'} 각 단계의 두 문제를 도움 없이 맞히면 다음 단계로 가요.</p><ol class="ssp-steps">${['조건을 놓치지 않기','조건 두 개를 연결하기','교점 개수와 매개변수'].map((n,i)=>`<li ${i+1===tier(state)?'aria-current="step"':''}>${i+1}. ${n}</li>`).join('')}</ol><p class="ssp-note">난도는 교사 관점의 설계 단계예요. 실측 정답률이나 기출 등급을 뜻하지 않아요.</p>`;
 const c=COURSES.find(c=>c.id===state.course);return `${sourcePanel()}<details class="ssp-extra"><summary>자체 제작 보완연습 · 공통수학2</summary><p class="ssp-note">아래 ${BANK.length}문항은 기존 교재·기출에서 불러온 문항이 아닌 별도 원창작이에요. 쎈·올림포스의 문항 또는 유사 코드 연결로 표시하지 않아요.</p><div class="ssp-panel"><p class="ssp-kicker">${esc(c.intro)}</p><h2>${esc(c.name)}</h2>${content}<div class="ssp-actions">${state.pending[state.course]&&!state.pending[state.course].cleared?'<button class="ssp-primary" data-ssp-resume>풀던 공부 이어하기</button>':''}<button class="ssp-primary" data-ssp-start>${state.pending[state.course]&&!state.pending[state.course].cleared?'새로 공부하기':'공부 시작'} · ${qlist().length}문항</button><button data-ssp-history>내 기록 보기</button></div></div><aside class="ssp-progress"><h2>보완연습 기록</h2><p>풀어 본 문제 <b>${s.answered}</b>개 · 최근 정답 <b>${s.correct}</b>개</p><p>다시 볼 문제 <b>${s.review}</b>개</p>${weakTypes.length?`<h3>이 유형을 다시 볼까요?</h3>${weakTypes.map(t=>`<button data-ssp-review="${t}">${esc(TYPES[t])}</button>`).join('')}`:'<p>한 번의 정답으로 숙달을 판단하지 않아요. 풀고 난 뒤 풀이도 비교해 보세요.</p>'}<p class="ssp-note">${esc(storageMessage)}</p>${signed()&&activeOwner&&typeof options.onProgress==='function'?'<button data-ssp-sync>기록 다시 저장</button>':''}</aside></details>`;}
 const lessonSequences=Object.fromEntries(['concept','types'].map(course=>[course,BANK.filter(q=>q.course===course&&!q.originalQuestionId)]));
 function lessonNavigation(){
  const sequence=desk&&lessonSequences[current?.course]&&deskUnits().unitRows;
  if(!sequence)return '';
  const index=sequence.findIndex(q=>q.id===(current.originalQuestionId||current.id));
  const isConcept=current.course==='concept',label=isConcept?'개념':'유형';
  const action=isConcept?'data-ssp-concept-step':'data-ssp-type-step';
  const title=isConcept?CONCEPTS[current.type].name:TYPES[current.type];
  return `<section class="ssp-concept-lesson" aria-label="${isConcept?'기본개념 이론':'대표 유형'}">
   <nav aria-label="${label} 이동"><button type="button" ${action}="-1" ${index<=0?'disabled':''}>← 이전 ${label}</button>
   <span>${index+1} / ${sequence.length}</span>
   <button type="button" ${action}="1" ${index===sequence.length-1?'disabled':''}>다음 ${label} →</button></nav>
   ${isConcept?`<h3>${esc(title)}</h3><p>${CONCEPTS[current.type].body}</p>`:''}</section>`;
 }
 function question(){const q=current;if(!q)return home();const concept=CONCEPTS[q.type];const repeated=state.records.some(r=>r.questionId===q.id);return `<article class="ssp-paper"><div class="ssp-paper-top"><span>${esc(TYPES[q.type])} · ${q.level}단계</span><span>${desk?'':(cursor+1)+' / '+pool.length}</span></div><h2 tabindex="-1" class="ssp-problem-heading">${esc(q.subject)} · ${esc(desk?subunit(q):q.unit)}</h2>${desk?itemPager(cursor,pool.length):''}${repeated?'<p class="ssp-note">전에 풀어 본 문제예요. 이번 결과는 복습 기록으로 남겨요.</p>':''}<div class="ssp-prompt">${q.prompt}</div><fieldset class="ssp-options" aria-label="답안" ${feedback?'disabled':''}>${q.options.map((o,i)=>`<label><input type="radio" name="ssp-answer" value="${i}" ${choice===i?'checked':''}><span class="ssp-option-no">${"①②③④⑤"[i]}</span><span>${o}</span></label>`).join('')}</fieldset>${!feedback?`<div class="ssp-actions"><button class="ssp-primary" data-ssp-check ${choice===null?'disabled':''}>답 확인</button><button data-ssp-skip>모르겠어요</button><button data-ssp-hint aria-expanded="${hint}">힌트 ${hint?'접기':'보기'}</button></div>`:''}${hint?`<aside class="ssp-hint"><h3>첫 생각</h3><p>${q.hint}</p><p>${concept.body}</p></aside>`:''}${feedback?`<section class="ssp-feedback"><h3 tabindex="-1">${feedback.choice===null?'함께 다시 확인해 봐요.':feedback.correct?'맞았어요. 풀이의 조건도 확인해 보세요.':'답을 다시 살펴볼까요?'}</h3><p>정답은 ${q.answer+1}번이에요. ${feedback.help?'힌트를 확인한 풀이로 기록했어요.':''}</p><div class="ssp-actions"><button data-ssp-solution aria-expanded="${solution}">${solution?'풀이 접기':'해설 보기'}</button><button data-ssp-retry>답을 가리고 다시 풀기</button>${variantButton(feedback,state.records)}${desk?'':`<button class="ssp-primary" data-ssp-next>${cursor+1<pool.length?'다음 문제':'공부 결과 보기'}</button>`}</div>${solution?`<section class="ssp-solution"><h3>조건 → 계산 → 확인</h3><ol>${q.solution.map(s=>`<li>${s}</li>`).join('')}</ol></section>`:''}</section>`:''}${lessonNavigation()}<footer class="ssp-paper-foot">${options.view==='history'?'<button data-ssp-history>내 공부 기록으로</button>':!desk?'<button data-ssp-home>코스로 돌아가기</button>':''}</footer></article>`;}
 async function loadFreeHistory(more=false){
  if(!signed()||remoteHistory.phase==='loading')return;
  if(!activeOwner||typeof window.DSStudentServices?.history!=='function'){remoteHistory.phase='unavailable';draw(false);return;}
  const generation=epoch;
  remoteHistory.phase='loading';draw(false);
  try{
   const before=more?remoteHistory.nextBefore:null;
   const page=await DSStudentServices.history({kind:'free',limit:50,...(before?{before}:{})});
   if(closed||generation!==epoch||!signed())return;
   if(page.ownerKey!==activeOwner||!Array.isArray(page.records)||!page.records.every(r=>typeof r.recordId==='string'&&
      typeof r.questionId==='string'&&typeof r.correct==='boolean'&&Number.isFinite(Date.parse(r.at)))||
      page.hasMore&&(!page.nextBefore||page.nextBefore===before))throw Error('invalid_history');
   const rows=[...(more?remoteHistory.records:[]),...page.records];
   remoteHistory={phase:'ready',records:[...new Map(rows.map(r=>[r.recordId,r])).values()],hasMore:page.hasMore,nextBefore:page.nextBefore};
  }catch{if(closed||generation!==epoch)return;remoteHistory.phase='error';}
  draw(false);
 }
 function recordTitle(r){
  if(!r.recordId)return TYPES[r.type]||byId.get(r.questionId)?.unit||'보완연습';
  const book=workbookChoices().find(b=>b.id===r.bookId);
  const unit=book?.units?.find(u=>u.id===r.unitId);
  return unit?.types?.find(t=>t.id===r.typeId)?.label||unit?.label||r.unit||r.title||'단원 미분류 문항';
 }
 function reviewButton(r,label){
  if(heldExam(r.questionId))return '<span>원문 제공 확인 중</span>';
  const attr=r.recordId?'data-ssp-history-remote':'data-ssp-open';
  return `<button type="button" ${attr}="${esc(r.questionId)}">${esc(label)}</button>`;
 }
 function serverHistoryHTML(){
  if(remoteHistory.phase==='idle')queueMicrotask(()=>loadFreeHistory());
  const {records,phase,hasMore}=remoteHistory;
  let status='';
  if(phase==='idle'||phase==='loading')status='<p role="status">계정 풀이를 불러오고 있어요.</p>';
  else if(phase==='error'||phase==='unavailable')status='<p>기존 자료 기록을 모두 확인하지 못했어요.</p><button type="button" data-ssp-history-sync>다시 불러오기</button>';
  else if(!records.length)status='<p>아직 기존 자료에서 푼 문제가 없어요.</p>';
  const list=records.map(r=>`<li><div><strong>${esc(recordTitle(r))}</strong><span>${esc(new Date(r.at).toLocaleDateString('ko-KR'))} · ${r.correct?'정답':'오답'}</span></div>${reviewButton(r,'다시 풀기')}${variantButton(r,records)}</li>`).join('');
  return `<section class="ssp-server-history"><h3>기존 자료 풀이</h3>${status}${list?`<details><summary>불러온 풀이 ${records.length}회</summary><ul>${list}</ul></details>`:''}${hasMore&&phase==='ready'?'<button type="button" data-ssp-history-more>이전 기록 더 보기</button>':''}</section>`;
 }
 function history(){
  const localRows=[...latest(state).values()].sort((a,b)=>b.at-a.at);
  const recent=new Map();
  const rows=[...remoteHistory.records,...state.records].sort((a,b)=>(a.recordId?Date.parse(a.at):a.at)-(b.recordId?Date.parse(b.at):b.at));
  for(const row of rows)recent.set(row.questionId,row);
  const groups=new Map();
  for(const row of recent.values()){
   if(!(row.recordId?row.correct===false:weak(row)))continue;
   const name=recordTitle(row),group=groups.get(name)||{name,count:0,example:row};
   group.count++;groups.set(name,group);
  }
  const review=[...groups.values()].sort((a,b)=>b.count-a.count);
  const accountReady=remoteHistory.phase==='ready';
  const counts=(accountReady||rows.length)?`<dl class="ssp-record-counts"><div><dt>서로 다른 문항</dt><dd>${recent.size}문항</dd></div><div><dt>재풀이 포함 시도</dt><dd>${rows.length}회</dd></div></dl>`:'';
  const localList=localRows.map(r=>`<li><div><strong>${esc(recordTitle(r))}</strong><span>${r.correct?'정답':r.choice===null?'모르겠어요':'오답'}${r.help?' · 힌트 사용':''}${r.confidence==='unsure'?' · 헷갈림':''}${r.repeated?' · 재풀이':''}</span>${r.reason?`<small>${esc(REASONS[r.reason])}</small>`:''}</div>${reviewButton(r,'다시 풀기')}${variantButton(r,state.records)}</li>`).join('');
  if(guestTrial)return `<section class="ssp-panel ssp-history"><h2 tabindex="-1">내 공부 기록</h2>${counts}
   <p class="ssp-note">이 탭에서 푼 체험 문제의 기록이에요.</p>${localList?'<ul>'+localList+'</ul>':'<p>첫 문제를 풀면 이곳에 기록이 남아요.</p>'}
   <button type="button" data-ssp-trial-return>공부로 돌아가기</button></section>`;
  return `<section class="ssp-panel ssp-history"><h2 tabindex="-1">내 공부 기록</h2>${counts}
   <p class="ssp-note">내신 화면 학습에서 불러온 기존 자료와 최근 보완연습 최대 250회의 기록이에요.${remoteHistory.hasMore?' 이전 기록을 더 보면 집계도 갱신돼요.':''}</p>
   ${review.length?`<h3>먼저 복습할 단원·유형</h3><p>같은 문제는 마지막 풀이로 판단해요. 보완연습은 헷갈리거나 힌트를 본 문제도 담아요.</p><ul>${review.slice(0,3).map(g=>`<li><div><strong>${esc(g.name)}</strong><span>다시 볼 문제 ${g.count}개</span></div>${reviewButton(g.example,'복습하기')}</li>`).join('')}</ul>`:accountReady?`<p>${rows.length?'확인한 기록에는 다시 볼 문제가 없어요. 다음 문제로 넘어가 보세요.':'첫 문제를 풀면 이곳에 기록이 쌓여요.'}</p><a href="#student" data-hub-study-link>내신 공부하기 →</a>`:''}
   ${serverHistoryHTML()}<h3>보완연습 풀이</h3><p class="ssp-note">${esc(storageMessage)}</p>${localList?`<details><summary>문제별 최근 결과 ${localRows.length}개</summary><ul>${localList}</ul></details>`:'<p>확인된 보완연습 풀이가 없어요.</p>'}</section>`;
 }
 function result(){const rows=pool.map(id=>latest(state).get(id)).filter(Boolean),nextTier=tier(state);return `<section class="ssp-panel"><h2 tabindex="-1">이번 공부를 마쳤어요.</h2><p>${rows.length}문제 중 최근 정답 ${rows.filter(r=>r.correct).length}개 · 다시 볼 문제 ${rows.filter(weak).length}개</p>${state.course==='advanced'?`<p>지금 이어갈 단계는 ${nextTier}단계예요. 재풀이 결과는 새 문제에서의 실력 확인과 구별해요.</p>`:''}<p>${esc(storageMessage)}</p><div class="ssp-actions"><button class="ssp-primary" data-ssp-review="">틀림·실수 복습</button><button data-ssp-home>다음 공부 고르기</button><button data-ssp-history>내 기록 보기</button></div></section>`;}
 function deskMaterials(){
  const render=window.DSStudentDownloads?.materialLink;if(typeof render!=='function')return '';
  if(view==='question'&&current)return render({localUnit:subunit(current)});
  if(!externalRange&&state.course!=='supplement')return '';
  const {book,unit}=workbookScope();
  if(!book||!unit)return '';
  if(remoteQuestion&&view==='source-question'){
   const metadata=remoteMetadata||{};
   const match=(metadata.unitIds||[metadata.unitId]).find(id=>(unit.unitIds||[unit.id]).includes(id));
   return metadata.bookId===book.id&&match?render({bookId:book.id,unitId:match}):render({});
  }
  return unit.unitIds?render({}):render({bookId:book.id,unitId:unit.id});
 }
 let releaseChoiceLayout;
 function mountChoices(body){
  if (view==='source-question' && remoteQuestion?.format==='sandbox-html' && remoteQuestion.answerType==='choice') {
    const q=remoteQuestion, id=q.questionId||q.id, frame=body.querySelector('.ssp-paper iframe.ds-student-fragment');
    const bind=()=>{
      const doc=frame?.contentDocument;
      if (!frame?.isConnected || doc?.URL!=='about:srcdoc' || !doc.body || remoteQuestion!==q || doc.querySelector('.dte-source-choices')) return;
      const locked=()=>closed || !frame.isConnected || remoteQuestion!==q || remoteFeedback || remoteBusy || remoteOperations.has(id);
      window.DSTimedExam.prepareChoices({root:doc.body,id,value:remoteChoice,options:q.options||[],math:mathContent,choose:button=>{
        if (locked()) return;
        remoteChoice=Number(button.dataset.examChoice); remoteUnknown=false;
        for (const option of doc.querySelectorAll('[data-exam-choice]')) option.setAttribute('aria-pressed',String(option===button));
        save();
      }});
      if (locked()) for (const button of doc.querySelectorAll('[data-exam-choice]')) button.disabled=true;
    };
    if(frame){frame.addEventListener('load',bind,{once:true}); if(frame.contentDocument?.readyState==='complete')bind();}
    return;
  }
  const group=body.querySelector('.ssp-options:has(input[type="radio"])');
  if(group)releaseChoiceLayout=window.DSChoiceLayout?.mount(group,group.querySelectorAll('label'));
 }
 // v66: the question area is rebuilt only when its markup changed — a save, a status line or a plan step no
 // longer re-creates the question frame (and its 370KB stylesheet) or resets its height.
 let bodyHTML=null;
 function paintBody(body,markup){
  if(markup===bodyHTML&&body.childNodes.length)return false;
  if(typeof releaseChoiceLayout==='function')releaseChoiceLayout();
  releaseChoiceLayout=undefined;
  body.innerHTML=markup;bodyHTML=markup;mountChoices(body);return true;
 }
 function openingState(root){
  const opening=sourcePhase==='opening'&&view==='source-question';
  const body=root.querySelector('.ssp-body');body?.classList.toggle('ssp-opening',opening);if(body){if(opening)body.setAttribute('aria-busy','true');else body.removeAttribute('aria-busy');}
  root.querySelectorAll('[data-ssp-question-step],[data-ssp-remote-type-step]').forEach(el=>{if(sourcePhase==='opening'&&!el.disabled){el.disabled=true;el.dataset.sspOpenLock='';}else if(sourcePhase!=='opening'&&el.hasAttribute('data-ssp-open-lock')){el.disabled=false;delete el.dataset.sspOpenLock;}});
 }
 function draw(focus=true){if(closed)return;const root=container.querySelector('.ssp');if(!root)return;root.querySelectorAll('[data-ssp-course]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.sspCourse===state.course));});const live=root.querySelector('.ssp-live');if(live.textContent!==notice)live.textContent=notice;const body=root.querySelector('.ssp-body');
 if(desk){
  const previousPlanPhase=root.dataset.planPhase;
  const planPane=root.querySelector('[data-study-plan]');
  const units=planPhase==='survey'?planUnits(planDraft.subject,planDraft.need).filter(row=>planDraft.need!=='supplement'||row.book===planDraft.book):planUnits(planProfile?.subject,planProfile?.need);
  const markup=planPhase==='loading'?'<p role="status">학습 계획을 불러오고 있어요.</p>':planPhase==='load-error'?'<button type="button" data-plan-reload>다시 불러오기</button>':studyPlan.render({profile:planProfile,draft:planDraft,step:planStep,phase:planPhase,course:planCourse,subjects,books:planDraft.need==='supplement'?bookMenu():[],supplyPhase,units});
  if(markup!==planHTML){planPane.innerHTML=markup;planHTML=markup;}
  planPane.querySelectorAll('button').forEach(el=>{if(planBusy&&!el.disabled){el.disabled=true;el.dataset.planBusy='';}else if(!planBusy&&el.hasAttribute('data-plan-busy')){el.disabled=false;delete el.dataset.planBusy;}});
  root.dataset.planPhase=planPhase;
  const status=root.querySelector('.ssp-plan-status');status.hidden=!planMessage;if(status.textContent!==planMessage)status.textContent=planMessage;
  const filters=planPhase==='active'?deskFilters():'';
  root.querySelector('.ssp-desk-filters').hidden=!filters;
  if(filters!==deskFilterHTML){root.querySelector('.ssp-desk-filters').innerHTML=filters;deskFilterHTML=filters;}
  root.querySelectorAll('.ssp-desk-controls button, .ssp-desk-controls select:not([disabled]), .ssp-desk-controls [data-ssp-busy-lock]').forEach(el=>{if(remoteBusy&&!el.disabled){el.disabled=true;el.dataset.sspBusyLock='';}else if(!remoteBusy&&el.hasAttribute('data-ssp-busy-lock')){el.disabled=false;delete el.dataset.sspBusyLock;}});
  let bodyMarkup=view==='trial-source'?guestQuestionHTML():view==='guest-limit'?'<article class="ssp-paper"><h2>공개 체험 세 문제를 모두 열어봤어요.</h2>'+trialNotice()+'</article>':view==='source-question'&&remoteQuestion?remoteQuestionHTML():view==='question'&&current?question():view==='history'?history():view==='result'?result():deskWaiting();
  if(guestTrial&&view==='question'&&feedback&&trialOpened.size>=trialLimit)bodyMarkup+=trialNotice();
  if(/못|실패|사라|저장 공간/.test(storageMessage))bodyMarkup+=`<p class="ssil-sync">${esc(storageMessage)}</p>`;
  const material=deskMaterials();if(material)bodyMarkup+=material;
  paintBody(body,bodyMarkup);openingState(root);
  const portraitChoices=matchMedia('(max-width:700px), (min-width:701px) and (max-width:1100px) and (orientation:portrait)').matches;
  if(portraitChoices&&planPhase==='active'&&previousPlanPhase!=='active')requestAnimationFrame(()=>{if(!closed&&root.isConnected&&root.dataset.planPhase==='active')body.scrollIntoView({block:'start',behavior:'instant'});});
  if(focus&&(!portraitChoices||planPhase==='active'))(body.querySelector('.ssp-feedback h3')||body.querySelector('h2'))?.focus({preventScroll:true});
  return;
 }
 paintBody(body,view==='source-question'?remoteQuestionHTML():view==='question'?question():view==='history'?history():view==='result'?result():home());openingState(root);const problemFirst=Boolean(body.querySelector('.ssp-paper'));root.classList.toggle('ssp-problem-first',problemFirst);if(problemFirst)root.insertBefore(body,root.firstChild);else root.appendChild(body);if(focus){const el=root.querySelector('.ssp-body h2');if(el){el.tabIndex=-1;el.focus({preventScroll:true});}}}
 function variantButton(record,records){
  if(!record)return '';
  const activeIds=view==='question'?pool:view==='source-question'?sourceRows().map(q=>q.questionId||q.id):[];
  return window.DSStudentReviewVariants?.button(record,records,activeIds)||'';
 }
 function openOriginal(id,keepPool=false){
  const q=byId.get(id);if(!q)return;
  if(keepPool&&view==='question'&&current?.course===q.course&&pool.includes(id)){
   if(desk)localPage(pool,pool.indexOf(id),false);
   else{cursor=pool.indexOf(id);resetQuestion(q);}
   save();draw();return;
  }
  state.course=q.course;state.book=q.book||state.book;
  deskScope=q.unit;deskUnit=subunit(q);deskType=q.type;invalidateSource();
  if(desk){const list=localSet(q);localPage(list,list.indexOf(id),false);}else begin([id]);
  save();draw();
 }
 function check(skip){if(!current||feedback||!skip&&choice===null)return;const r={id:window.crypto?.randomUUID?.()||'ssp-'+Date.now()+'-'+state.records.length,questionId:current.id,version:current.version,course:current.course,type:current.type,level:current.level,at:Date.now(),choice:skip?null:choice,correct:!skip&&choice===current.answer,confidence:skip?'unsure':confidence,help,solutionSeen:false,repeated:state.records.some(r=>r.questionId===current.id),reason:'',seconds:Math.max(0,(Date.now()-openedAt)/1000)};state.records.push(r);feedback=r;save(r);draw();}
 function click(e){
 if(guestTrial&&e.target.closest('[data-ssil-account="study"]')){
  e.preventDefault();if(view!=='history')trialReturnView=view;view='history';draw();return;
 }
 const b=e.target.closest('button');if(!b||!container.contains(b)||b.disabled)return;notice='';
 if(guestTrial&&b.hasAttribute('data-ssp-guest-next')){void openGuestQuestion();return;}
 if(guestTrial&&b.hasAttribute('data-ssp-guest-open-retry')){void openGuestQuestion(true);return;}
 if(guestTrial&&b.hasAttribute('data-ssp-trial-return')){view=trialReturnView;draw();return;}
 if(guestTrial&&b.hasAttribute('data-ssp-guest-review')){void reviewPlan();return;}
 if(desk&&handlePlanClick(b))return;
 if(b.hasAttribute('data-ssp-variant')){
  if(remoteBusy)return;
  rememberDesk();
  const id=b.dataset.sspVariant,version=b.dataset.sspVersion;
  if(b.dataset.sspKind==='original'){
   if(byId.get(id)?.version===version)openOriginal(id,true);
  }else{
   const match=sourceRows().find(q=>(q.questionId||q.id)===id&&q.version===version);
   if(match)openRemote(id);
   else{
    const target={questionId:id,version};
    void openRemote(id,target).then(()=>{
     if(closed||sourcePhase!=='ready'||view!=='source-question'||(remoteQuestion?.questionId||remoteQuestion?.id)!==id||remoteQuestion.version!==version)return;
     sourceResult={questions:[target]};save();draw(false);
    });
   }
  }
  return;
 }
 if(desk){

  if(remoteBusy)return;
  if(b.hasAttribute('data-ssp-remote-type-step')){
   const groups=remoteTypeGroups(),index=groups.findIndex(group=>group.id===deskType);
   const next=groups[index+Number(b.dataset.sspRemoteTypeStep)];
   if(next&&sourcePhase!=='opening'){rememberDesk();deskType=next.id;openRemote(next.rows[0].questionId||next.rows[0].id,undefined,true);}
   return;
  }
  if(b.hasAttribute('data-ssp-chapter-step')){
   const book=workbookScope().book;const units=book?availableRanges(book):[],idx=units.findIndex(u=>u.id===selectedScopeUnit);
   const unit=units[idx+Number(b.dataset.sspChapterStep)];if(!unit)return;
   selectedScopeUnit=unit.id;selectedScopeType='';widen='subunit';startDesk(state.course);draw(false);return;
  }
  if(b.hasAttribute('data-ssp-question-step')){
   const step=Number(b.dataset.sspQuestionStep);rememberDesk();
   if(current&&view==='question'&&pool[cursor+step]){
    localPage(pool,cursor+step);save();draw(false);
   }else if(remoteQuestion&&view==='source-question'){
    const rows=sourceRows(),index=rows.findIndex(q=>(q.questionId||q.id)===(remoteQuestion.questionId||remoteQuestion.id));
    const row=index>=0&&rows[index+step];
    if(row&&sourcePhase!=='opening')openRemote(row.questionId||row.id,undefined,true);
   }
   return;
  }
  if(b.matches('[data-ssp-concept-step],[data-ssp-type-step]')){
   const sequence=deskUnits().unitRows;
   const index=sequence.findIndex(q=>q.id===(current?.originalQuestionId||current?.id));
   const next=sequence[index+Number(b.dataset.sspConceptStep||b.dataset.sspTypeStep)];
   if(next){rememberDesk();deskType=next.type;localPage(localSet(next),0);save();draw(false);}
   return;
  }
  if(b.hasAttribute('data-ssp-course')||b.hasAttribute('data-ssp-home')){
   const target=b.dataset.sspCourse||state.course;
   if(target===state.course&&b.hasAttribute('data-ssp-course')&&!(view==='question'&&current?.book))return;
   deskUnit='';deskType='';widen='type';startDesk(target);draw(false);return;
  }

 }
 if(b.hasAttribute('data-ssp-remote-retry')&&remoteQuestion){
  openRemote(remoteQuestion.id||remoteQuestion.questionId,remoteMetadata);return;
 }
 if(b.hasAttribute('data-ssp-history-remote')){
  const row=remoteHistory.records.find(r=>r.questionId===b.dataset.sspHistoryRemote);
  if(row){if(COURSES.some(c=>c.id===row.course))state.course=row.course;openRemote(row.questionId,{questionId:row.questionId,version:row.version},true);}
  return;
 }
 if(b.hasAttribute('data-ssp-source-resume')){const p=state.sourcePending[state.course];if(p&&!p.cleared)openRemote(p.questionId,p);return;}if(b.hasAttribute('data-ssp-history-sync')){loadFreeHistory();return;}if(b.hasAttribute('data-ssp-history-more')){loadFreeHistory(true);return;}if(b.hasAttribute('data-ssp-retry-open')){if(lastOpen)openRemote(lastOpen.id,lastOpen.draft,lastOpen.revisit);return;}if(b.hasAttribute('data-ssp-query')){querySource();return;}if(b.hasAttribute('data-ssp-remote')){openRemote(b.dataset.sspRemote);return;}if(b.hasAttribute('data-ssp-remote-submit')){submitRemote();return;}if(b.hasAttribute('data-ssp-remote-unknown')){remoteChoice=null;remoteUnknown=true;submitRemote();return;}if(b.hasAttribute('data-ssp-series')){selectedSeries=b.dataset.sspSeries;widen='type';invalidateSource();draw();querySource();return;}if(b.hasAttribute('data-ssp-widen')){widen=b.dataset.sspWiden;invalidateSource();draw();querySource();return;}if(b.hasAttribute('data-ssp-course')){state.course=b.dataset.sspCourse;view='home';current=null;invalidateSource();queueMicrotask(querySource);}else if(b.hasAttribute('data-ssp-book')){state.book=b.dataset.sspBook;}else if(b.hasAttribute('data-ssp-resume'))resume(state.course);else if(b.hasAttribute('data-ssp-start'))begin();else if(b.hasAttribute('data-ssp-type'))begin(BANK.filter(q=>q.course==='types'&&q.type===b.dataset.sspType).map(q=>q.id));else if(b.hasAttribute('data-ssp-check'))return check(false);else if(b.hasAttribute('data-ssp-skip'))return check(true);else if(b.hasAttribute('data-ssp-hint')){hint=!hint;help=true;}else if(b.hasAttribute('data-ssp-solution')){solution=!solution;if(solution&&feedback){feedback.solutionSeen=true;save(feedback);}}else if(b.hasAttribute('data-ssp-retry'))resetQuestion(current);else if(b.hasAttribute('data-ssp-next')){if(!feedback)return;if(++cursor<pool.length)resetQuestion(byId.get(pool[cursor]));else {state.pending[state.course]={cleared:true,updatedAt:Date.now()};current=null;view='result';}}else if(b.hasAttribute('data-ssp-review'))review(b.dataset.sspReview);else if(b.hasAttribute('data-ssp-history'))view='history';else if(b.hasAttribute('data-ssp-open'))return openOriginal(b.dataset.sspOpen);else if(b.hasAttribute('data-ssp-home'))view='home';else if(b.hasAttribute('data-ssp-sync')){save();return;}else return;save();draw();}
 function change(e){
 if(desk){
  if(e.target.matches('[data-plan-book]')&&planPhase==='survey'&&planDraft.need==='supplement'){
   const book=(guestTrial?bookMenu():workbookChoices()).find(b=>b.id===e.target.value);
   planDraft.book=book?.id||'';planDraft.subject=book?.subject||'';planDraft.unit='';
   draw(false);container.querySelector('[data-plan-unit]')?.focus({preventScroll:true});return;
  }
  if(e.target.matches('[data-plan-subject]')&&planPhase==='survey'){
   if(!guestTrial)window.DSStudyPlanStore.waitingRange?.(activeOwner,null);
   planDraft.subject=e.target.value;planDraft.unit='';draw(false);
   container.querySelector('[data-plan-unit]')?.focus({preventScroll:true});return;
  }
  if(e.target.matches('[data-plan-unit]')&&planPhase==='survey'){void finishPlan(e.target.value);return;}


  if(e.target.matches('[data-ssp-desk-scope],[data-ssp-desk-unit],[data-ssp-desk-type],[data-ssp-grade]')){
   if(e.target.hasAttribute('data-ssp-desk-scope')){deskScope=e.target.value;deskUnit='';deskType='';}
   else if(e.target.hasAttribute('data-ssp-desk-unit')){deskUnit=e.target.value;deskType='';}
   else if(e.target.hasAttribute('data-ssp-grade'))state.grade=Number(e.target.value);
   else deskType=e.target.value;
   startDesk(state.course);if(current)save();draw(false);return;
  }
  if(e.target.matches('[data-ssp-scope-book],[data-ssp-scope-unit],[data-ssp-scope-type]')){
   if(remoteBusy)return;
   if(e.target.hasAttribute('data-ssp-scope-book')&&state.course==='supplement'&&planProfile){
    const book=(guestTrial?bookMenu():workbookChoices()).find(b=>b.id===e.target.value);
    if(book){
     planDraft={goal:planProfile.goal,need:'supplement',subject:book.subject,book:book.id,unit:''};
     planStep=2;planPhase='survey';draw(false);
     container.querySelector('[data-plan-unit]')?.focus({preventScroll:true});return;
    }
   }
   if(e.target.hasAttribute('data-ssp-scope-book')){selectedScopeBook=e.target.value;selectedScopeUnit='';selectedScopeType='';}
   else if(e.target.hasAttribute('data-ssp-scope-unit')){selectedScopeUnit=e.target.value;selectedScopeType='';}
   else selectedScopeType=e.target.value;
   widen=selectedScopeType?'type':'subunit';startDesk(state.course);draw(false);return;
  }
 }
 if(e.target.matches('[data-ssp-target]')){desiredCount=Number(e.target.value);draw(false);return;}if(e.target.name==='ssp-remote-choice'){remoteChoice=Number(e.target.value);remoteUnknown=false;save();return;}if(e.target.matches('[data-ssp-remote-integer]')){const value=e.target.value.trim();remoteUnknown=false;remoteChoice=/^-?\d+$/.test(value)&&Number.isSafeInteger(Number(value))&&Math.abs(Number(value))<=1000000000?Number(value):null;save();return;}if(e.target.matches('[data-ssp-free-unit]')){if(Object.hasOwn(FREE_CONCEPTS,e.target.value))freeUnit=e.target.value;draw();return;}if(e.target.matches('[data-ssp-scope-book]')){selectedScopeBook=e.target.value;widen='type';invalidateSource();draw();querySource();return;}if(e.target.matches('[data-ssp-scope-unit]')){selectedScopeUnit=e.target.value;widen='type';invalidateSource();draw();querySource();return;}if(e.target.matches('[data-ssp-scope-type]')){selectedScopeType=e.target.value;widen='type';invalidateSource();draw();querySource();return;}if(e.target.name==='ssp-answer'){choice=Number(e.target.value);const button=container.querySelector('[data-ssp-check]');if(button)button.disabled=false;save();}else if(e.target.name==='ssp-confidence'){confidence=e.target.value;save();}else if(e.target.matches('[data-ssp-grade]')){state.grade=Number(e.target.value);save();draw();}else if(e.target.matches('[data-ssp-reason]')&&feedback){feedback.reason=e.target.value;save(feedback);}}
 function sessionChange(){clearTimeout(remoteTimer);remoteTimer=0;remoteDirty=false;lastOpen=null;guestRequest++;guestBusy=false;guestRange=null;guestQuestion='';localDrafts.clear();remoteDrafts.clear();epoch++;invalidateSource();remoteQuestion=null;remoteFeedback=null;remoteOperations.clear();remoteHistory={phase:'idle',records:[],hasMore:false,nextBefore:null};activeOwner=owner();current=null;pool=[];feedback=null;view='home';read();if(desk){openFirstQuestion();void loadSupply();void loadPlan();}notice='로그인 상태가 바뀌어 현재 계정의 기록을 다시 확인했어요.';draw();}
 read();if(desk){openFirstQuestion();void loadSupply();void loadPlan();}container.addEventListener('click',click);container.addEventListener('change',change);window.addEventListener('ds-session-change',sessionChange);const leave=()=>{if(document.visibilityState==='hidden')flushRemote(true);},pageLeave=()=>flushRemote(true);document.addEventListener('visibilitychange',leave);window.addEventListener('pagehide',pageLeave);if(options.resume&&typeof options.onReady!=='function')resume();draw(false);
 if(signed()&&activeOwner&&typeof options.loadProgress==='function'){const generation=epoch;Promise.resolve().then(()=>options.loadProgress({namespace:'student-paths-v1',ownerKey:activeOwner})).then(raw=>{if(closed||generation!==epoch)return;const remote=clean(raw);let cached=false;try{cached=Boolean(key()&&localStorage.getItem(key()));}catch{}const local=cached?state:remote;state=mergeProgress(remote,local);const comparable=x=>JSON.stringify({...x,records:[...x.records].sort((a,b)=>a.id.localeCompare(b.id))});if(comparable(state)!==comparable(remote)&&(!desk||cached))save();else{try{if(key())localStorage.setItem(key(),JSON.stringify(state));}catch{}emit();}draw(false);notifyReady();}).catch(()=>{if(closed||generation!==epoch)return;storageMessage='계정 기록을 불러오지 못했어요. 현재 기기의 기록을 보여드려요.';draw(false);notifyReady();});}else notifyReady();
 const controller={snapshot:()=>JSON.parse(JSON.stringify({...state,summary:summary(state),tier:tier(state),storage:storageMessage})),showHistory:()=>{view='history';draw();},resume:()=>{const ok=resume();if(ok)draw();return ok;},destroy:()=>{flushRemote();document.removeEventListener('visibilitychange',leave);window.removeEventListener('pagehide',pageLeave);closed=true;epoch++;if(typeof releaseChoiceLayout==='function')releaseChoiceLayout();container.removeEventListener('click',click);container.removeEventListener('change',change);window.removeEventListener('ds-session-change',sessionChange);controllers.delete(container);if(lastController===controller)lastController=null;}};controllers.set(container,controller);lastController=controller;return controller.destroy;
}
window.DSStudentStudyPaths={render,bind,snapshot:()=>lastController?.snapshot()||null,showHistory:()=>lastController?.showHistory(),resume:()=>lastController?.resume()||false,courses:COURSES.map(c=>({...c})),catalog:()=>BANK.map(({id,version,course,type,level,subject,unit,book,sourceKind})=>({id,version,course,type,level,subject,unit,book,sourceKind})),books:BOOKS.map(b=>({...b,ids:[...b.ids]})),validateState:clean,mergeProgress};
})();
