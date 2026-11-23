/* Original free study paths. No external question/paid-content fetches. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceName=q=>q.sourceLabel||q.sourceTitle||({public_exam:'공개 기출',existing_print:'기존 학습 자료',original:'델타스킬 자체 제작'}[q.sourceKind])||'기존 자료';
const BANK=[
  {
    "id": "dssp1-c1",
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
    "hint": "분자와 분모의 x에 같은 수 3을 넣어 보세요.",
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
      "두 직선의 교점은 (2, 1)이다."
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
    "hint": "a≠1을 확인하고 양변에 a−1을 곱하세요.",
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
    "version": "original-20261124-v1",
    "course": "types",
    "type": "translation",
    "level": 2,
    "subject": "공통수학2",
    "unit": "유리함수와 무리함수",
    "prompt": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><mfrac><mrow><mi>k</mi></mrow><mrow><mi>x</mi><mo>−</mo><mn>1</mn></mrow></mfrac><mo>+</mo><mn>2</mn></mrow></math>의 그래프가 점 (3, 5)를 지날 때, 상수<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>k</mi></mrow></math>의 값은?",
    "options": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn></mrow></math>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn></mrow></math>"
    ],
    "answer": 4,
    "hint": "주어진 점의 x좌표와 y좌표를 함께 대입하세요.",
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
    "hint": "오른쪽 x−2도 0 이상이어야 해요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≥</mo><mn>2</mn></mrow></math>이어야 한다. 양변을 제곱하면 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>+</mo><mn>4</mn><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup><mo>−</mo><mn>4</mn><mi>x</mi><mo>+</mo><mn>4</mn></mrow></math>이다.",
      "정리하면<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">−</mo><mn>5</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>이다. 후보 0, 5 중<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">≥</mo><mn>2</mn></mrow></math>인 5만 원래 식을 만족한다."
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
    "hint": "근호 안의 x 앞 계수가 음수인 점에 주의하세요.",
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
    "hint": "분자를 3(x+2)−7로 바꾸어 보세요.",
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
    "hint": "직선의 y값도 음수가 될 수 없으므로 x≥4가 필요해요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≥</mo><mn>4</mn></mrow></math>에서 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>−</mo><mn>2</mn><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup><mo>−</mo><mn>8</mn><mi>x</mi><mo>+</mo><mn>16</mn></mrow></math>을 푼다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">−</mo><mn>3</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">−</mo><mn>6</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>의 후보 중<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">≥</mo><mn>4</mn></mrow></math>인 6만 남는다.<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo stretchy=\"false\">=</mo><mn>2</mn></mrow></math>이므로 교점은 (6, 2)이다."
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
    "hint": "a≠1을 확인하고 분모를 곱하세요.",
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
    "hint": "x+1=x−(−1)로 읽어 보세요.",
    "solution": [
      "점근선은<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">=</mo><mo stretchy=\"false\">−</mo><mn>1</mn></mrow></math>과<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo stretchy=\"false\">=</mo><mo stretchy=\"false\">−</mo><mn>3</mn></mrow></math>이다. 따라서 교점은 (−1, −3)이다."
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
    "hint": "오른쪽 x가 0 이상인지 확인하세요.",
    "solution": [
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>≥</mo><mn>0</mn></mrow></math>에서 양변을 제곱하면 <math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo>+</mo><mn>6</mn><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup></mrow></math>이다.",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">−</mo><mn>3</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">(</mo><mi>x</mi><mo stretchy=\"false\">+</mo><mn>2</mn><mo stretchy=\"false\">)</mo><mo stretchy=\"false\">=</mo><mn>0</mn></mrow></math>의 후보 3, −2 중<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">≥</mo><mn>0</mn></mrow></math>인 3만 해이다."
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
    "hint": "x≠1을 확인하고 두 y값을 같게 두세요.",
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
    "hint": "먼저 a를 정한 뒤 새로운 방정식을 풀어 보세요.",
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
      "후보 4, −1 중 −1은<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>x</mi><mo stretchy=\"false\">≥</mo><mn>1</mn></mrow></math>을 만족하지 않으므로 원래 식의 해가 아니다."
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
    "hint": "t=√(x+2)로 놓으면 t≥0, x=t²−2예요.",
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
const byId=new Map(BANK.map(q=>[q.id,q]));
const COURSES=[{id:'concept',name:'이론과 기본개념',intro:'개념을 읽고 쉬운 문제로 확인해요.'},{id:'types',name:'주요 유형',intro:'대표 문제를 풀고 약한 유형을 다시 공부해요.'},{id:'supplement',name:'부교재로 연습',intro:'교재와 범위를 골라 온라인으로 풀어요.'},{id:'advanced',name:'고난도 도전',intro:'시작 단계와 풀이 결과에 맞춰 한 단계씩 올라가요.'}];
const TYPES={value:'함숫값과 역으로 대입하기',domain:'분모와 정의역',translation:'평행이동과 점근선',range:'함수의 치역','radical-domain':'근호 안의 조건','radical-equation':'무리방정식과 무연근',intersection:'두 그래프의 교점'};
const BOOKS=[{id:'rational',title:'유리함수 핵심 연습',description:'함숫값 · 역으로 대입하기 · 점근선',source:'델타스킬 자체 제작',ids:['dssp1-s1','dssp1-s2','dssp1-s3']},{id:'radical',title:'무리함수 핵심 연습',description:'근호의 조건 · 제곱과 검산',source:'델타스킬 자체 제작',ids:['dssp1-s4','dssp1-s5','dssp1-s6']}];
const CONCEPTS={value:{name:'대입하기 전에 분모 확인',body:'유리함수의 함숫값은 분자와 분모에 같은 수를 대입해 구해요. 먼저 그 수에서 분모가 0이 아닌지 확인하세요.'},domain:{name:'분모는 0이 될 수 없어요',body:'유리식은 분모가 0인 곳에서 정의되지 않아요. 약분이 되더라도 처음 주어진 식에서 제외한 값은 함부로 되돌릴 수 없어요.'},translation:{name:'점근선 두 개로 위치 읽기',body:'기본 유리함수를 좌우·위아래로 옮기면 두 점근선도 함께 옮겨져요. 분모가 0인 수직선과 함수값이 가까워지는 수평선을 구별하세요.'},range:{name:'치역은 실제로 나오는 함숫값',body:'제곱근의 값은 0 이상이에요. 유리함수에서는 분수 부분이 0이 될 수 있는지 따져, 빠지는 함숫값을 확인해요.'},'radical-domain':{name:'근호 안은 0 이상',body:'실수 범위에서 제곱근 안의 식은 0 이상이어야 해요. 부등식을 풀 때 음수로 나누면 부등호 방향이 바뀌는 것도 확인하세요.'},'radical-equation':{name:'제곱하기 전 부호, 제곱한 뒤 검산',body:'제곱근은 음수가 아니므로 반대쪽도 0 이상이어야 해요. 제곱하면 원래 식을 만족하지 않는 근이 생길 수 있어, 마지막에 반드시 대입해 확인해요.'},intersection:{name:'같은 점에서는 두 y값이 같아요',body:'두 함수식을 같게 놓아 x좌표의 후보를 구해요. 분모가 0이 되는 값과 근호의 조건을 다시 확인한 뒤 y좌표를 구하세요.'}};
const REASONS={concept:'개념을 다시 확인할래요',condition:'조건이나 질문을 놓쳤어요',calculation:'계산을 다시 확인할래요',unknown:'아직 이유를 모르겠어요'};
const FREE_CONCEPTS={
 '지수와 로그':{title:'같은 밑으로 바꾸고 지수를 비교해요',body:'거듭제곱의 곱에서는 지수를 더하고, 거듭제곱을 다시 거듭제곱하면 지수를 곱해요. 로그는 주어진 수가 밑의 몇 제곱인지 나타내요. 로그의 밑은 양수이면서 1이 아니어야 하고, 진수는 양수여야 해요.',formula:'<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msup><mi>a</mi><mi>p</mi></msup><mo>×</mo><msup><mi>a</mi><mi>q</mi></msup><mo>=</mo><msup><mi>a</mi><mrow><mi>p</mi><mo>+</mo><mi>q</mi></mrow></msup><mspace width="1em"/><mo>(</mo><mi>a</mi><mo>&gt;</mo><mn>0</mn><mo>)</mo></mrow></math>'},
 '다항함수의 미분법':{title:'미분한 다음, 주어진 수를 대입해요',body:'미분계수는 그 점에서의 순간변화율이에요. 다항함수는 각 항을 미분하고 더해요. 상수항을 미분하면 0이 되고, 특정 점의 미분계수는 도함수에 그 점의 값을 대입해 구해요. 아래 식의 n은 양의 정수예요.',formula:'<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>=</mo><msup><mi>x</mi><mi>n</mi></msup><mo>⇒</mo><msup><mi>f</mi><mo>′</mo></msup><mo>(</mo><mi>x</mi><mo>)</mo><mo>=</mo><mi>n</mi><msup><mi>x</mi><mrow><mi>n</mi><mo>−</mo><mn>1</mn></mrow></msup></mrow></math>'},
 '순열과 조합':{title:'중복을 허용하는지 먼저 읽어요',body:'순서가 있는 선택인지, 같은 대상을 다시 골라도 되는지 먼저 확인해요. 서로 다른 n개 중 중복을 허락해 r개를 차례로 고르면, 각 자리에 n가지씩 가능하므로 경우의 수는 다음과 같아요. n과 r은 양의 정수예요.',formula:'<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msup><mi>n</mi><mi>r</mi></msup></mrow></math>'},
 '함수의 극한과 연속':{title:'왼쪽과 오른쪽에서 가는 값을 구별해요',body:'어떤 점에서 함수의 극한값이 존재하려면 왼쪽에서 가까이 갈 때의 값과 오른쪽에서 가까이 갈 때의 값이 같아야 해요. 극한값과 그 점의 함숫값이 같은지도 확인해야 연속을 판단할 수 있어요.',formula:'<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><munder><mi>lim</mi><mrow><mi>x</mi><mo>→</mo><msup><mi>a</mi><mo>−</mo></msup></mrow></munder><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>=</mo><munder><mi>lim</mi><mrow><mi>x</mi><mo>→</mo><msup><mi>a</mi><mo>+</mo></msup></mrow></munder><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo></mrow></math>'}
};
function existingFree(){const publicBank=window.DSBasicExamV34?.questions||[];const known=new Map(publicBank.filter(q=>q.canonical===true&&typeof q.id==='string'&&typeof q.version==='string'&&typeof q.questionFrame==='string'&&q.questionFrame.startsWith('assets/canonical-exam-v36/')&&typeof q.solutionFrame==='string'&&q.solutionFrame.startsWith('assets/canonical-exam-v36/')).map(q=>[q.id,q]));return (window.DSStudyEntryV54?.snapshot?.()?.bank||[]).filter(q=>known.get(q.id)?.version===q.version).map(q=>({...q,source:known.get(q.id).sourceTitle,points:known.get(q.id).points}));}
const controllers=new WeakMap();let lastController=null;
function blank(){return {version:1,records:[],pending:{},sourcePending:{},grade:3,course:'concept',book:'rational'};}
function clean(raw){const s=blank();if(!raw||raw.version!==1)return s; s.grade=[1,2,3,4,5,6,7,8,9].includes(raw.grade)?raw.grade:3;s.course=COURSES.some(c=>c.id===raw.course)?raw.course:'concept';s.book=BOOKS.some(b=>b.id===raw.book)?raw.book:'rational';const seen=new Set();for(const r of Array.isArray(raw.records)?raw.records.slice(-250):[]){const q=byId.get(r?.questionId);if(!q||r.version!==q.version||typeof r.id!=='string'||r.id.length>100||seen.has(r.id)||!Number.isFinite(r.at)||!(r.choice===null||Number.isInteger(r.choice)&&r.choice>=0&&r.choice<5))continue;seen.add(r.id);s.records.push({id:r.id,questionId:q.id,version:q.version,course:q.course,type:q.type,level:q.level,at:r.at,updatedAt:Number.isFinite(r.updatedAt)?Math.max(r.at,r.updatedAt):r.at,choice:r.choice,correct:r.choice===q.answer,confidence:r.confidence==='sure'?'sure':'unsure',help:Boolean(r.help),solutionSeen:Boolean(r.solutionSeen),repeated:Boolean(r.repeated),reason:Object.hasOwn(REASONS,r.reason)?r.reason:'',seconds:Math.max(0,Math.min(86400,Number(r.seconds)||0))});}for(const course of COURSES){const p=raw.pending?.[course.id];if(p?.cleared===true&&Number.isFinite(p.updatedAt)){s.pending[course.id]={cleared:true,updatedAt:p.updatedAt};continue;}if(!p||!Array.isArray(p.pool)||!p.pool.length||p.pool.length>24||!p.pool.every(id=>byId.has(id))||!Number.isInteger(p.cursor)||p.cursor<0||p.cursor>=p.pool.length||!Number.isFinite(p.updatedAt))continue;const q=byId.get(p.pool[p.cursor]);const feedback=s.records.find(r=>r.id===p.feedbackId&&r.questionId===q.id);s.pending[course.id]={book:BOOKS.some(b=>b.id===p.book)?p.book:'rational',pool:[...p.pool],cursor:p.cursor,choice:Number.isInteger(p.choice)&&p.choice>=0&&p.choice<5?p.choice:null,confidence:p.confidence==='unsure'?'unsure':'sure',help:Boolean(p.help),hint:Boolean(p.hint),solution:Boolean(p.solution)&&Boolean(feedback),feedbackId:feedback?.id||'',openedAt:Number.isFinite(p.openedAt)?p.openedAt:Date.now(),updatedAt:p.updatedAt};}for(const course of COURSES){const p=raw.sourcePending?.[course.id];if(!p||!Number.isFinite(p.updatedAt))continue;if(p.cleared===true){s.sourcePending[course.id]={cleared:true,updatedAt:p.updatedAt};continue;}if(typeof p.questionId!=='string'||!p.questionId.length||p.questionId.length>160||typeof p.version!=='string'||p.version.length>160||!(p.choice===null||Number.isSafeInteger(p.choice)&&Math.abs(p.choice)<=1000000000)||!Number.isFinite(p.openedAt))continue;s.sourcePending[course.id]={questionId:p.questionId,version:p.version,choice:p.choice,confidence:p.confidence==='unsure'?'unsure':'sure',help:Boolean(p.help),openedAt:p.openedAt,updatedAt:p.updatedAt};}return s;}
function mergeProgress(remote,local){const r=clean(remote),l=clean(local),map=new Map(r.records.map(v=>[v.id,v]));for(const v of l.records){const old=map.get(v.id);if(!old||v.updatedAt>old.updatedAt)map.set(v.id,v);}const pending={...r.pending};for(const [id,p]of Object.entries(l.pending))if(!pending[id]||p.updatedAt>pending[id].updatedAt)pending[id]=p;const sourcePending={...r.sourcePending};for(const [id,p]of Object.entries(l.sourcePending))if(!sourcePending[id]||p.updatedAt>sourcePending[id].updatedAt)sourcePending[id]=p;return clean({...l,pending,sourcePending,records:[...map.values()].sort((a,b)=>a.at-b.at)});}
function latest(state){const map=new Map();for(const r of [...state.records].sort((a,b)=>a.at-b.at))map.set(r.questionId,r);return map;}
function weak(r){return r&&(!r.correct||r.confidence!=='sure'||r.help||r.reason);}
function summary(state){const rows=[...latest(state).values()];return {answered:rows.length,correct:rows.filter(r=>r.correct).length,review:rows.filter(weak).length,attempts:state.records.length};}
function tier(state){const seen=latest(state);let level=state.grade<=2?2:1;while(level<3&&BANK.filter(q=>q.course==='advanced'&&q.level===level).every(q=>{const r=seen.get(q.id);return r?.correct&&r.confidence==='sure'&&!r.help;}))level++;return level;}
function cards(){return COURSES.map((c,i)=>`<button class="ssp-course" data-ssp-course="${c.id}"><span>0${i+1}</span><strong>${c.name}</strong><small>${c.intro}</small></button>`).join('');}
function shell(options={}){return `<section class="ssp" aria-label="내신 공부하기"><header class="ssp-heading"><div><p class="ssp-kicker">회원 무료 · 내신 공부</p><h1>내신 공부하기</h1><p>기존 자료에서 공부할 범위를 고르고, 필요한 부분을 복습하세요.</p></div><a href="#account">내 공부 기록</a></header><nav class="ssp-courses" aria-label="공부 코스">${cards()}</nav><div class="ssp-live" aria-live="polite" role="status"></div><div class="ssp-body"><p>공부 화면을 준비하고 있어요.</p></div></section>`;}
function render(options={}){return shell(options);}
function bind(container,options={}){
 if(!container||typeof container.querySelector!=='function')throw Error('study_container_required');controllers.get(container)?.destroy();
 if(!container.querySelector('.ssp'))container.innerHTML=render(options);
 let readyNotified=false;const notifyReady=()=>{if(readyNotified||closed)return;readyNotified=true;queueMicrotask(()=>{if(!closed)options.onReady?.();});};
 let state=blank(),current=null,pool=[],cursor=0,choice=null,confidence='sure',help=false,hint=false,feedback=null,solution=false,openedAt=Date.now(),notice='',storageMessage='',view=options.view==='history'?'history':'home',closed=false,epoch=0,saveQueue=Promise.resolve();
 const signed=()=>typeof options.signedIn==='function'?Boolean(options.signedIn()):typeof options.signedIn==='boolean'?options.signedIn:Boolean(window.DSService?.session?.());
 const owner=()=>signed()&&typeof options.ownerKey==='function'?String(options.ownerKey()||''):signed()?String(options.ownerKey||''):'';
 let activeOwner=owner();let selectedSeries='쎈',selectedScopeBook='',selectedScopeUnit='',selectedScopeType='',widen='type',otherRange=false,freeUnit='';let sourceGeneration=0,sourceResult=null,sourcePhase='idle',sourceError='',remoteQuestion=null,remoteMetadata=null,remoteChoice=null,remoteUnknown=false,desiredCount=3,remoteConfidence='sure',remoteFeedback=null,remoteOpenedAt=0,remoteBusy=false;const remoteOperations=new Map();let remoteHistory={phase:'idle',records:[],hasMore:false,nextBefore:null};
 const key=()=>activeOwner?'ds-student-paths-v1:'+encodeURIComponent(activeOwner):'';
 const emit=()=>{const detail={source:'student-study-paths',summary:summary(state),storage:storageMessage};window.dispatchEvent(new CustomEvent('ds-student-paths-change',{detail}));};
 function read(){try{const raw=key()?localStorage.getItem(key()):signed()?null:sessionStorage.getItem('ds-student-paths-preview-v1');state=clean(raw?JSON.parse(raw):null);storageMessage=key()?'이 계정의 기기 기록':signed()?'현재 로그인 화면의 기록 · 이 화면을 닫으면 사라져요.':'이 브라우저의 임시 기록';}catch{state=blank();storageMessage='저장 공간을 사용할 수 없어 현재 화면에서만 기록해요.';}}
 function save(record){if(remoteQuestion&&view==='source-question'&&!remoteFeedback)state.sourcePending[state.course]={questionId:remoteQuestion.questionId||remoteQuestion.id,version:remoteQuestion.version,choice:remoteChoice,confidence:remoteConfidence,help:false,openedAt:remoteOpenedAt,updatedAt:Date.now()};if(current&&view==='question')state.pending[state.course]={book:state.book,pool:[...pool],cursor,choice,confidence,help,hint,solution,feedbackId:feedback?.id||'',openedAt,updatedAt:Date.now()};if(record){record.updatedAt=Math.max(Date.now(),(record.updatedAt||record.at||0)+1);state.records=state.records.map(r=>r.id===record.id?record:r);}state=clean(state);try{if(key())localStorage.setItem(key(),JSON.stringify(state));else if(!signed())sessionStorage.setItem('ds-student-paths-preview-v1',JSON.stringify(state));storageMessage=key()?'이 계정의 기기에 저장했어요.':signed()?'현재 로그인 화면에 기록했어요. 계정 저장 연결은 아직 준비 중이에요.':'이 브라우저에 임시 저장했어요.';}catch{storageMessage='기기 저장에 실패했어요. 이 화면을 닫기 전에 기록을 확인하세요.';}
 emit();if(signed()&&activeOwner&&(typeof options.onProgress==='function'||record&&typeof options.onRecord==='function')){const generation=epoch,ownerAtSave=activeOwner,payload=JSON.parse(JSON.stringify(typeof options.onProgress==='function'?state:record));saveQueue=saveQueue.catch(()=>{}).then(async()=>{if(closed||generation!==epoch||ownerAtSave!==owner())return;try{const handler=typeof options.onProgress==='function'?options.onProgress:options.onRecord;const result=await handler(payload,{ownerKey:ownerAtSave,namespace:'student-paths-v1'});if(closed||generation!==epoch)return;if(result?.state)state=mergeProgress(result.state,state);storageMessage=result?.saved===true?'계정에 학습 기록을 저장했어요.':'계정 저장을 확인하지 못했어요. 기기 기록은 유지돼요.';}catch{if(closed||generation!==epoch)return;storageMessage='계정 저장에 실패했어요. 기기 기록은 유지돼요.';}draw(false);emit();});}}
 function qlist(){if(state.course==='supplement')return BANK.filter(q=>q.book===state.book);if(state.course==='advanced')return BANK.filter(q=>q.course==='advanced'&&q.level===tier(state));return BANK.filter(q=>q.course===state.course);}
 function resetQuestion(q){current=q;choice=null;confidence='sure';help=false;hint=false;feedback=null;solution=false;openedAt=Date.now();view='question';}
 function resume(course){const originalLatest=Object.entries(state.pending).filter(([,p])=>!p.cleared).sort((a,b)=>b[1].updatedAt-a[1].updatedAt)[0],sourceLatest=Object.entries(state.sourcePending).filter(([,p])=>!p.cleared).sort((a,b)=>b[1].updatedAt-a[1].updatedAt)[0];if(sourceLatest&&(!course||course===sourceLatest[0])&&(!originalLatest||sourceLatest[1].updatedAt>=originalLatest[1].updatedAt)){state.course=sourceLatest[0];openRemote(sourceLatest[1].questionId,sourceLatest[1]);return true;}const courseId=course||Object.entries(state.pending).filter(([,p])=>!p.cleared).sort((a,b)=>b[1].updatedAt-a[1].updatedAt)[0]?.[0];const p=state.pending[courseId];if(!p||p.cleared)return false;state.course=courseId;state.book=p.book;pool=[...p.pool];cursor=p.cursor;current=byId.get(pool[cursor]);choice=p.choice;confidence=p.confidence;help=p.help;hint=p.hint;solution=p.solution;feedback=state.records.find(r=>r.id===p.feedbackId)||null;openedAt=Date.now();view='question';return true;}
 function begin(ids){pool=(ids||qlist().map(q=>q.id)).filter(id=>byId.has(id));cursor=0;if(!pool.length){notice='지금 선택한 범위에는 문제가 없어요.';return;}resetQuestion(byId.get(pool[0]));}
 function review(type){const seen=latest(state),ids=BANK.filter(q=>(!type||q.type===type)&&weak(seen.get(q.id))).map(q=>q.id);if(!ids.length){notice='현재 복습할 기록이 없어요.';return;}begin(ids);}
 function workbookScope(){const books=[...new Map([...(window.DSPrintScopeData?.books||[]).map(b=>({...b,series:'쎈'})),...(window.DSWorkbookScope?.books||[])].map(b=>[b.id,b])).values()];const book=books.find(b=>b.id===selectedScopeBook);const unit=book?.units?.find(u=>u.id===selectedScopeUnit);const type=unit?.types?.find(t=>t.id===selectedScopeType);return {book,unit,type};}
 function invalidateSource(){sourceGeneration++;sourceResult=null;sourcePhase='idle';sourceError='';}
 function mathContent(value){if(typeof value!=='string')throw Error('invalid_content');const parts=value.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g);return parts.map(part=>{let latex='',display=false;if(part.startsWith('$$')&&part.endsWith('$$')){latex=part.slice(2,-2);display=true;}else if(part.startsWith('$')&&part.endsWith('$'))latex=part.slice(1,-1);else if(part.startsWith('\[')&&part.endsWith('\]')){latex=part.slice(2,-2);display=true;}else if(part.startsWith('\(')&&part.endsWith('\)'))latex=part.slice(2,-2);if(latex){if(!window.katex?.renderToString)throw Error('math_renderer_unavailable');return window.katex.renderToString(latex,{displayMode:display,throwOnError:true,trust:false,strict:'error',maxExpand:1000});}if(/\\[A-Za-z]|\$/.test(part))throw Error('unwrapped_math');return esc(part).replace(/\n/g,'<br>');}).join('');}
 function fragmentContent(html,title){if(typeof html!=='string'||!html.trim()||typeof window.DSStudentFragment?.render!=='function')throw Error('fragment_renderer_unavailable');const rendered=window.DSStudentFragment.render(html,title);if(typeof rendered!=='string')throw Error('invalid_fragment');return rendered;}
 function safeFrame(value){if(typeof value!=='string')return '';try{const url=new URL(value,location.href);if(url.origin!==location.origin||!/^\/app\/assets\/(canonical-exam-v36)\//.test(url.pathname)||url.username||url.password)return '';return url.href;}catch{return '';}}
 function sourceRows(){return sourceResult?.questions||[];}
 async function querySource(){
  if(!signed()){sourcePhase='error';sourceError='로그인 후 학생 무료 범위를 확인할 수 있어요.';draw(false);return;}
  if(typeof window.DSStudentServices?.catalog!=='function'){sourcePhase='error';sourceError='자료 연결을 확인하지 못했어요. 잠시 후 다시 확인해 주세요.';draw(false);return;}
  const {book,unit,type}=workbookScope();if(!book||!unit||widen==='type'&&!type||widen==='family'&&!type?.familyId){sourcePhase='error';sourceError='확인할 교재와 범위를 먼저 선택해 주세요.';draw(false);return;}
  const filters={purpose:'study_free',subject:book.subject,bookId:book.id,unitIds:[unit.id],typeIds:widen==='type'?[type.id]:widen==='family'?(unit.types||[]).filter(t=>t.familyId===type.familyId).map(t=>t.id):[],familyIds:[],scopeLevel:widen==='subunit'?'unit':widen};
  const generation=++sourceGeneration,ownerAtQuery=owner(),sessionAtQuery=epoch;sourcePhase='loading';sourceError='';sourceResult=null;draw(false);
  try{const result=await window.DSStudentServices.catalog(filters);if(closed||generation!==sourceGeneration||sessionAtQuery!==epoch||ownerAtQuery!==owner()||!signed())return;
   if(!Array.isArray(result.questions)||!result.questions.every(q=>typeof(q.questionId||q.id)==='string'&&typeof q.version==='string'&&q.bookId===book.id&&(Array.isArray(q.unitIds)?q.unitIds:[q.unitId]).includes(unit.id)&&(!['type','family'].includes(filters.scopeLevel)||(Array.isArray(q.typeIds)?q.typeIds:[q.typeId]).some(id=>filters.typeIds.includes(id)))))throw Error('invalid_catalog_scope');
   sourceResult=result;sourcePhase='ready';sourceError='';
  }catch{if(closed||generation!==sourceGeneration||sessionAtQuery!==epoch)return;sourcePhase='error';sourceError='이 범위의 무료 이용 가능 수를 확인하지 못했어요. 확인 전에는 다른 자료로 바꾸어 제공하지 않아요.';}
  draw(false);
 }
 function remoteList(){if(sourcePhase==='loading')return '<p role="status">회원에게 허용된 기존 자료를 확인하고 있어요.</p>';if(sourcePhase==='error')return `<p role="alert">${esc(sourceError)}</p><button data-ssp-query>다시 확인</button>`;if(sourcePhase!=='ready')return '<p>현재 계정에 허용된 기존 문항 수를 서버에서 확인해 주세요.</p><button data-ssp-query>이 범위의 무료 문제 확인</button>';const rows=sourceRows();return `<p><strong>이 계정에서 무료로 열 수 있는 문항 ${rows.length}개</strong></p><p>${rows.length>=desiredCount?'원하는 '+desiredCount+'문항 이상이 있어요. 정확히 선택한 범위에서 풀 수 있어요.':desiredCount+'문항을 공부하려면 '+Math.max(0,desiredCount-rows.length)+'문항이 부족해요.'}</p>${rows.length?`<ul class="ssp-existing-list">${rows.map(q=>`<li><div><strong>${esc(q.title||q.typeLabel||q.unit||'기존 문항')}</strong><span>${esc(sourceName(q))} · ${esc(q.unit||'')}</span></div><button data-ssp-remote="${esc(q.questionId||q.id)}">이 문제 풀기</button></li>`).join('')}</ul>`:'<p>확인한 이 범위에서 학생 무료로 허용된 문항이 없어요. 범위를 넓힐지는 직접 선택할 수 있어요.</p>'}`;}
 async function openRemote(id,draft){const metadata=draft||sourceRows().find(q=>(q.questionId||q.id)===id)||remoteHistory.records.find(q=>q.questionId===id);if(!metadata||typeof window.DSStudentServices?.open!=='function'){notice='문항을 여는 연결을 확인하지 못했어요.';draw(false);return;}const generation=++sourceGeneration,sessionAtOpen=epoch;sourcePhase='opening';notice='허용된 문항을 불러오고 있어요.';draw(false);try{const result=await DSStudentServices.open({questionId:id,purpose:'study_free'});if(closed||generation!==sourceGeneration||sessionAtOpen!==epoch||!signed())return;const q=result.question;if(!q||(q.questionId||q.id)!==id||(metadata.version&&q.version!==metadata.version)||typeof q.version!=='string')throw Error('version_changed');if(q.answer!==undefined||q.solution!==undefined||q.solutionFrame!==undefined||q.solutionHTML!==undefined)throw Error('active_answer_exposure');if(q.format==='sandbox-html'){q._safeFragment=fragmentContent(q.questionHTML,'기존 자료 문제');}else if(q.format==='frame'){if(!safeFrame(q.questionFrame))throw Error('unsupported_frame');}else if(q.format==='text-latex'){mathContent(q.prompt);if(q.options)q.options.forEach(mathContent);}else throw Error('unsupported_format');q.answerType=q.answerType||metadata.answerType;remoteQuestion=q;remoteMetadata=metadata;remoteChoice=draft?.choice??null;remoteUnknown=false;remoteConfidence=draft?.confidence||'sure';remoteFeedback=null;remoteOpenedAt=Date.now();view='source-question';notice='';sourcePhase='ready';if(!draft)save();draw();}catch{if(closed||generation!==sourceGeneration||sessionAtOpen!==epoch)return;sourcePhase='error';notice='문항의 판이나 열람 형식을 확인하지 못했어요. 다시 범위를 확인해 주세요.';draw(false);}}
 async function submitRemote(){if(!remoteQuestion||remoteBusy||remoteFeedback)return;if(typeof DSStudentServices?.submit!=='function'){notice='답안을 이 화면에 남겼어요. 서버 채점 연결은 아직 준비 중이에요.';draw(false);return;}const id=remoteQuestion.questionId||remoteQuestion.id;let operation=remoteOperations.get(id);if(!operation){if(remoteChoice===null&&!remoteUnknown){notice='답을 입력하거나 모르겠어요를 선택해 주세요.';draw(false);return;}operation={questionId:id,version:remoteQuestion.version,answer:remoteChoice,requestId:crypto.randomUUID(),course:state.course,confidence:remoteConfidence,help:false,seconds:Math.min(86400,Math.max(0,Math.round((Date.now()-remoteOpenedAt)/1000)))};remoteOperations.set(id,operation);}const generation=epoch;remoteBusy=true;notice='답안을 확인하고 있어요.';draw(false);try{const result=await DSStudentServices.submit(operation);if(closed||generation!==epoch||!signed())return;if(!result?.record||result.record.questionId!==id||result.record.version!==operation.version||typeof result.record.correct!=='boolean')throw Error('invalid_grade');if(result.solutionHTML){try{result._safeSolutionFragment=fragmentContent(result.solutionHTML,'제출 후 해설');}catch{result.solutionUnavailable=true;}}if(result.solution){try{(Array.isArray(result.solution)?result.solution:[result.solution]).forEach(mathContent);}catch{result.solution=null;result.solutionUnavailable=true;}}remoteFeedback=result;remoteOperations.delete(id);state.sourcePending[state.course]={cleared:true,updatedAt:Date.now()};save();notice='계정에 풀이 결과를 저장했어요.';remoteHistory.phase='idle';window.dispatchEvent(new CustomEvent('ds-student-free-record',{detail:{record:result.record}}));}catch(error){if(closed||generation!==epoch)return;if([400,403,404,409,422].includes(error?.status)){remoteOperations.delete(id);notice='답안의 형식이나 문항 이용 상태가 바뀌었어요. 범위와 문항을 다시 확인해 주세요.';return;}notice='제출 결과를 확인하지 못했어요. 같은 답안으로 다시 확인해 주세요. 중복으로 새 풀이를 만들지 않아요.';}finally{if(generation===epoch){remoteBusy=false;draw(false);}}}
 function remoteQuestionHTML(){const q=remoteQuestion,id=q.questionId||q.id,frame=q.format==='frame'?safeFrame(q.questionFrame):'';const pending=remoteOperations.has(id);let content=q.format==='sandbox-html'?q._safeFragment+'<p class="ssp-note">긴 수식은 좌우로 밀어서 확인할 수 있어요.</p>':frame?`<iframe class="ssp-server-frame" title="허용된 기존 문항" sandbox="allow-same-origin" referrerpolicy="no-referrer" src="${esc(frame)}"></iframe>`:`<div class="ssp-prompt">${mathContent(q.prompt)}</div>`;const choices=q.answerType==='choice'?(Array.isArray(q.options)&&q.options.length===5?q.options:['1번','2번','3번','4번','5번']):null;return `<article class="ssp-paper"><div class="ssp-paper-top"><span>${esc(sourceName(remoteMetadata))}</span><span>${esc(q.unit||remoteMetadata.unit||'')}</span></div><h2 tabindex="-1">기존 자료 풀기</h2>${content}<fieldset class="ssp-options" ${remoteFeedback||remoteBusy||pending?'disabled':''}><legend>답을 입력해 주세요.</legend>${choices?choices.map((text,i)=>`<label><input type="radio" name="ssp-remote-choice" value="${i}" ${remoteChoice===i?'checked':''}><span class="ssp-option-no">${i+1}</span><span>${mathContent(text)}</span></label>`).join(''):`<label>정수 답안 <input type="number" inputmode="numeric" step="1" data-ssp-remote-integer ${Number.isSafeInteger(remoteChoice)?`value="${remoteChoice}"`:''} aria-label="정수 답안"></label>`}</fieldset>${!remoteFeedback?`<fieldset class="ssp-confidence" ${remoteBusy||pending?'disabled':''}><legend>얼마나 확실한가요?</legend><label><input type="radio" name="ssp-remote-confidence" value="sure" ${remoteConfidence==='sure'?'checked':''}>확실해요</label><label><input type="radio" name="ssp-remote-confidence" value="unsure" ${remoteConfidence==='unsure'?'checked':''}>아직 헷갈려요</label></fieldset><div class="ssp-actions"><button class="ssp-primary" data-ssp-remote-submit ${remoteBusy?'disabled':''}>${pending?'같은 답안으로 결과 다시 확인':'답 제출하고 확인'}</button><button data-ssp-remote-unknown ${remoteBusy||pending?'disabled':''}>모르겠어요</button></div>`:`<section class="ssp-feedback"><h3>${remoteFeedback.record.correct?'맞았어요.':'조건과 풀이를 다시 확인해 봐요.'}</h3>${remoteFeedback.answer!==undefined?`<p>정답 ${esc(choices?Number(remoteFeedback.answer)+1+'번':remoteFeedback.answer)}</p>`:''}${remoteFeedback._safeSolutionFragment?`<section class="ssp-solution">${remoteFeedback._safeSolutionFragment}<p class="ssp-note">긴 수식은 좌우로 밀어서 확인할 수 있어요.</p></section>`:''}${remoteFeedback.solutionUnavailable?'<p>해설 표시 형식을 확인하지 못했어요. 채점 결과는 계정에 저장했어요.</p>':''}${remoteFeedback.solution?`<div class="ssp-solution">${(Array.isArray(remoteFeedback.solution)?remoteFeedback.solution:[remoteFeedback.solution]).map(line=>`<p>${mathContent(line)}</p>`).join('')}</div>`:''}${safeFrame(remoteFeedback.solutionFrame)?`<iframe class="ssp-server-frame" title="제출 후 해설" sandbox="allow-same-origin" referrerpolicy="no-referrer" src="${esc(safeFrame(remoteFeedback.solutionFrame))}"></iframe>`:''}</section>`}<footer class="ssp-paper-foot"><span>계정에 허용된 기존 자료 · 서버에서 판과 이용 권한 확인</span><button data-ssp-home>코스로 돌아가기</button></footer></article>`;}
 function sourcePanel(){
  const free=existingFree(),units=[...new Set(free.map(q=>q.unit))];if(!units.includes(freeUnit))freeUnit=units[0]||'';
  const list=free.filter(q=>q.unit===freeUnit),freeConcept=FREE_CONCEPTS[freeUnit];
  let bookPanel='';
  {
   const scope=[...new Map([...(window.DSPrintScopeData?.books||[]).map(b=>({...b,series:'쎈'})),...(window.DSWorkbookScope?.books||[])].map(b=>[b.id,b])).values()],books=scope.filter(b=>(b.series||b.label||'').includes(selectedSeries));
   if(!books.some(b=>b.id===selectedScopeBook))selectedScopeBook=(books.find(b=>b.variant===(state.course==='advanced'?'advanced':state.course==='types'?'type':'base'))||books[0])?.id||'';
   const book=books.find(b=>b.id===selectedScopeBook),us=book?.units||[];
   if(!us.some(u=>u.id===selectedScopeUnit))selectedScopeUnit=us[0]?.id||'';
   const unit=us.find(u=>u.id===selectedScopeUnit),types=unit?.types||[];
   if(!types.some(t=>t.id===selectedScopeType))selectedScopeType=types[0]?.id||'';
   const family=types.find(t=>t.id===selectedScopeType)?.familyId||'',familyTypeIds=family?types.filter(t=>t.familyId===family).map(t=>t.id):[];
   bookPanel=`<div class="ssp-workbook"><h3>문제집 시리즈와 범위</h3><p>원천 목록이 있는 것과 회원 무료로 풀 수 있는 것은 달라요. 원문과 유사 코드가 확인된 문항만 연결해요.</p><div class="ssp-series" role="group" aria-label="문제집 시리즈">${['쎈','올림포스'].map(n=>`<button data-ssp-series="${n}" aria-pressed="${n===selectedSeries}">${n}</button>`).join('')}</div>${book&&Number.isInteger(book.inventoryCount)?`<p class="ssp-note">${esc(book.label)} 자료 목록 ${book.inventoryCount}문항 · 학생 무료 이용 연결은 확인 중이에요.</p>`:''}${books.length?`<label>교재 <select data-ssp-scope-book>${books.map(b=>`<option value="${esc(b.id)}" ${b.id===selectedScopeBook?'selected':''}>${esc(b.label)} · ${esc(b.subject)}</option>`).join('')}</select></label><label>단원 <select data-ssp-scope-unit>${us.map(u=>`<option value="${esc(u.id)}" ${u.id===selectedScopeUnit?'selected':''}>${esc(u.label)}</option>`).join('')}</select></label>${types.length?`<label>세부유형 <select data-ssp-scope-type>${types.map(t=>`<option value="${esc(t.id)}" ${t.id===selectedScopeType?'selected':''}>${esc(t.label)}</option>`).join('')}</select></label>`:'<p>이 단원의 세부유형 목록은 아직 연결하지 못했어요.</p>'}`:'<p>이 시리즈의 교재·단원 목록을 준비하고 있어요.</p>'}<label>풀고 싶은 문제 수 <select data-ssp-target>${[1,3,5,10].map(n=>`<option value="${n}" ${n===desiredCount?'selected':''}>${n}문항</option>`).join('')}</select></label><div class="ssp-scope-check"><strong>${widen==='type'?'선택한 세부유형':widen==='family'?'동의한 관련 유형군 · '+esc(family):'동의한 소단원 · '+esc(unit?.label||'')}  · ${sourcePhase==='ready'?'무료 이용 확인 '+sourceRows().length+'문항':'무료 이용 확인 전'}</strong>${remoteList()}${sourcePhase==='ready'&&sourceRows().length>=desiredCount?'':widen==='type'?(family&&familyTypeIds.length>0?'<button data-ssp-widen="family">관련 유형군까지 넓혀 확인할게요</button>':'<p>연결된 관련 유형군이 없어 선택 단원 범위부터 확인할 수 있어요.</p><button data-ssp-widen="subunit">선택한 단원까지 넓혀 확인할게요</button>'):widen==='family'?'<button data-ssp-widen="subunit">선택한 소단원까지 넓혀 확인할게요</button>':(sourcePhase==='ready'&&!sourceRows().length?'<p>선택한 단원까지 넓힌 뒤에도 무료 연결 확인 0문항이에요.</p>':'')}<button data-ssp-other>다른 범위의 기존 기출 보기</button></div></div>`;
  }
  const showFree=state.course!=='supplement'||otherRange;
  const heading=state.course==='advanced'?'기존 자료의 난도 확인':'기존 자료에서 공부하기';
  return `<section class="ssp-panel ssp-sources"><h2>${heading}</h2>${state.sourcePending[state.course]&&!state.sourcePending[state.course].cleared?'<button class="ssp-primary" data-ssp-source-resume>이 코스의 풀던 기존 문항 이어하기</button>':''}${bookPanel}${showFree?`<p><strong>학생 무료로 열 수 있는 범위 · ${free.length}문항</strong></p><p>이미 제공 중인 수능 기출의 원래 문제·해설과 학습 기록으로 연결해요. ${state.course==='advanced'?'아래 기존 공개 기출 15문항은 모두 2점이에요. 고난도 여부는 위에서 선택한 실제 자료의 분류와 이용 가능 수를 따로 확인해 주세요.':state.course==='types'?'세부유형·유사 코드 연결은 미확인이라 단원별로 골라요.':''}</p>${free.length?`<label class="ssp-existing-label">기존 자료 단원 <select data-ssp-free-unit>${units.map(u=>`<option ${u===freeUnit?'selected':''}>${esc(u)}</option>`).join('')}</select></label>${state.course==='concept'&&freeConcept?`<aside class="ssp-hint"><h3>${esc(freeConcept.title)}</h3><p>${esc(freeConcept.body)}</p><div class="ssp-formula">${freeConcept.formula}</div><small>델타스킬 자체 개념 설명 · 아래 기존 문제로 확인해요.</small></aside>`:''}<ul class="ssp-existing-list">${list.map(q=>`<li><div><strong>${esc(q.short)}</strong><span>${esc(q.source)} · ${q.points}점</span></div><button data-ssp-existing="${esc(q.id)}" ${typeof window.DSStudyEntryV54?.openPractice!=='function'?'disabled':''}>이 문제 풀기</button></li>`).join('')}</ul>`:'<p>현재 화면에 연결된 기존 무료 문항을 불러오지 못했어요. 자료 연결 후 다시 확인해 주세요.</p>'}`:''}</section>`;
 }
 function home(){const s=summary(state),seen=latest(state);const weakTypes=[...new Set([...seen.values()].filter(weak).map(r=>r.type))];let content='';
 if(state.course==='concept')content=`<div class="ssp-concepts">${['value','domain','radical-domain','radical-equation'].map(id=>`<article><h3>${CONCEPTS[id].name}</h3><p>${CONCEPTS[id].body}</p></article>`).join('')}</div>`;
 if(state.course==='types')content=`<div class="ssp-type-list">${BANK.filter(q=>q.course==='types').map(q=>`<button data-ssp-type="${q.type}"><strong>${esc(TYPES[q.type])}</strong><span>대표 문제 1개${weakTypes.includes(q.type)?' · 복습 추천':''}</span></button>`).join('')}</div>`;
 if(state.course==='supplement')content=`<div class="ssp-books" role="group" aria-label="부교재 선택">${BOOKS.map(b=>`<button data-ssp-book="${b.id}" aria-pressed="${state.book===b.id}"><span>${esc(b.source)}</span><strong>${esc(b.title)}</strong><small>${esc(b.description)} · ${b.ids.length}문항</small></button>`).join('')}</div><p class="ssp-note">이곳의 부교재는 직접 만든 온라인 연습본이에요. 다른 출판사의 교재나 기출 원문을 제공하지 않아요.</p>`;
 if(state.course==='advanced')content=`<label class="ssp-grade">최근 내신 등급 <select data-ssp-grade aria-label="최근 내신 등급">${[1,2,3,4,5,6,7,8,9].map(g=>`<option value="${g}" ${g===state.grade?'selected':''}>${g}등급</option>`).join('')}</select></label><p>지금은 <strong>${tier(state)}단계</strong>에서 시작해요. ${state.grade<=2?'선택한 등급을 참고한 출발 단계이며, 실력을 확정한 결과는 아니에요.':'조건 확인부터 시작해요.'} 각 단계의 두 문제를 도움 없이 풀고 확신을 표시하면 다음 단계로 가요.</p><ol class="ssp-steps">${['조건을 놓치지 않기','조건 두 개를 연결하기','교점 개수와 매개변수'].map((n,i)=>`<li ${i+1===tier(state)?'aria-current="step"':''}>${i+1}. ${n}</li>`).join('')}</ol><p class="ssp-note">난도는 교사 관점의 설계 단계예요. 실측 정답률이나 기출 등급을 뜻하지 않아요.</p>`;
 const c=COURSES.find(c=>c.id===state.course);return `${sourcePanel()}<details class="ssp-extra"><summary>자체 제작 보완연습 · 공통수학2</summary><p class="ssp-note">아래 24문항은 기존 교재·기출에서 불러온 문항이 아닌 별도 원창작이에요. 쎈·올림포스의 문항 또는 유사 코드 연결로 표시하지 않아요.</p><div class="ssp-panel"><p class="ssp-kicker">${esc(c.intro)}</p><h2>${esc(c.name)}</h2>${content}<div class="ssp-actions">${state.pending[state.course]&&!state.pending[state.course].cleared?'<button class="ssp-primary" data-ssp-resume>풀던 공부 이어하기</button>':''}<button class="ssp-primary" data-ssp-start>${state.pending[state.course]&&!state.pending[state.course].cleared?'새로 공부하기':'공부 시작'} · ${qlist().length}문항</button><button data-ssp-history>내 기록 보기</button></div></div><aside class="ssp-progress"><h2>보완연습 기록</h2><p>풀어 본 문제 <b>${s.answered}</b>개 · 최근 정답 <b>${s.correct}</b>개</p><p>다시 볼 문제 <b>${s.review}</b>개</p>${weakTypes.length?`<h3>이 유형을 다시 볼까요?</h3>${weakTypes.map(t=>`<button data-ssp-review="${t}">${esc(TYPES[t])}</button>`).join('')}`:'<p>한 번의 정답으로 숙달을 판단하지 않아요. 풀고 난 뒤 풀이도 비교해 보세요.</p>'}<p class="ssp-note">${esc(storageMessage)}</p>${signed()&&activeOwner&&typeof options.onProgress==='function'?'<button data-ssp-sync>기록 다시 저장</button>':''}</aside></details>`;}
 function question(){const q=current;if(!q)return home();const concept=CONCEPTS[q.type];const repeated=state.records.some(r=>r.questionId===q.id);return `<article class="ssp-paper"><div class="ssp-paper-top"><span>${esc(TYPES[q.type])} · ${q.level}단계</span><span>${cursor+1} / ${pool.length}</span></div><h2 tabindex="-1" class="ssp-problem-heading">${esc(q.subject)} · ${esc(q.unit)}</h2>${repeated?'<p class="ssp-note">전에 풀어 본 문제예요. 이번 결과는 복습 기록으로 남겨요.</p>':''}<div class="ssp-prompt">${q.prompt}</div><fieldset class="ssp-options" ${feedback?'disabled':''}><legend>답을 하나 골라주세요.</legend>${q.options.map((o,i)=>`<label><input type="radio" name="ssp-answer" value="${i}" ${choice===i?'checked':''}><span class="ssp-option-no">${i+1}</span><span>${o}</span></label>`).join('')}</fieldset>${!feedback?`<fieldset class="ssp-confidence"><legend>내 선택이 얼마나 확실한가요?</legend><label><input type="radio" name="ssp-confidence" value="sure" ${confidence==='sure'?'checked':''}>확실해요</label><label><input type="radio" name="ssp-confidence" value="unsure" ${confidence==='unsure'?'checked':''}>아직 헷갈려요</label></fieldset><div class="ssp-actions"><button class="ssp-primary" data-ssp-check ${choice===null?'disabled':''}>답 확인</button><button data-ssp-skip>모르겠어요</button><button data-ssp-hint aria-expanded="${hint}">힌트 ${hint?'접기':'보기'}</button></div>`:''}${hint?`<aside class="ssp-hint"><h3>첫 생각</h3><p>${esc(q.hint)}</p><p>${esc(concept.body)}</p></aside>`:''}${feedback?`<section class="ssp-feedback"><h3>${feedback.choice===null?'함께 다시 확인해 봐요.':feedback.correct?'맞았어요. 풀이의 조건도 확인해 보세요.':'답을 다시 살펴볼까요?'}</h3><p>정답은 ${q.answer+1}번이에요. ${feedback.help?'힌트를 확인한 풀이로 기록했어요.':''}</p><label>다시 볼 이유 <select data-ssp-reason><option value="">선택하지 않음</option>${Object.entries(REASONS).map(([id,label])=>`<option value="${id}" ${feedback.reason===id?'selected':''}>${label}</option>`).join('')}</select></label><div class="ssp-actions"><button data-ssp-solution aria-expanded="${solution}">${solution?'풀이 접기':'해설 보기'}</button><button data-ssp-retry>답을 가리고 다시 풀기</button><button class="ssp-primary" data-ssp-next>${cursor+1<pool.length?'다음 문제':'공부 결과 보기'}</button></div>${solution?`<section class="ssp-solution"><h3>조건 → 계산 → 확인</h3><ol>${q.solution.map(s=>`<li>${s}</li>`).join('')}</ol></section>`:''}</section>`:''}<footer class="ssp-paper-foot"><span>델타스킬 원창작 · 기출 문항 아님</span><button data-ssp-home>코스로 돌아가기</button></footer></article>`;}
 async function loadFreeHistory(more=false){if(!signed()||remoteHistory.phase==='loading')return;if(typeof window.DSStudentServices?.history!=='function'){remoteHistory.phase='unavailable';draw(false);return;}const generation=epoch;remoteHistory.phase='loading';draw(false);try{const result=await DSStudentServices.history({kind:'free',limit:20,...(more&&remoteHistory.nextBefore?{before:remoteHistory.nextBefore}:{})});if(closed||generation!==epoch||!signed())return;if(activeOwner&&result.ownerKey!==activeOwner||!Array.isArray(result.records)||!result.records.every(r=>typeof r.recordId==='string'&&Number.isFinite(Date.parse(r.at))))throw Error('invalid_history');remoteHistory={phase:'ready',records:[...new Map([...(more?remoteHistory.records:[]),...result.records].map(r=>[r.recordId,r])).values()],hasMore:result.hasMore===true,nextBefore:result.nextBefore||null};}catch{if(closed||generation!==epoch)return;remoteHistory.phase='error';}draw(false);}
 function serverHistoryHTML(){if(remoteHistory.phase==='idle')queueMicrotask(()=>loadFreeHistory());const rows=remoteHistory.records;return `<section class="ssp-server-history"><h3>기존 자료 풀이 · 계정 기록</h3>${remoteHistory.phase==='loading'?'<p role="status">계정의 기존 자료 풀이를 불러오고 있어요.</p>':remoteHistory.phase==='error'||remoteHistory.phase==='unavailable'?'<p>기존 자료의 계정 기록을 확인하지 못했어요. 보완연습 기록과 구분해서 다시 불러올 수 있어요.</p><button data-ssp-history-sync>계정 기록 다시 불러오기</button>':!rows.length?'<p>확인된 기존 자료 풀이 기록이 아직 없어요.</p>':''}${rows.length?`<ul>${rows.map(r=>`<li><div><strong>${esc(r.title||r.unit||r.subject||'기존 자료 풀이')}</strong><span>${esc(new Date(r.at).toLocaleDateString('ko-KR'))} · ${r.correct===true?'정답':r.correct===false?'다시 확인':'풀이 기록'}</span></div>${r.questionId?`<button data-ssp-remote="${esc(r.questionId)}">다시 풀기</button>`:''}</li>`).join('')}</ul>`:''}${remoteHistory.hasMore?'<button data-ssp-history-more>이전 계정 기록 더 보기</button>':''}</section>`;}
 function history(){const rows=[...latest(state).values()].reverse();return `<section class="ssp-panel ssp-history"><h2 tabindex="-1">내신 공부 기록</h2>${serverHistoryHTML()}<h3>자체 제작 보완연습 기록</h3><p>${esc(storageMessage)} · 최근 ${state.records.length}회 풀이</p><p>문제별 최근 결과예요. 정답이어도 힌트를 보았거나 헷갈렸다면 복습에 남겨요.</p>${rows.length?`<ul>${rows.map(r=>`<li><div><strong>${esc(TYPES[r.type])}</strong><span>${esc(COURSES.find(c=>c.id===r.course)?.name)} · ${r.level}단계 · ${r.correct?'정답':r.choice===null?'모르겠어요':'오답'}${r.help?' · 도움 받음':''}${r.repeated?' · 재풀이':''}</span>${r.reason?`<small>선택한 복습 이유: ${esc(REASONS[r.reason])}</small>`:''}</div><button data-ssp-open="${r.questionId}">다시 풀기</button></li>`).join('')}</ul>`:'<p>아직 공부 기록이 없어요. 원하는 코스에서 첫 문제를 풀어 보세요.</p>'}<div class="ssp-actions"><button class="ssp-primary" data-ssp-review="">틀림·헷갈림 복습</button><button data-ssp-home>코스로 돌아가기</button></div></section>`;}
 function result(){const rows=pool.map(id=>latest(state).get(id)).filter(Boolean),nextTier=tier(state);return `<section class="ssp-panel"><h2 tabindex="-1">이번 공부를 마쳤어요.</h2><p>${rows.length}문제 중 최근 정답 ${rows.filter(r=>r.correct).length}개 · 다시 볼 문제 ${rows.filter(weak).length}개</p>${state.course==='advanced'?`<p>지금 이어갈 단계는 ${nextTier}단계예요. 재풀이 결과는 새 문제에서의 실력 확인과 구별해요.</p>`:''}<p>${esc(storageMessage)}</p><div class="ssp-actions"><button class="ssp-primary" data-ssp-review="">틀림·실수 복습</button><button data-ssp-home>다음 공부 고르기</button><button data-ssp-history>내 기록 보기</button></div></section>`;}
 function draw(focus=true){if(closed)return;const root=container.querySelector('.ssp');if(!root)return;root.querySelectorAll('[data-ssp-course]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.sspCourse===state.course));});root.querySelector('.ssp-live').textContent=notice;const body=root.querySelector('.ssp-body');body.innerHTML=view==='source-question'?remoteQuestionHTML():view==='question'?question():view==='history'?history():view==='result'?result():home();const problemFirst=Boolean(body.querySelector('.ssp-paper'));root.classList.toggle('ssp-problem-first',problemFirst);if(problemFirst)root.insertBefore(body,root.firstChild);else root.appendChild(body);if(focus){const el=root.querySelector('.ssp-body h2');if(el){el.tabIndex=-1;el.focus({preventScroll:true});}}}
 function check(skip){if(!current||feedback||!skip&&choice===null)return;const r={id:window.crypto?.randomUUID?.()||'ssp-'+Date.now()+'-'+state.records.length,questionId:current.id,version:current.version,course:current.course,type:current.type,level:current.level,at:Date.now(),choice:skip?null:choice,correct:!skip&&choice===current.answer,confidence:skip?'unsure':confidence,help,solutionSeen:false,repeated:state.records.some(r=>r.questionId===current.id),reason:'',seconds:Math.max(0,(Date.now()-openedAt)/1000)};state.records.push(r);feedback=r;save(r);draw();}
 function click(e){const b=e.target.closest('button');if(!b||!container.contains(b)||b.disabled)return;notice='';if(b.hasAttribute('data-ssp-source-resume')){const p=state.sourcePending[state.course];if(p&&!p.cleared)openRemote(p.questionId,p);return;}if(b.hasAttribute('data-ssp-history-sync')){loadFreeHistory();return;}if(b.hasAttribute('data-ssp-history-more')){loadFreeHistory(true);return;}if(b.hasAttribute('data-ssp-query')){querySource();return;}if(b.hasAttribute('data-ssp-remote')){openRemote(b.dataset.sspRemote);return;}if(b.hasAttribute('data-ssp-remote-submit')){submitRemote();return;}if(b.hasAttribute('data-ssp-remote-unknown')){remoteChoice=null;remoteUnknown=true;submitRemote();return;}if(b.hasAttribute('data-ssp-existing')){const q=existingFree().find(q=>q.id===b.dataset.sspExisting);if(q&&typeof window.DSStudyEntryV54?.openPractice==='function')window.DSStudyEntryV54.openPractice(q.id);return;}if(b.hasAttribute('data-ssp-series')){selectedSeries=b.dataset.sspSeries;widen='type';otherRange=false;invalidateSource();draw();querySource();return;}if(b.hasAttribute('data-ssp-widen')){widen=b.dataset.sspWiden;invalidateSource();draw();querySource();return;}if(b.hasAttribute('data-ssp-other')){otherRange=true;draw();return;}if(b.hasAttribute('data-ssp-course')){state.course=b.dataset.sspCourse;view='home';current=null;invalidateSource();queueMicrotask(querySource);}else if(b.hasAttribute('data-ssp-book')){state.book=b.dataset.sspBook;}else if(b.hasAttribute('data-ssp-resume'))resume(state.course);else if(b.hasAttribute('data-ssp-start'))begin();else if(b.hasAttribute('data-ssp-type'))begin(BANK.filter(q=>q.course==='types'&&q.type===b.dataset.sspType).map(q=>q.id));else if(b.hasAttribute('data-ssp-check'))return check(false);else if(b.hasAttribute('data-ssp-skip'))return check(true);else if(b.hasAttribute('data-ssp-hint')){hint=!hint;help=true;}else if(b.hasAttribute('data-ssp-solution')){solution=!solution;if(solution&&feedback){feedback.solutionSeen=true;save(feedback);}}else if(b.hasAttribute('data-ssp-retry'))resetQuestion(current);else if(b.hasAttribute('data-ssp-next')){if(!feedback)return;if(++cursor<pool.length)resetQuestion(byId.get(pool[cursor]));else {state.pending[state.course]={cleared:true,updatedAt:Date.now()};current=null;view='result';}}else if(b.hasAttribute('data-ssp-review'))review(b.dataset.sspReview);else if(b.hasAttribute('data-ssp-history'))view='history';else if(b.hasAttribute('data-ssp-open'))begin([b.dataset.sspOpen]);else if(b.hasAttribute('data-ssp-home'))view='home';else if(b.hasAttribute('data-ssp-sync')){save();return;}else return;save();draw();}
 function change(e){if(e.target.name==='ssp-remote-confidence'){remoteConfidence=e.target.value;save();return;}if(e.target.matches('[data-ssp-target]')){desiredCount=Number(e.target.value);draw(false);return;}if(e.target.name==='ssp-remote-choice'){remoteChoice=Number(e.target.value);remoteUnknown=false;save();return;}if(e.target.matches('[data-ssp-remote-integer]')){const value=e.target.value.trim();remoteUnknown=false;remoteChoice=/^-?\d+$/.test(value)&&Number.isSafeInteger(Number(value))&&Math.abs(Number(value))<=1000000000?Number(value):null;save();return;}if(e.target.matches('[data-ssp-free-unit]')){freeUnit=e.target.value;draw();return;}if(e.target.matches('[data-ssp-scope-book]')){selectedScopeBook=e.target.value;widen='type';invalidateSource();draw();querySource();return;}if(e.target.matches('[data-ssp-scope-unit]')){selectedScopeUnit=e.target.value;widen='type';invalidateSource();draw();querySource();return;}if(e.target.matches('[data-ssp-scope-type]')){selectedScopeType=e.target.value;widen='type';invalidateSource();draw();querySource();return;}if(e.target.name==='ssp-answer'){choice=Number(e.target.value);const button=container.querySelector('[data-ssp-check]');if(button)button.disabled=false;save();}else if(e.target.name==='ssp-confidence'){confidence=e.target.value;save();}else if(e.target.matches('[data-ssp-grade]')){state.grade=Number(e.target.value);save();draw();}else if(e.target.matches('[data-ssp-reason]')&&feedback){feedback.reason=e.target.value;save(feedback);}}
 function sessionChange(){epoch++;invalidateSource();remoteQuestion=null;remoteFeedback=null;remoteOperations.clear();remoteHistory={phase:'idle',records:[],hasMore:false,nextBefore:null};activeOwner=owner();current=null;pool=[];feedback=null;view='home';read();notice='로그인 상태가 바뀌어 현재 계정의 기록을 다시 확인했어요.';draw();}
 read();container.addEventListener('click',click);container.addEventListener('change',change);window.addEventListener('ds-session-change',sessionChange);if(options.resume&&typeof options.onReady!=='function')resume();draw(false);
 if(signed()&&activeOwner&&typeof options.loadProgress==='function'){const generation=epoch;Promise.resolve().then(()=>options.loadProgress({namespace:'student-paths-v1',ownerKey:activeOwner})).then(raw=>{if(closed||generation!==epoch)return;const remote=clean(raw);let cached=false;try{cached=Boolean(key()&&localStorage.getItem(key()));}catch{}const local=cached?state:remote;state=mergeProgress(remote,local);const comparable=x=>JSON.stringify({...x,records:[...x.records].sort((a,b)=>a.id.localeCompare(b.id))});if(comparable(state)!==comparable(remote))save();else{try{if(key())localStorage.setItem(key(),JSON.stringify(state));}catch{}emit();}draw(false);notifyReady();}).catch(()=>{if(closed||generation!==epoch)return;storageMessage='계정 기록을 불러오지 못했어요. 현재 기기의 기록을 보여드려요.';draw(false);notifyReady();});}else notifyReady();
 const controller={snapshot:()=>JSON.parse(JSON.stringify({...state,summary:summary(state),tier:tier(state),storage:storageMessage})),showHistory:()=>{view='history';draw();},resume:()=>{const ok=resume();if(ok)draw();return ok;},destroy:()=>{closed=true;epoch++;container.removeEventListener('click',click);container.removeEventListener('change',change);window.removeEventListener('ds-session-change',sessionChange);controllers.delete(container);if(lastController===controller)lastController=null;}};controllers.set(container,controller);lastController=controller;return controller.destroy;
}
window.DSStudentStudyPaths={render,bind,snapshot:()=>lastController?.snapshot()||null,showHistory:()=>lastController?.showHistory(),resume:()=>lastController?.resume()||false,courses:COURSES.map(c=>({...c})),catalog:()=>BANK.map(({id,version,course,type,level,subject,unit,book,sourceKind})=>({id,version,course,type,level,subject,unit,book,sourceKind})),books:BOOKS.map(b=>({...b,ids:[...b.ids]})),validateState:clean,mergeProgress};
})();
