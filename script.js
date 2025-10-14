document.getElementById("biodataForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = Object.fromEntries(new FormData(e.target).entries());

  const res = await fetch("https://biodata-form-production.up.railway.app/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const message = await res.text();
  alert(message);
  e.target.reset();
});
