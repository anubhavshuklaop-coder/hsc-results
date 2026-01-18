const form = document.getElementById("searchForm");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

function normName(s) {
  return String(s || "").trim().replace(/\s+/g, " ").toUpperCase();
}
function normSeat(s) {
  return String(s || "").trim().replace(/\s+/g, "").toUpperCase();
}

function setStatus(msg, type = "") {
  statusEl.textContent = msg;
  statusEl.style.color = type === "error" ? "#ff4d4d" : (type === "ok" ? "#2ecc71" : "#444");
}

async function loadYearData(year) {
  const res = await fetch(`data/${year}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error("Year data file not found.");
  return await res.json();
}

function renderResult(r) {
  const subjectsRows = (r.subjects || []).map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.theory ?? "-"}</td>
      <td>${s.practical ?? "-"}</td>
      <td>${s.total ?? "-"}</td>
      <td>${s.grade ?? "-"}</td>
    </tr>
  `).join("");

  resultEl.innerHTML = `
    <h3>Result Found ✅</h3>
    <p><b>Name:</b> ${r.studentName}</p>
    <p><b>Seat No:</b> ${r.seatNo}</p>
    <p><b>Year:</b> ${r.year}</p>
    <p><b>Stream:</b> ${r.stream || "-"}</p>
    <p><b>School:</b> ${r.school || "-"}</p>
    <p><b>Status:</b> ${r.resultStatus || "-"}</p>
    <p><b>Total:</b> ${r.totalMarks ?? "-"}</p>
    <p><b>Percentage:</b> ${r.percentage ?? "-"}%</p>

    <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%; margin-top:10px;">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Theory</th>
          <th>Practical</th>
          <th>Total</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody>${subjectsRows}</tbody>
    </table>
  `;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultEl.innerHTML = "";

  const year = document.getElementById("year").value;
  const seatNo = normSeat(document.getElementById("seatNo").value);
  const motherName = normName(document.getElementById("motherName").value);
  const fatherName = normName(document.getElementById("fatherName").value);

  setStatus("Searching...", "");

  try {
    const data = await loadYearData(year);

    const found = data.find(r =>
      normSeat(r.seatNo) === seatNo &&
      normName(r.motherName) === motherName &&
      normName(r.fatherName) === fatherName
    );

    if (!found) {
      setStatus("No record found. Check details and try again.", "error");
      return;
    }

    setStatus("Record found!", "ok");
    renderResult(found);
  } catch (err) {
    setStatus(err.message || "Something went wrong.", "error");
  }
});
